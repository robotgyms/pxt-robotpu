
# 🤖 Robot PU: 2D Sonar Occupancy Grid (5×5 Map) Project Wiki

Welcome to the official project repository for **Robot PU (Pair Up)**. In this project, we turn PU’s **down-tilted sonar sensor** into a simple “scanner” and build a **local 2D obstacle probability map** around the robot.

We represent the map as a **5×5 matrix** where:

* The robot is at **(2,2)** (center).
* Each cell stores a **probability of obstacles** (0–100).
* The map is displayed directly on the micro:bit **5×5 LED matrix**.

---

## 📂 1. Introduction to Robot PU

**Robot PU** is an interactive STEM buddy controlled by a micro:bit. He is known for his:

* **Advanced Movement**: Walking with `robotPuPro.walk(speed, turn)`.
* **Sensor Awareness**: Reading distance with `robotPuPro.sonarDistanceCm()`.
* **Actuation**: Controlling head servos with `robotPuPro.servo(...)`.

---

## 🗺️ 2. Project: Construct a 2D Map From a Swaying Sonar

### Problem Definition

Robot PU’s sonar faces **~35° downward** toward the ground. When PU walks, his body sways left/right, and the sensor effectively scans across the area in front of him.

We want to use a time series of:

* **Compass heading** (direction the robot is facing)
* **Sonar left/right yaw angle** (scan angle)
* **Sonar distance** (range)
* **Robot speed** (the speed you command)

to construct a local **2D occupancy map** around PU.

### The Solution: A 5×5 Probabilistic Occupancy Grid

We maintain a grid `grid[5][5]` where each cell is a probability (0–100):

* **50** means “unknown”.
* Higher values mean “more likely obstacle”.
* Lower values mean “more likely free space”.

Each sonar reading updates:

* **Free cells along the ray**: probability decreases (more free).
* **The hit cell** (where the obstacle is measured): probability increases (more occupied).

---

## 🛠️ 3. Hardware & Coordinate Assumptions

### Sensors / Actuators used

* `robotPuPro.sonarDistanceCm()` for distance.
* `input.compassHeading()` for heading (0–359°).
* `robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, angle)` to sweep/track yaw.

### Geometry model (simple but useful)

* Sonar pitch is fixed at **35° downward**.
* We approximate the forward ground-projected range as:

`horizontal_cm = distance_cm * cos(35°)`

This is not perfect for all obstacles, but it gives a usable 2D projection.

### Map resolution

* 5×5 grid, robot at center.
* Each cell represents a square of `CELL_CM` centimeters (tunable).

---

## 💻 4. Implementation Script

Copy this code into the **JavaScript** tab of the MakeCode Editor.

