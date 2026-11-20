# Maze Map Building and Known-Map Racing (Robot PU)

In this tutorial Robot PU is placed inside a **6x6 grid maze**. Each grid cell is **220 mm x 220 mm**, so the whole arena is about **1.32 m x 1.32 m**.

You will:

1. Define a maze map and wall locations in code.
2. Use the built-in explore behavior to map an **unknown** maze efficiently.
3. Use a **known** map to race through the maze on the shortest path while always knowing which cell the robot is in.

---

## 1. Problem definition

Robot PU starts in one cell of the maze. The goal cell is somewhere else. Walls sit on grid lines between cells — they are never diagonal and never cut through a cell, which makes the problem much easier than free-space navigation.

There are two phases:

* **Phase A — explore**: the maze is unknown. PU must wander, sense walls, and build the map itself.
* **Phase B — race**: the maze map is known (either hand-coded or discovered in phase A). PU should reach the goal as fast as possible and report its location.

The hard part: PU cannot see the whole maze. Its only "eye" is a single sonar that produces **5 distance readings covering the forward hemisphere**. It never directly sees walls to its left, right, or behind.

---

## 2. Problem analysis

### What the robot knows

| Sensor | API | Gives you | Weakness |
|---|---|---|---|
| Sonar point cloud | `robotPuPro.sonarScan()` then `robotPuPro.frontDistanceArray()` | 5 bins `[left, front-left, front, front-right, right]` in **cm** | Forward hemisphere only; side and rear walls are invisible until PU turns toward them |
| Compass | `input.compassHeading()` | Absolute heading 0–359° | Needs calibration; noisy near magnets/motors; a few degrees of jitter |
| Odometry | `robotPuPro.locationArray()` | `[x_mm, y_mm, theta_deg]` estimated pose | Dead reckoning — every foot slip adds permanent error |

### Consequences

* **Heading**: trust the compass, not odometry theta. Compass error does not accumulate; odometry theta error does.
* **Position**: trust odometry for short distances only. One cell is 220 mm — short enough that odom error inside a single cell move stays small.
* **Walls**: only the bins pointing roughly forward are reliable. We mark a wall when the *front* bins see something closer than a cell boundary. Side walls get discovered when PU later faces them — or are never needed if the path never goes there.
* **Memory**: a micro:bit cannot afford a float occupancy grid over the whole arena. But a grid maze only needs **36 cells x 4 wall bits** — that fits in a tiny integer array.

### The key insight

Because walls only exist on grid lines, "where am I" collapses from a continuous pose `(x, y, theta)` into a **cell index** `(cx, cy)` plus a **direction** `N/E/S/W`. Mapping becomes bookkeeping: which edges between cells are blocked.

---

## 3. Ideas

* **Idea 1 — wall bitmask.** Store one byte per cell. Bit 0 = north wall, bit 1 = east, bit 2 = south, bit 3 = west. Every wall is recorded on both cells that share it, so lookups never need a neighbor check.
* **Idea 2 — ASCII maze definition.** Write the maze as text: `-`/`|` for walls, `.` for open. Two small string tables describe every wall location — human-readable and easy to redraw on paper first.
* **Idea 3 — fuse compass + odometry for cell tracking.** Command motion in compass headings (so driving is always grid-aligned), and use odometry displacement projected onto the driving axis to decide when PU has crossed into the next cell.
* **Idea 4 — explore = depth-first search.** Prefer unvisited open neighbors; when stuck, backtrack through known-open cells. Each sonar reading either confirms open space or records a wall.
* **Idea 5 — known map = flood fill.** Run breadth-first search from the goal over the wall bitmask. Every cell gets a distance-to-goal; the robot just steps downhill. No searching at all — pure shortest-path execution.

So: **can a known map make PU faster and localize it?** Yes. Exploration is expensive because the robot must try wrong branches and backtrack. With a map, BFS pre-computes the shortest route, `walkByCompass` drives it directly, and the tracked cell index *is* the robot's location on the map. Sections 5 and 6 build exactly this.

---

## 4. Map representation

Direction constants and grid steps:

```text
             N (dir 0) — heading 0
W (dir 3) — heading 270  [cell]  E (dir 1) — heading 90
             S (dir 2) — heading 180
```

