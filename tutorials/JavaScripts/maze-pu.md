
# Maze solver tutorial (Robot PU)

This tutorial shows how to solve a maze using a classic strategy:

- **follow the right wall** 
- **follow the left wall** 

For **simply-connected mazes** (no “floating islands” of walls), either rule is **guaranteed** to reach an exit if one exists.

Robot PU doesn’t need a full map for this approach. It just needs to decide “turn / forward / turn around” based on sonar distance.

## Knowledge
 - https://makecode.microbit.org/blocks/loops
 - https://makecode.microbit.org/javascript/statements
 - https://en.wikipedia.org/wiki/Maze-solving_algorithm

---

## Prerequisites

- Add the Robot PU extension in MakeCode
- Build a maze with walls the sonar can see (cardboard boxes, books, foam blocks)
- Use a surface with good traction (avoid glossy tables)

## What you will build

- A simple autonomous maze solver using `robotPu.walk(speed, turn)`
- A choice of **right-hand** or **left-hand** wall following

## Robot PU APIs used

Robot PU is an interactive STEM buddy controlled by a micro:bit. In this maze project, we rely on:

* **Movement**: `robotPu.walk(speed, turn)`
* **Sonar scan**: `robotPu.frontDistanceArray()`

---

## Why wall-following works (and when it fails)

### What “guaranteed to solve” means

If the maze is **simply connected** (all walls are connected to the outer boundary), then:

* Keeping your right hand on the wall (**right-hand rule**) will eventually lead you to the exit.
* Keeping your left hand on the wall (**left-hand rule**) will eventually lead you to the exit.

### When it can fail

Wall-following can loop forever in mazes with **islands** (walls not connected to the outer boundary). In those mazes, you need mapping (like `2d-map.md`) + exploration.

---

## Sensing strategy: `frontDistanceArray()` bins

Robot PU’s sonar faces ~35° downward. While walking, PU naturally sways, and the extension maintains a small “front scan” array.

In this updated tutorial we use:

* **Front scan array**: `robotPu.frontDistanceArray()`

It returns **5 distance bins** from **left to right**:

* `d[0]` = far left
* `d[1]` = left
* `d[2]` = center/front
* `d[3]` = right
* `d[4]` = far right

These bins are designed to give you a simple “left / front / right” view without moving the head.

Then we decide the next motion using a priority order.

## Decision rule (right-hand rule)

1. If **right is open** → turn right
2. Else if **front is open** → go forward
3. Else if **left is open** → turn left
4. Else → turn around

---

## Implementation: right-hand rule (recommended starting point)

Copy this code into the **JavaScript** tab of the MakeCode Editor.

