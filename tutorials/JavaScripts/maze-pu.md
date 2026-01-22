
# 🤖 Robot PU: Maze Solver (Left-Wall / Right-Wall Following) Project Wiki

Welcome to the official project repository for **Robot PU (Pair Up)**. In this project, we solve a maze using a classic navigation strategy:

* **Right-hand rule** (follow the right wall)
* **Left-hand rule** (follow the left wall)

For **simply-connected mazes** (no “floating islands” of walls), either rule is **guaranteed** to reach an exit if one exists.

This tutorial builds on the sensor scanning idea from `2d-map.md`: we use the **down-tilted sonar** plus **head yaw** to scan **left / front / right** and make decisions.

---

## 📂 1. Introduction to Robot PU

Robot PU is an interactive STEM buddy controlled by a micro:bit. In this maze project, we rely on:

* **Movement**: `robotPu.walk(speed, turn)`
* **Sonar distance**: `robotPu.sonarDistanceCm()`
* **Head yaw servo** (to scan): `robotPu.servo(robotPu.ServoJoint.HeadYaw, angle)`

---

## 🧭 2. The Wall-Following Guarantee (Why it works)

### What “guaranteed to solve” means

If the maze is **simply connected** (all walls are connected to the outer boundary), then:

* Keeping your right hand on the wall (**right-hand rule**) will eventually lead you to the exit.
* Keeping your left hand on the wall (**left-hand rule**) will eventually lead you to the exit.

### When it can fail

Wall-following can loop forever in mazes with **islands** (walls not connected to the outer boundary). In those mazes, you need mapping (like `2d-map.md`) + exploration.

---

## 🛠️ 3. Hardware & Sensing Strategy

Robot PU’s sonar faces ~35° downward. While walking, PU sways, and we can also **intentionally steer the head yaw** to sample distances at different directions.

We will measure three directions:

* **Right**: head yaw ~ `90 + YAW_SCAN`
* **Front**: head yaw `90`
* **Left**: head yaw ~ `90 - YAW_SCAN`

Then we decide the next motion using a priority order:

### Right-hand rule priority

1. If **right is open** → turn right
2. Else if **front is open** → go forward
3. Else if **left is open** → turn left
4. Else → turn around

---

## 💻 4. Implementation Script

Copy this code into the **JavaScript** tab of the MakeCode Editor.

```typescript
// Choose which wall to follow
const FOLLOW_RIGHT_WALL = true

// Head yaw scan angles
const YAW_CENTER = 90
const YAW_SCAN = 35

// Distance thresholds (cm)
const OPEN_CM = 25
const TOO_CLOSE_CM = 10

// Movement tuning
const FWD_SPEED = 1.6
const TURN_SPEED = 1.2

// Turn bias: -1 left, +1 right
const TURN_BIAS = 0.9

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function headYaw(angle: number): void {
    robotPu.servo(robotPu.ServoJoint.HeadYaw, clampInt(angle, 0, 180))
}

function readDistanceAtYaw(yaw: number): number {
    headYaw(yaw)
    basic.pause(60)

    // Take a small average to reduce jitter
    let sum = 0
    for (let i = 0; i < 3; i++) {
        sum += robotPu.sonarDistanceCm()
        basic.pause(10)
    }
    return sum / 3
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
    // 1) Scan three directions
    const dRight = readDistanceAtYaw(YAW_CENTER + YAW_SCAN)
    const dFront = readDistanceAtYaw(YAW_CENTER)
    const dLeft = readDistanceAtYaw(YAW_CENTER - YAW_SCAN)

    // Return head to center for walking
    headYaw(YAW_CENTER)

    const rightOpen = dRight > OPEN_CM
    const frontOpen = dFront > OPEN_CM
    const leftOpen = dLeft > OPEN_CM

    // 2) Emergency: if front is very close, prioritize turning away
    if (dFront < TOO_CLOSE_CM) {
        if (FOLLOW_RIGHT_WALL) turnLeft90ish()
        else turnRight90ish()
        return
    }

    // 3) Wall follower decision
    if (FOLLOW_RIGHT_WALL) {
        if (rightOpen) {
            turnRight90ish()
        } else if (frontOpen) {
            stepForward()
        } else if (leftOpen) {
            turnLeft90ish()
        } else {
            turnAround()
        }
    } else {
        // Left-hand rule (mirror priority)
        if (leftOpen) {
            turnLeft90ish()
        } else if (frontOpen) {
            stepForward()
        } else if (rightOpen) {
            turnRight90ish()
        } else {
            turnAround()
        }
    }
})

```

---

## 🧪 5. Testing & Calibration

1. **Build a maze**:
   1. Use cardboard walls or blocks that sonar can detect.
   2. Make the corridors wide enough for Robot PU to walk.
2. **Tune thresholds**:
   1. If PU scrapes walls, increase `OPEN_CM` and/or increase `TOO_CLOSE_CM`.
   2. If PU refuses to enter corridors, decrease `OPEN_CM`.
3. **Tune turning**:
   1. If turns are too small, increase turn duration in `turnRight90ish()` / `turnLeft90ish()`.
   2. If turns overshoot, decrease duration or reduce `TURN_BIAS`.

---

## 🚀 6. Next Steps (Link to 2D mapping)

Wall following is simple and robust, but it does not “understand” the maze.

Next upgrades (based on `2d-map.md`):

* **Local map validation**: update a 5×5 occupancy grid from the same left/front/right scans.
* **Detect loops**: if you revisit the same local pattern many times, switch strategy.
* **Hybrid solver**: follow the wall, but if stuck, use the occupancy map to choose an alternative.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