* Cell `(0,0)` is the **north-west** corner; `cx` grows east, `cy` grows south.
* Wall bits: `N=1, E=2, S=4, W=8` → a cell byte of `0b0101` means walls north and south.

### Defining wall locations as text

Horizontal walls (between rows) need `ROWS+1` lines of `COLS` characters. Vertical walls need `ROWS` lines of `COLS+1` characters. The outer border is all walls.

```typescript
// Horizontal walls: 7 lines of 6 chars. "-" = wall, "." = open
const H_LINES = [
    "------",   // north border
    "..-...",
    "......",
    "-...--",
    "......",
    "..-...",
    "------",   // south border
]

// Vertical walls: 6 lines of 7 chars. "|" = wall, "." = open
const V_LINES = [
    "|..|..|",
    "|.|...|",
    "|....||",
    "|..|..|",
    "|.|...|",
    "|....||",
]
```

Drawn out, that maze looks like:

```text
+--+--+--+--+--+--+
|        |        |
+  +  +--+  +  +  +
|     |           |
+  +  +  +  +  +  +
|              |  |
+--+  +  +  +--+--+
|        |        |
+  +  +  +  +  +  +
|     |           |
+  +  +--+  +  +  +
|              |  |
+--+--+--+--+--+--+
```

### Map helpers

```typescript
const COLS = 6
const ROWS = 6
const CELL_MM = 220

const N = 0
const E = 1
const S = 2
const W = 3
const BIT = [1, 2, 4, 8]
const GX = [0, 1, 0, -1]
const GY = [-1, 0, 1, 0]
const HEADING = [0, 90, 180, 270]

let wallBits: number[] = []
let seen: number[] = []

function bit(cx: number, cy: number, dir: number) {
    wallBits[cy * COLS + cx] |= BIT[dir]
}

function setWall(cx: number, cy: number, dir: number) {
    bit(cx, cy, dir)
    const nx = cx + GX[dir]
    const ny = cy + GY[dir]
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
        bit(nx, ny, (dir + 2) % 4)   // mirror onto the neighbor
    }
}

function hasWall(cx: number, cy: number, dir: number): boolean {
    return (wallBits[cy * COLS + cx] & BIT[dir]) != 0
}

function open(cx: number, cy: number, dir: number): boolean {
    const nx = cx + GX[dir]
    const ny = cy + GY[dir]
    return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !hasWall(cx, cy, dir)
}

function loadMap() {
    wallBits = []
    seen = []
    for (let i = 0; i < COLS * ROWS; i++) {
        wallBits.push(0)
        seen.push(0)
    }
    for (let y = 0; y <= ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (H_LINES[y].charAt(x) == "-") {
                if (y < ROWS) bit(x, y, N)
                if (y > 0) bit(x, y - 1, S)
            }
        }
    }
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x <= COLS; x++) {
            if (V_LINES[y].charAt(x) == "|") {
                if (x < COLS) bit(x, y, W)
                if (x > 0) bit(x - 1, y, E)
            }
        }
    }
}
```

For an **unknown** maze, use `loadBordersOnly()` instead of `loadMap()` — it sets just the outer walls and lets the explorer in section 5 discover the rest:

```typescript
function loadBordersOnly() {
    wallBits = []
    seen = []
    for (let i = 0; i < COLS * ROWS; i++) {
        wallBits.push(0)
        seen.push(0)
    }
    for (let x = 0; x < COLS; x++) {
        setWall(x, 0, N)
        setWall(x, ROWS - 1, S)
    }
    for (let y = 0; y < ROWS; y++) {
        setWall(0, y, W)
        setWall(COLS - 1, y, E)
    }
}
```

---

## 5. Exploring an unknown maze

### Strategy

1. Scan → read the 5 front bins.
2. If the front bins see something closer than `WALL_CM`, record a wall in the current driving direction.
3. Track the odom pose; when the robot has advanced ~`ADVANCE_MM` along its driving axis, it has entered the next cell.
4. On entering a cell (or when a wall blocks the current direction), pick a new direction: **unvisited open neighbor first**, else **backtrack along a trail stack** — the DFS path of cells walked so far. (Just picking "any open neighbor" to backtrack can ping-pong between two cells forever; the stack guarantees the robot unwinds the path it actually took.)
5. Drive with `walkByCompass(HEADING[dir])` — the built-in avoidance keeps PU centered while the compass holds the grid heading.

