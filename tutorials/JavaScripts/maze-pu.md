
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

function clampInt (x: number, lo: number, hi: number) {
    if (x < lo) {
        return lo
    }
    if (x > hi) {
        return hi
    }
    return x
}
let leftOpen = false
let frontOpen = false
let rightOpen = false
let dRight = 0
let dFront = 0
let dLeft = 0
let d: number[] = []
let t0 = 0
let TURN_BIAS = 0
let FWD_SPEED = 0

robotPu.setChannel(166)
// Distance thresholds (cm)
// These align with the extension's internal safety thresholds (~7.5cm danger + ~20cm caution)
let OPEN_CM = 30
// Movement tuning
FWD_SPEED = 4
// Turn bias: -1 left, +1 right
TURN_BIAS = 0.
basic.forever(function () {
    robotPu.sonarScan()
    // 1) Read 5-bin front scan (left -> right)
    d = robotPu.frontDistanceArray()
    dLeft = (dLeft * 9+ d[0]) * 0.1
    dFront = (dFront * 9 + d[2]) * 0.1
    dRight = (dRight * 9 + d[4]) *0.1
    rightOpen = dRight > OPEN_CM
    frontOpen = dFront > OPEN_CM *0.8
    leftOpen = dLeft > OPEN_CM * 0.4
    FWD_SPEED = Math.map(Math.max(dRight, dLeft), 7, 20, -1, 3)
    // 3) Right-hand rule priority
    if (rightOpen) {
        robotPu.walk(FWD_SPEED, 0.2)
    } else if (frontOpen) {
        robotPu.walk(FWD_SPEED, 0)
    } else {
        robotPu.explore()
    }
    radio.sendValue("fd0", d[0])
    radio.sendValue("fd1", d[1])
    radio.sendValue("fd2", d[2])
    radio.sendValue("fd3", d[3])
    radio.sendValue("fd4", d[4])
    radio.sendValue("broll", robotPu.bodyRoll())
    radio.sendValue("bpitch", robotPu.bodyPitch())
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