```typescript

const OPEN_MIN_CM = 26
const TOO_CLOSE_CM = 12
const OPEN_MARGIN_CM = 12
const CLOSE_MARGIN_CM = 6
const WALL_TRACK_MAX_CM = 40

const EMA_ALPHA = 0.35
const BETA = 0.55
const CLAMP_MAX_CM = 200

let emaState: number[] = [0, 0, 0, 0, 0]

let leftOpen = false
let frontOpen = false
let rightOpen = false

let leftWallRef = 18
let rightWallRef = 18
let frontWallRef = 20

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function median3(a: number, b: number, c: number): number {
    const arr = [a, b, c]
    arr.sort((x, y) => x - y)
    return arr[1]
}

function ema(prev: number, x: number, a: number): number {
    if (prev <= 0) return x
    return prev + a * (x - prev)
}

function max2(a: number, b: number): number {
    return a > b ? a : b
}

function hysteresisUpdate(isOpen: boolean, d: number, openOn: number, openOff: number): boolean {
    if (isOpen) {
        if (d > 0 && d < openOff) return false
        return true
    } else {
        if (d > openOn) return true
        return false
    }
}

function filteredBins(): number[] {
    const a = robotPu.frontDistanceArray()
    basic.pause(5)
    const b = robotPu.frontDistanceArray()
    basic.pause(5)
    const c = robotPu.frontDistanceArray()

    const out: number[] = [0, 0, 0, 0, 0]
    for (let i = 0; i < 5; i++) {
        const raw = clampInt(a[i], 0, CLAMP_MAX_CM)
        const med = median3(a[i], b[i], c[i])
        const medC = clampInt(med, 0, CLAMP_MAX_CM)

        emaState[i] = ema(emaState[i], medC, EMA_ALPHA)
        out[i] = BETA * raw + (1 - BETA) * emaState[i]
    }
    return out
}

function updateWallRef(prev: number, d: number, a: number): number {
    if (d > 0 && d < WALL_TRACK_MAX_CM) {
        return ema(prev, d, a)
    }
    return prev
}

robotPu.setChannel(166)
basic.forever(function () {
    const d = filteredBins()

    const dLeft = max2(d[0], d[1])
    const dFront = d[2]
    const dRight = max2(d[3], d[4])

    leftWallRef = updateWallRef(leftWallRef, dLeft, 0.08)
    rightWallRef = updateWallRef(rightWallRef, dRight, 0.08)
    frontWallRef = updateWallRef(frontWallRef, dFront, 0.05)

    const rightOn = Math.max(OPEN_MIN_CM, rightWallRef + OPEN_MARGIN_CM)
    const rightOff = Math.max(OPEN_MIN_CM - 2, rightWallRef + CLOSE_MARGIN_CM)
    const frontOn = Math.max(OPEN_MIN_CM, frontWallRef + OPEN_MARGIN_CM)
    const frontOff = Math.max(OPEN_MIN_CM - 2, frontWallRef + CLOSE_MARGIN_CM)

    rightOpen = hysteresisUpdate(rightOpen, dRight, rightOn, rightOff)
    frontOpen = hysteresisUpdate(frontOpen, dFront, frontOn, frontOff)

    const safeSpeed = Math.map(Math.max(dRight, dLeft), 7, 25, 0, 3)

    if (dFront > 0 && dFront < TOO_CLOSE_CM) {
        robotPu.walk(1.6, -0.9)
    } else if (rightOpen) {
        robotPu.walk(safeSpeed, 0.35)
    } else if (frontOpen) {
        robotPu.walk(safeSpeed, 0)
    } else {
        robotPu.walk(1.6, -0.9)
    }

    radio.sendValue("fd0", d[0])
    radio.sendValue("fd1", d[1])
    radio.sendValue("fd2", d[2])
    radio.sendValue("fd3", d[3])
    radio.sendValue("fd4", d[4])
})
```

## Left-hand rule variant

If you want to follow the **left wall** instead, flip the priority order:

1. If **left is open** → turn left
2. Else if **front is open** → go forward
3. Else if **right is open** → turn right
4. Else → turn around

You can implement it by changing the decision section:

```typescript
// Left-hand rule priority
if (leftOpen) {
    turnLeft90ish()
} else if (frontOpen) {
    stepForward()
} else if (rightOpen) {
    turnRight90ish()
} else {
    turnAround()
}
```

---

## Testing and calibration

1. **Build a maze**:
   1. Use cardboard walls or blocks that sonar can detect.
   2. Make the corridors wide enough for Robot PU to walk.
2. **Tune thresholds**:
   1. If PU scrapes walls, increase `OPEN_CM` and/or increase `TOO_CLOSE_CM`.
   2. If PU refuses to enter corridors, decrease `OPEN_CM`.
3. **Tune turning**:
   1. If turns are too small, increase turn duration in `turnRight90ish()` / `turnLeft90ish()`.
   2. If turns overshoot, decrease duration or reduce `TURN_BIAS`.

## Troubleshooting

- **Robot scrapes walls**
  - increase `OPEN_CM`
  - slow down: reduce `FWD_SPEED`
- **Robot turns too late and bonks**
  - increase `TOO_CLOSE_CM`
  - increase the emergency turn duration
- **Robot oscillates in narrow corridors**
  - reduce `TURN_BIAS`
  - reduce `TURN_SPEED`
- **Robot gets stuck turning in place**
  - reduce `OPEN_CM` (it may think everything is blocked)
  - increase `stepForward()` duration slightly

---

## Next steps (upgrade path)

Wall following is simple and robust, but it does not “understand” the maze.

Next upgrades (based on `2d-map.md`):

* **Local map validation**: update a 5×5 occupancy grid from the same left/front/right scans.
* **Detect loops**: if you revisit the same local pattern many times, switch strategy.
* **Hybrid solver**: follow the wall, but if stuck, use the occupancy map to choose an alternative.

---