```typescript
const WALL_CM = 16        // front bins closer than this = wall at the boundary
const ADVANCE_MM = 170    // projected travel that means "entered next cell"

let cx = 0
let cy = ROWS - 1         // start: south-west cell
let dir = N               // start facing north
let refX = 0
let refY = 0
let exploring = true

// odom frame: heading 0 faces +y, east is +x (verify once on your robot)
const OX = [0, 1, 0, -1]
const OY = [1, 0, -1, 0]

function trackCell(): boolean {
    const p = robotPuPro.locationArray()
    const progress = (p[0] - refX) * OX[dir] + (p[1] - refY) * OY[dir]
    if (progress > ADVANCE_MM) {
        cx += GX[dir]
        cy += GY[dir]
        refX = p[0]
        refY = p[1]
        return true
    }
    return false
}

let trail: number[] = []   // DFS path stack of cell indices; top = current cell

function dirTo(tx: number, ty: number): number {
    for (let d = 0; d < 4; d++) {
        if (cx + GX[d] == tx && cy + GY[d] == ty) return d
    }
    return -1
}

function chooseDir(): number {
    // prefer unvisited open neighbors (depth-first)
    for (let d = 0; d < 4; d++) {
        if (open(cx, cy, d) && !seen[(cy + GY[d]) * COLS + cx + GX[d]]) return d
    }
    // nothing new here — step back along the trail
    if (trail.length > 1) {
        const prev = trail[trail.length - 2]
        return dirTo(prev % COLS, Math.floor(prev / COLS))
    }
    return -1   // back at the start cell: exploration complete
}

function seenCount(): number {
    let n = 0
    for (let i = 0; i < COLS * ROWS; i++) n += seen[i]
    return n
}
```

Main loop:

```typescript
loadBordersOnly()  // blind run; swap in loadMap() to skip re-discovering a known maze
robotPuPro.resetOdom()
const startPose = robotPuPro.locationArray()
refX = startPose[0]
refY = startPose[1]
trail = [cy * COLS + cx]

basic.forever(function () {
    if (!exploring) return

    robotPuPro.sonarScan()
    const d = robotPuPro.frontDistanceArray()
    const front = Math.min(d[1], Math.min(d[2], d[3]))
    if (front < WALL_CM) setWall(cx, cy, dir)

    const moved = trackCell()
    if (moved) {
        const here = cy * COLS + cx
        if (trail.length > 1 && here == trail[trail.length - 2]) {
            trail.pop()          // completed one backtrack step
        } else if (!seen[here]) {
            trail.push(here)     // entered a brand-new cell
        }
    }
    seen[cy * COLS + cx] = 1

    if (hasWall(cx, cy, dir) || moved) {
        const nd = chooseDir()
        if (nd < 0 || seenCount() >= COLS * ROWS) {
            exploring = false
            robotPuPro.stop()
            basic.showIcon(IconNames.Happy)
            return
        }
        dir = nd
    }
    robotPuPro.walkByCompass(HEADING[dir])
})
```

Notes:

* We drive with `walkByCompass()` rather than the built-in `robotPuPro.explore()` on purpose: `explore()` wanders toward whichever direction looks most open, but it cannot be *aimed* — a mapper needs to choose directions deliberately (prefer unvisited cells, backtrack on dead ends). `walkByCompass()` still runs the same sonar-scan-and-avoid machinery underneath, so you keep the safety behavior while the map decides where to go.
* The side and rear walls of a cell are learned only when PU faces them later — that is the price of a forward-only 5-bin scan, and DFS naturally turns the robot toward unexplored directions.
* `walkByCompass` already calls `sonarScan()` internally, so the point cloud stays fresh even on loop iterations where PU just drives.
* Verify the odom axis convention once: reset, walk north, and print `locationArray()`. If `y` decreases instead of increasing, flip the signs in `OY`.

---

## 6. Racing a known maze

With the wall bitmask known, replace search with **flood fill**: BFS from the goal labels every cell with its distance-to-goal. The robot then always steps to the neighbor with the smallest label — the shortest path with zero wrong turns.

