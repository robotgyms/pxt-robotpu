
# Maze solver tutorial (Robot PU)

This tutorial shows how to solve a maze using a classic strategy:

- **Right-hand rule** (follow the right wall)
- **Left-hand rule** (follow the left wall)

For **simply-connected mazes** (no “floating islands” of walls), either rule is **guaranteed** to reach an exit if one exists.

Robot PU doesn’t need a full map for this approach. It just needs to decide “turn / forward / turn around” based on sonar distance.

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
// Right-hand rule maze solver using robotPu.frontDistanceArray()
// d[0..4] are left -> right distance bins

// Distance thresholds (cm)
// These align with the extension's internal safety thresholds (~7.5cm danger + ~20cm caution)
const OPEN_CM = 28
const TOO_CLOSE_CM = 12

// Movement tuning
const FWD_SPEED = 1.8
const TURN_SPEED = 1.4

// Turn bias: -1 left, +1 right
const TURN_BIAS = 0.9

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function max2(a: number, b: number): number {
    return a > b ? a : b
}

function driveFor(ms: number, speed: number, turn: number): void {
    const t0 = control.millis()
    while (control.millis() - t0 < ms) {
        robotPu.walk(speed, turn)
        basic.pause(10)
    }
}

function stepForward(): void {
    // If we are too close, slow down to avoid bonking
    driveFor(220, FWD_SPEED, 0)
}

function turnRight90ish(): void {
    // Curved step to the right
    driveFor(380, TURN_SPEED, TURN_BIAS)
}

function turnLeft90ish(): void {
    // Curved step to the left
    driveFor(380, TURN_SPEED, -TURN_BIAS)
}

function turnAround(): void {
    // Two left turns (roughly 180)
    turnLeft90ish()
    basic.pause(50)
    turnLeft90ish()
}

basic.forever(function () {
    // 1) Read 5-bin front scan (left -> right)
    const d = robotPu.frontDistanceArray()

    const dLeft = max2(d[0], d[1])
    const dFront = d[2]
    const dRight = max2(d[3], d[4])

    const rightOpen = dRight > OPEN_CM
    const frontOpen = dFront > OPEN_CM
    const leftOpen = dLeft > OPEN_CM

    // 2) Emergency: if the center/front bin is very close, turn left immediately
    if (dFront > 0 && dFront < TOO_CLOSE_CM) {
        turnLeft90ish()
        return
    }

    // 3) Right-hand rule priority
    if (rightOpen) {
        turnRight90ish()
    } else if (frontOpen) {
        stepForward()
    } else if (leftOpen) {
        turnLeft90ish()
    } else {
        turnAround()
    }
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