```typescript
const GRID = 5
const CENTER = 2

const CELL_CM = 20
const PITCH_DEG = 35

const P_UNKNOWN = 50
const P_MIN = 0
const P_MAX = 100

const P_HIT_INC = 15
const P_FREE_DEC = 4
const P_DECAY = 1

const MAX_USE_CM = 200

let grid: number[][] = []

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function initGrid(): void {
    grid = []
    for (let y = 0; y < GRID; y++) {
        const row: number[] = []
        for (let x = 0; x < GRID; x++) row.push(P_UNKNOWN)
        grid.push(row)
    }
}

function decayGrid(): void {
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            let v = grid[y][x]
            if (v > P_UNKNOWN) v -= P_DECAY
            else if (v < P_UNKNOWN) v += P_DECAY
            grid[y][x] = v
        }
    }
}

function addProb(x: number, y: number, dv: number): void {
    if (x < 0 || x >= GRID || y < 0 || y >= GRID) return
    grid[y][x] = clampInt(grid[y][x] + dv, P_MIN, P_MAX)
}

function drawGrid(): void {
    led.clear()
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            let v = grid[y][x]
            let b = Math.map(v, 0, 100, 0, 120)
            led.plotBrightness(x, y, b)
        }
    }
    led.plotBrightness(CENTER, CENTER, 255)
}

function rayUpdate(cx: number, cy: number, hx: number, hy: number): void {
    // Bresenham-style grid ray trace: mark free cells up to (but not including) hit
    let x0 = cx
    let y0 = cy
    let x1 = hx
    let y1 = hy

    let dx = Math.abs(x1 - x0)
    let sx = x0 < x1 ? 1 : -1
    let dy = -Math.abs(y1 - y0)
    let sy = y0 < y1 ? 1 : -1
    let err = dx + dy

    while (true) {
        if (x0 == x1 && y0 == y1) break
        addProb(x0, y0, -P_FREE_DEC)
        let e2 = 2 * err
        if (e2 >= dy) {
            err += dy
            x0 += sx
        }
        if (e2 <= dx) {
            err += dx
            y0 += sy
        }
        if (x0 < 0 || x0 >= GRID || y0 < 0 || y0 >= GRID) break
    }
}

function degToRad(d: number): number {
    return d * Math.PI / 180
}

function cosDeg(d: number): number {
    return Math.cos(degToRad(d))
}

function sinDeg(d: number): number {
    return Math.sin(degToRad(d))
}

function yawAngleFromSway(t: number): number {
    // Simulate left/right scan using time. If you already command head yaw elsewhere,
    // set yawDeg to the angle you command.
    return 25 * Math.sin(t / 600)
}

initGrid()

// You can change this during experiments; we treat it as the robot “speed” time series.
let commandedSpeed = 1.5
let commandedTurn = 0

basic.forever(function () {
    // 1) Command movement (this is the “speed time series”)
    robotPuPro.walk(commandedSpeed, commandedTurn)

    // 2) Time series inputs
    const t = control.millis()
    const headingDeg = input.compassHeading()
    const yawDeg = yawAngleFromSway(t)

    // Optional: actively drive the head yaw to match the scan model
    const headYawServo = clampInt(90 + yawDeg, 0, 180)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, headYawServo)

    const distCm = robotPuPro.sonarDistanceCm()
    if (distCm <= 0 || distCm > MAX_USE_CM) {
        decayGrid()
        drawGrid()
        basic.pause(50)
        return
    }

    // 3) Project sonar to ground-plane distance
    const horizCm = distCm * cosDeg(PITCH_DEG)

    // 4) Convert reading into a local (robot-centered) 2D point
    // We keep a LOCAL map with the robot always centered. Compass is included as a time series
    // signal you can log/use later; for this 5×5 local grid, we mainly use yaw.
    const fwd = horizCm * cosDeg(yawDeg)
    const left = horizCm * sinDeg(yawDeg)

    // 5) Convert centimeters to grid cell index
    // x: left/right (0..4), y: forward/back (0..4)
    // forward should go “up” on the LED matrix, so subtract from CENTER.
    const gx = clampInt(CENTER + Math.round(left / CELL_CM), 0, GRID - 1)
    const gy = clampInt(CENTER - Math.round(fwd / CELL_CM), 0, GRID - 1)

    // 6) Probabilistic update
    decayGrid()
    rayUpdate(CENTER, CENTER, gx, gy)
    addProb(gx, gy, P_HIT_INC)

    // 7) Render
    drawGrid()

    // Heading is available here if you want to transmit/log it:
    // headingDeg
    basic.pause(50)
})

```

---

## 🧪 5. Testing & Calibration

1. **Calibrate compass**: In MakeCode, make sure the compass is calibrated for your environment.
2. **Tune the map scale**:
   1. If obstacles “jump” too far per reading, increase `CELL_CM`.
   2. If the map feels too coarse, decrease `CELL_CM`.
3. **Tune probabilities**:
   1. If obstacles disappear too quickly, decrease `P_DECAY`.
   2. If free space is too aggressive, decrease `P_FREE_DEC`.
4. **Verify scan angle**:
   1. If you are commanding head yaw elsewhere, replace `yawAngleFromSway(...)` with the yaw angle you command.

---

## 🚀 6. Next Steps

* **Use compass to stabilize rotation**: rotate the grid when `input.compassHeading()` changes significantly.
* **Add dead-reckoning translation**: shift the grid opposite to motion using `commandedSpeed` and time step.
* **Export the 5×5 matrix**: send `grid` over radio for visualization on a second micro:bit.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