```typescript
const GOAL_X = 5
const GOAL_Y = 0

let dist: number[] = []

function floodFill() {
    dist = []
    for (let i = 0; i < COLS * ROWS; i++) dist.push(999)
    const queue: number[] = [GOAL_Y * COLS + GOAL_X]
    dist[GOAL_Y * COLS + GOAL_X] = 0
    while (queue.length > 0) {
        const cur = queue.shift()
        const x = cur % COLS
        const y = Math.floor(cur / COLS)
        for (let d = 0; d < 4; d++) {
            if (!open(x, y, d)) continue
            const ni = (y + GY[d]) * COLS + x + GX[d]
            if (dist[ni] > dist[cur] + 1) {
                dist[ni] = dist[cur] + 1
                queue.push(ni)
            }
        }
    }
}

let racing = true

// race setup — reuses the globals and helpers from sections 4 and 5
loadMap()
floodFill()
cx = 0
cy = ROWS - 1
dir = N
robotPuPro.resetOdom()
const pose0 = robotPuPro.locationArray()
refX = pose0[0]
refY = pose0[1]

basic.forever(function () {
    if (!racing) return

    trackCell()
    if (cx == GOAL_X && cy == GOAL_Y) {
        racing = false
        robotPuPro.stop()
        basic.showIcon(IconNames.Yes)
        return
    }
    // step downhill on the distance field
    let best = dist[cy * COLS + cx]
    for (let d = 0; d < 4; d++) {
        if (!open(cx, cy, d)) continue
        const ni = (cy + GY[d]) * COLS + cx + GX[d]
        if (dist[ni] < best) {
            best = dist[ni]
            dir = d
        }
    }
    robotPuPro.walkByCompass(HEADING[dir])
})
```

### Does the robot know where it is?

Yes — `(cx, cy)` is continuously maintained by `trackCell()`, so PU's grid location is always known, and `dist[cy*COLS+cx]` even tells it how many cells remain. If you print `locationArray()` alongside, you can also watch the raw odometry drift while the cell estimate stays correct, because each cell transition re-anchors the reference pose.

You can go further and **correct** odometry with the map: if `frontDistanceArray()` reports open space where the map says a wall is 110 mm away (or vice versa), the cell estimate is probably off — snap `refX/refY` to the nearest cell-center pose (`cx*220+110`, `cy*220+110` in world mm) to reset the drift.

---

## 7. Tuning and limitations

| Constant | Meaning | Tune when |
|---|---|---|
| `WALL_CM` | Front distance that counts as a boundary wall | PU marks phantom walls (lower it) or misses walls (raise it) |
| `ADVANCE_MM` | Projected travel = one cell crossing | Cell index jumps early/late; ~150–200 works for 220 mm cells |
| `kp` in `walkByCompassPID` | Heading correction strength | PU weaves or responds too slowly to wall corrections |

* Calibrate the compass before each run (`input.calibrateCompass()` or wave the robot in a figure-8).
* Walls must be tall enough to catch the down-tilted sonar cone — cardboard or foam blocks ~10 cm+ work well.
* DFS exploration is simple but not optimal — it can backtrack across the whole maze. Upgrades: flood-fill exploration (steer toward the nearest *unvisited* cell, same BFS as section 6), or share `wallBits` over radio so a second PU benefits (`shared-map-pu.md`).

---

## Robot PU APIs used

* `robotPuPro.sonarScan()` / `robotPuPro.frontDistanceArray()` — 5-bin forward scan
* `robotPuPro.explore()` — built-in wandering (alternative to custom DFS)
* `robotPuPro.walkByCompass(heading)` / `walkByCompassPID(...)` — heading-locked walking with obstacle avoidance
* `robotPuPro.resetOdom()` / `robotPuPro.locationArray()` / `robotPuPro.stepCount()` — odometry pose
* `robotPuPro.walk(speed, turn)` / `robotPuPro.stop()` — low-level motion
* `input.compassHeading()` — micro:bit compass

## Next steps

* `maze-pu.md` — wall-following without a map
* `occupancy-grid-pu.md` — probabilistic mapping for non-grid worlds
* `path-planning-pu.md` — A* and friends on a known map
* `heading-fusion-pu.md` — combine compass + odometry theta properly
