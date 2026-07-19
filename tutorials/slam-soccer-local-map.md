# SLAM Soccer Local Map: Construct an Occupancy Map

In this tutorial, you will build a small **local occupancy map** for Robot PU’s soccer behavior. The robot uses camera detections for the soccer ball and goal, combines them with odometry, and places them into a grid map centered in the robot’s current local frame.

By the end, the robot will be able to:

- **Read soccer detections**: Get ball and goal positions from the ESP32 vision service.
- **Store observations**: Save each detection with the robot odometry pose at the time it was received.
- **Compensate motion**: Transform older camera detections into the robot’s current frame using odometry.
- **Construct a grid map**: Convert metric `(x, y)` positions into occupancy-map cells.
- **Use the map for planning**: Mark the ball, goal, and a kick point in the grid.

---

## Why use a local occupancy map?

A full global SLAM map needs reliable long-term localization and stable landmarks. In soccer, Robot PU may not have enough fixed landmarks, and the camera detections can be delayed or temporarily missing.

Instead, this lesson builds a **local map**:

- **Robot-centered**: The robot is always at the origin of the current frame.
- **Short range**: The map only covers the nearby soccer scene.
- **Action-oriented**: The map is used immediately to decide how to approach and kick the ball.

This is still an occupancy-map idea: the robot discretizes the world into cells and records what each cell contains.

---

## Map representation

The code uses a `10 x 10` grid:

- **`GRID_N = 10`**: 10 rows and 10 columns.
- **`GRID_RES_M = 0.05`**: Each cell is 5 cm wide.
- **Map width**: `10 * 0.05 = 0.5 m`.
- **Left/right coverage**: `-0.25 m` to `+0.25 m`.
- **Forward coverage**: `0 m` to `0.5 m`.

The grid cell values are:

- **`0`**: Empty or unknown.
- **`2`**: Ball cell.
- **`3`**: Goal cell.
- **`4`**: Kick-point cell.

The map is rebuilt every loop from the most recent valid detections. That makes it a **local semantic occupancy map**: cells do not just say “occupied”; they identify the object occupying the cell.

---

## Coordinate convention

The camera detection packet gives metric positions in millimeters:

- **`x_mm`**: Left/right position of the detected object.
- **`y_mm`**: Forward distance to the detected object.

The code converts these values to meters:

```typescript
ball_cam2D = [x_mm / 1000, y_mm / 1000]
goal_cam2D = [x_mm / 1000, y_mm / 1000]
```

For the grid:

- **`x_m`** maps to the grid column `j`.
- **`y_m`** maps to the grid row `i`.
- **Forward distance starts at row 0** and increases as `y_m` increases.
- **Left/right is centered** by adding `GRID_HALF_M`.

The key conversion is:

```typescript
const j = Math.floor((x_m + GRID_HALF_M) / GRID_RES_M)
const i = Math.floor((y_m) / GRID_RES_M)
```

Example:

- A ball at `(x=0.00 m, y=0.20 m)` becomes approximately `(i=4, j=5)`.
- A ball at `(x=-0.10 m, y=0.20 m)` becomes approximately `(i=4, j=3)`.

---

## Data flow

The program follows an observe-transform-map-act loop:

1. **Read I2C packet**
   - `pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)` reads the latest camera result.

2. **Decode detection**
   - `trackBall(packet)` checks whether the packet is for the ball or the goal.
   - It extracts `x_mm` and `y_mm`.

3. **Store detection with odometry**
   - `getPoseO()` reads `robotPuPro.locationArray()`.
   - The code stores the object position and the robot pose at detection time.

4. **Transform into the current frame**
   - `camToNow(...)` moves stale observations into the current local frame.
   - This matters because the robot may have walked after the image was captured.

5. **Build occupancy map**
   - `newGrid()` creates a fresh 2D grid.
   - `gridIndex(...)` converts object positions into cell indices.
   - `setCell(...)` marks ball, goal, and kick point.

6. **Plan from the map**
   - `computeKickPoint(...)` computes a cell behind the ball.
   - The robot walks toward that point, turns toward the goal, and kicks.

---

## Odometry and latency compensation

Camera detections are not instantaneous. A detection may describe where the ball was around `0.3 s` ago. If the robot has moved, using the raw camera point directly can place the ball in the wrong cell.

The function `camToNow(...)` fixes this by:

- **Step 1**: Transforming the detected local point into the odometry frame at detection time.
- **Step 2**: Transforming that odometry-frame point back into the robot’s current local frame.

The logic is:

```typescript
const det_xy_O = rot(pose_det_O[2], cam2D_at_det[0], cam2D_at_det[1])
const obj_O = [pose_det_O[0] + det_xy_O[0], pose_det_O[1] + det_xy_O[1]]
const rel_O = [obj_O[0] - pose_now_O[0], obj_O[1] - pose_now_O[1]]
const rel_now = rot(-pose_now_O[2], rel_O[0], rel_O[1])
```

Before testing, verify the units returned by `robotPuPro.locationArray()` in your firmware. This code assumes:

- **`x` and `y`**: meters.
- **`theta`**: radians.

If your odometry returns millimeters and degrees, convert inside `getPoseO()`.

---

## Occupancy-map construction in the code

The central occupancy-map functions are:

- **`newGrid()`**: Creates a blank `10 x 10` grid.
- **`gridIndex(x_m, y_m)`**: Converts metric local coordinates to grid indices.
- **`inGrid(i, j)`**: Checks whether the cell is inside the map.
- **`setCell(grid, i, j, v)`**: Writes a semantic occupancy value into the map.

During each loop, the code builds the map like this:

```typescript
const grid = newGrid()
if (ball_valid) {
    const idxB = gridIndex(ball_now[0], ball_now[1])
    setCell(grid, idxB[0], idxB[1], 2)
}
if (goal_valid) {
    const idxG = gridIndex(goal_now[0], goal_now[1])
    setCell(grid, idxG[0], idxG[1], 3)
}
```

When both ball and goal are visible, the map also marks a kick point:

```typescript
const kickPt = computeKickPoint(ball_now, goal_now)
const idxK = gridIndex(kickPt[0], kickPt[1])
setCell(grid, idxK[0], idxK[1], 4)
```

This is the key idea of the tutorial: **turn continuous camera detections into discrete map cells, then plan from those cells**.

---

## Testing checklist

- **Start with debug enabled**: Keep `DEBUG_FLAG = true` so serial output shows detected positions.
- **Verify I2C packets**: If you see `i2c read error`, check Smart Hat power, I2C wiring, and the multiplexer setup.
- **Check detection coordinates**: Move the ball left/right and forward/back while watching `ball x` and `ball y`.
- **Check odometry units**: Print `robotPuPro.locationArray()` and confirm whether it is meters/radians or millimeters/degrees.
- **Check grid bounds**: If objects are not marked, they may be outside the `0.5 m x 0.5 m` local map.
- **Tune resolution**: Increase `GRID_N` or `GRID_RES_M` if the map is too small.
- **Tune turning**: If the robot turns the wrong way, flip the sign of `TURN_GAIN`.

---

## Extension ideas

- **Render the grid**: Send the `grid` over serial or radio to a base station dashboard.
- **Add probability**: Replace fixed labels with occupancy probabilities from `0` to `100`.
- **Inflate obstacles**: Mark neighboring cells around the ball as occupied to account for ball radius.
- **Keep a rolling map**: Instead of rebuilding every loop, decay old cells and maintain a short-term memory.
- **Add path planning**: Use BFS or A* to reach the kick point while avoiding occupied cells.

---

## Complete MakeCode program

```typescript

/**
 * RobotPU soccer: local 2D map + planning in the camera frame.
 *
 * Coordinate convention:
 * - Right-hand system, +z up, units in meters.
 * - We build a small 2D grid on the ground plane (x-y).
 * - For grid mapping we use the ground-plane projection (x,y) and ignore z.
 *
 * Frames (important):
 * - {C_cam}: camera frame at the time an image is captured (t_cam).
 * - {C_now}: camera frame "now" (t_now), after the robot has moved.
 * - {O}: odometry frame used by the robot's odometry module.
 *
 * Key idea (why camera frame):
 * - We do NOT rely on global/absolute localization (not enough fixed landmarks).
 * - Instead we plan in a LOCAL frame tied to the current camera observation.
 * - By definition in {C_now}, the robot pose is:
 *     p_robot^{C_now} = (0, 0),  theta_robot^{C_now} = 0
 *
 * Inputs:
 * 1) Odometry pose in odometry frame:
 *    - (x, y, theta)_robot^O(t): robot pose at time t in {O}.
 * 2) Camera detections in camera frame (metric 3D points at time t_cam, expressed in {C_cam}):
 *    - p_ball^{C_cam}(t_cam) = (x, y, z)_cam_ball
 *    - p_goal^{C_cam}(t_cam) = (x, y, z)_cam_goal
 * 3) Head yaw/pitch and camera mount (used only if you need to relate camera motion to the body):
 *    - camera mount translation in base_link: (0, 0.035, 0.160)
 *    - head yaw/pitch angles at time t_cam (ideally time-aligned with the image)
 *    Note: during walking the robot tries to keep the head facing forward, but there can still be small camera sway.
 * 4) Local grid map:
 *    - 10 x 10 cells, resolution = 0.05 m/cell
 * 5) Ball radius r_ball = 0.05 m. Goal width = 0.3 m.
 * 6) Robot is bipedal: odometry updates happen mainly at foot landings (about 2 Hz).
 * 7) Camera detections run at about 5 Hz but can be missing/wrong, and have about 0.3 s latency.
 *
 * Process (all final results expressed in the current camera frame {C_now}):
 * 1) Grid indexing:
 *    - Project detections to the ground plane using (x, y) and ignore z.
 *    - Convert p_goal^{C_now}_xy and p_ball^{C_now}_xy to grid cells (i_goal, j_goal) and (i_ball, j_ball).
 *
 * 2) Kick point in camera frame:
 *    - Compute a kick target p_kick^{C_now}_xy located 0.05 m behind the ball along the line goal -> ball,
 *      so the robot can push the ball straight toward the goal.
 *
 * 3) Camera latency compensation (optional but recommended):
 *    - Camera measurements are delayed, so p_ball^{C_cam}(t_cam) and p_goal^{C_cam}(t_cam) are stale.
 *    - Use odometry to compute the relative motion from t_cam to now:
 *        Delta^O = pose_robot^O(t_now) ⊖ pose_robot^O(t_cam)
 *      (delta translation/rotation since the image was taken).
 *    - Apply this delta to transform stale detections from {C_cam} into {C_now}, producing:
 *        p_ball^{C_now}, p_goal^{C_now}, p_kick^{C_now}.
 *    - We denote the robot's current pose expressed in the old camera frame as:
 *        (x, y, theta)_robot^{C_cam\leftarrow O}
 *      (derived from odometry; exact computation depends on your transform convention).
 *
 * Outputs (all in the current camera frame {C_now}):
 * - Grid Map M (10 x 10 cells, resolution = 0.05 m/cell)
 * - p_ball^{C_now}_xy and its grid cell (i_ball, j_ball)
 * - p_goal^{C_now}_xy and its grid cell (i_goal, j_goal)
 * - p_kick^{C_now}_xy and its grid cell (i_kick, j_kick)
 * - (optional) Delta^O or (x, y, theta)_robot^{C_cam\leftarrow O} used for latency compensation
 */

function clamp(v: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, v))
}

function norm2(x: number, y: number): number {
    return Math.sqrt(x * x + y * y)
}

function wrapPi(a: number): number {
    while (a > Math.PI) a -= 2 * Math.PI
    while (a < -Math.PI) a += 2 * Math.PI
    return a
}

// 2D rotation
function rot(theta: number, x: number, y: number): number[] {
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    return [c * x - s * y, s * x + c * y]
}

// Parse Unsigned Char
function i8(v: number) {
    return v >= 128 ? v - 256 : v
}
// Event status to string
function flagsText(f: number) {
    let s = ""
    if (f & VALID) {
        s = "" + s + " valid"
    }
    if (f & STALE) {
        s = "" + s + " stale"
    }
    if (f & CAPTURE) {
        s = "" + s + " capture"
    }
    if (f & WEB) {
        s = "" + s + " web"
    }
    if (f & SLEEP) {
        s = "" + s + " sleep"
    }
    return s.length > 0 ? s.trim() : "none"
}
function setService(serviceId: number, enabled: boolean) {
    pins.i2cWriteBuffer(ESP32_ADDR, Buffer.fromArray([CMD_SERVICE_ENABLE, serviceId, enabled ? 1 : 0]), false)
}

function setSoccerDetection(enabled: boolean) {
    setService(SERVICE_SOCCER_BALL_DETECTION, enabled)
    basic.pause(10)
    setService(SERVICE_SOCCER_GOAL_DETECTION, enabled)
}

function searchBall(searchPattern: { y: number, p: number }[]) {
    yaw *= 0.5
    pitch *= 0.5

    if (scanFrameCounter > 0) {
        scanFrameCounter += -1
        const targetOffset = searchPattern[scanStepIndex]
        if (DEBUG_FLAG) {
            serial.writeLine("" + (`yawSearch: ${targetOffset.y * search_gain}`))
            serial.writeLine("" + (`pitchSearch: ${targetOffset.p * search_gain}`))
        }
        robotPuPro.setModeVar(robotPuPro.Mode.API)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, currentYaw + targetOffset.y * search_gain, 1)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, currentPitch + targetOffset.p * search_gain, 1)
        robotPuPro.leftEyeBright(0.002)
        robotPuPro.rightEyeBright(0.002)
        return
    }

    scanFrameCounter = SCAN_WAIT_FRAMES
    scanStepIndex += 1
    if (scanStepIndex >= SEARCH_PATTERN.length) {
        scanStepIndex = 0
        search_gain = Math.min(4, search_gain * 1.1)
    }
}

const MUX_ADDR = 112 // 0x70
const ESP32_ADDR = 66 // 0x42
const SIZE = 18

const SOCCER_BALL = 4
const SOCCER_GOAL = 5

const CMD_SERVICE_ENABLE = 8
const SERVICE_WIFI = 1
const SERVICE_IMAGE_CAPTURE = 2
const SERVICE_FACE_DETECTION = 3
const SERVICE_SOCCER_BALL_DETECTION = 4
const SERVICE_SOCCER_GOAL_DETECTION = 5

const VALID = 1 << 0
const STALE = 1 << 1
const CAPTURE = 1 << 2
const WEB = 1 << 3
const SLEEP = 1 << 4

const SCAN_WAIT_FRAMES = 25
const LOST_TIMEOUT_MS = 6000
const DEBUG_FLAG = true

// Grid map (local, in current robot/camera frame)
const GRID_N = 10
const GRID_RES_M = 0.05
const GRID_HALF_M = (GRID_N * GRID_RES_M) / 2

// Simple planner/controller tuning
const KICK_BACKOFF_M = 0.05
const APPROACH_SLOW_M = 0.25
const KICK_DIST_M = 0.11
const TURN_GAIN = -1.2 // flig the sign if robot turns in wrong direction

// Camera latency compensation (we transform using odometry pose at capture time)
// If your pipeline is more/less delayed, tune this.
const CAMERA_LATENCY_MS = 300

let location: number[] = []
let scanStepIndex = 0
let scanFrameCounter = 0

let currentPitch = 0
let currentYaw = 0

let yaw = 0
let pitch = 0
let lastBallSeenTime = 0
let lastGoalSeenTime = 0
let search_gain = 1

const SEARCH_PATTERN: { y: number, p: number }[] = [
    { y: 15, p: 0 },
    { y: -15, p: 0 },
    { y: -15, p: -10 },
    { y: 0, p: -10 },
    { y: 15, p: -10 },
    { y: 15, p: 3 },
    { y: 0, p: 3 },
    { y: -15, p: 3 },
    { y: -15, p: 0 },
    { y: 0, p: 0 }
]

robotPuPro.setChannel(166)
// set your servo trim here for better walking control
robotPuPro.setServoTrim(robotPuPro.ServoJoint.LeftFoot, -5)
robotPuPro.setServoTrim(robotPuPro.ServoJoint.LeftLeg, 0)
robotPuPro.setServoTrim(robotPuPro.ServoJoint.RightFoot, -5)
robotPuPro.setServoTrim(robotPuPro.ServoJoint.RightLeg, 0)
robotPuPro.setServoTrim(robotPuPro.ServoJoint.HeadYaw, -8)
robotPuPro.setServoTrim(robotPuPro.ServoJoint.HeadPitch, 0)
radio.onReceivedString(function (receivedString) {
    robotPuPro.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPuPro.runKeyValueCommand(name, value)
})

input.onButtonPressed(Button.A, function () {
    setService(SERVICE_WIFI, true)
})
input.onButtonPressed(Button.B, function () {
    setService(SERVICE_WIFI, false)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // allow gamepad to trim servos to improve balancing
    robotPuPro.toggleServoTrim()
    basic.pause(500)
})
function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}

// Detection state stored at image time (t_cam):
// - p_*_cam2D is a 2D point in the camera frame (meters, ground-plane projection)
// - pose_*_O is the robot odometry pose at the time we received that packet (approx for t_cam)
let ball_cam2D: number[] = [0, 0]
let ball_pose_O: number[] = [0, 0, 0]
let ball_valid = false
let ball_rx_ms = 0

let goal_cam2D: number[] = [0, 0]
let goal_pose_O: number[] = [0, 0, 0]
let goal_valid = false
let goal_rx_ms = 0

// return robot current pose in odometry frame
function getPoseO(): number[] {
    // locationArray(): [x, y, theta] in odometry frame (units depend on implementation; assumed meters + radians here)
    // If your odom uses different units, scale here.
    const loc = robotPuPro.locationArray()
    return [loc[0], loc[1], loc[2]]
}

// Transform a 2D point measured in robot/camera-local frame at time t_cam into
// the current robot-local frame using odometry.
function camToNow(cam2D_at_det: number[], pose_det_O: number[], pose_now_O: number[]): number[] {
    // 1) Convert local point -> odom frame at detection time
    const det_xy_O = rot(pose_det_O[2], cam2D_at_det[0], cam2D_at_det[1])
    const obj_O = [pose_det_O[0] + det_xy_O[0], pose_det_O[1] + det_xy_O[1]]

    // 2) Convert odom point -> current robot local frame
    const rel_O = [obj_O[0] - pose_now_O[0], obj_O[1] - pose_now_O[1]]
    const rel_now = rot(-pose_now_O[2], rel_O[0], rel_O[1])
    return rel_now
}

function newGrid(): number[][] {
    const g: number[][] = []
    for (let i = 0; i < GRID_N; i++) {
        const row: number[] = []
        for (let j = 0; j < GRID_N; j++) row.push(0)
        g.push(row)
    }
    return g
}

function gridIndex(x_m: number, y_m: number): number[] {
    // Map local coordinates to grid indices.
    // Convention: x_m = left/right, y_m = forward.
    const j = Math.floor((x_m + GRID_HALF_M) / GRID_RES_M)
    const i = Math.floor((y_m) / GRID_RES_M)
    return [i, j]
}

function inGrid(i: number, j: number): boolean {
    return i >= 0 && i < GRID_N && j >= 0 && j < GRID_N
}

function setCell(grid: number[][], i: number, j: number, v: number) {
    if (inGrid(i, j)) grid[i][j] = v
}

// Kick point is behind the ball along the direction from goal -> ball.
function computeKickPoint(ball_now: number[], goal_now: number[]): number[] {
    const dx = ball_now[0] - goal_now[0]
    const dy = ball_now[1] - goal_now[1]
    const n = Math.max(1e-6, norm2(dx, dy))
    const ux = dx / n
    const uy = dy / n
    return [ball_now[0] + ux * KICK_BACKOFF_M, ball_now[1] + uy * KICK_BACKOFF_M]
}

// Face the goal while standing at kick point: desired heading is from robot to goal.
function desiredHeadingTo(x: number, y: number): number {
    return Math.atan2(x, y)
}
interface Pose {
    x: number;
    y: number;
    theta: number
}
function trackBall(p: Buffer) {
    const currentTime = input.runningTime()

    if (p.length != SIZE) {
        serial.writeLine("bad length: " + p.length)
        return
    }

    let type = p[0]
    let ver = p[1]
    let seq = p[2]
    let flags = p[3]
    let count = p[4]
    let score = p[5]

    if (type == SOCCER_BALL) {
        if (count > 0) {
            lastBallSeenTime = currentTime
            search_gain = 1.0
            let x_mm = i16(p, 6)
            let y_mm = i16(p, 8)
            let z_mm = i16(p, 10)
            let w = u16(p, 12)
            let h = u16(p, 14)
            yaw = i8(p[16])
            pitch = i8(p[17])
            if (DEBUG_FLAG) {
                // serial.writeLine(`head yaw: ${robotPuPro.servoTargets()[4]}`)
                //serial.writeLine(`yawLock ${yaw}`)
                // serial.writeLine(`head pitch: ${robotPuPro.servoTargets()[5]}`)
                //serial.writeLine(`pitchLock: ${pitch}`)
                serial.writeLine(`ball x: ${x_mm}`)
                serial.writeLine(`ball y: ${y_mm}`)
            }
            // move head to look at the ball
            robotPuPro.setModeVar(robotPuPro.Mode.API)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, robotPuPro.servoTargets()[4] + yaw * 0.08, 8)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, robotPuPro.servoTargets()[5] + pitch * 0.08, 8)
            robotPuPro.leftEyeBright(0.01)
            robotPuPro.rightEyeBright(0.01)

            // Save the ball measurement (ground-plane projection) for mapping/planning.
            // Convention used here: y_mm is forward distance, x_mm is left/right.
            const poseO = getPoseO()
            ball_cam2D = [x_mm / 1000, y_mm / 1000]
            ball_pose_O = [poseO[0], poseO[1], poseO[2]]
            ball_valid = true
            ball_rx_ms = currentTime
        } else if (currentTime - lastBallSeenTime < LOST_TIMEOUT_MS) {
            // follow through for a short mement if lost the ball in the view  
            yaw *= 0.7
            pitch *= 0.7
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, robotPuPro.servoTargets()[4] + yaw * 0.2, 5)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, robotPuPro.servoTargets()[5] + pitch * 0.2, 5)
            // read current head pitch yaw
            currentYaw = robotPuPro.servoTargets()[4]
            currentPitch = robotPuPro.servoTargets()[5]
        } else {
            // lost the ball, search for ball
            searchBall(SEARCH_PATTERN)
        }
    } else if (type == SOCCER_GOAL) {
        if (count > 0) {
            lastGoalSeenTime = currentTime
            let x_mm = i16(p, 6)
            let y_mm = i16(p, 8)

            const poseO = getPoseO()
            goal_cam2D = [x_mm / 1000, y_mm / 1000]
            goal_pose_O = [poseO[0], poseO[1], poseO[2]]
            goal_valid = true
            goal_rx_ms = currentTime
        }
    }
}
basic.showString("I")
pins.i2cWriteNumber(
    MUX_ADDR,
    15,
    NumberFormat.Int8LE,
    false
)
basic.pause(5000)

setService(SERVICE_IMAGE_CAPTURE, true)
basic.pause(10)
// turn on soccer ball detection
setSoccerDetection(true)
basic.pause(10)
// turn off face detection
setService(SERVICE_FACE_DETECTION, false)
basic.pause(10)

currentYaw = robotPuPro.servoTargets()[4]
currentPitch = robotPuPro.servoTargets()[5]

if (DEBUG_FLAG) {
    setService(SERVICE_WIFI, true)
} else {
    setService(SERVICE_WIFI, false)
}
basic.forever(function () {
    let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)
    if (packet.length == SIZE) {
        trackBall(packet)
    } else {
        serial.writeLine("i2c read error")
        basic.showIcon(IconNames.No)
    }

    // --- Mapping + planning in the current frame ---
    const now_ms = input.runningTime()
    const pose_now_O = getPoseO()

    // Latency handling: if a measurement is too old, drop it.
    if (ball_valid && (now_ms - ball_rx_ms) > LOST_TIMEOUT_MS) ball_valid = false
    if (goal_valid && (now_ms - goal_rx_ms) > LOST_TIMEOUT_MS) goal_valid = false

    // Transform detections into the current local frame.
    // We use the odometry pose at packet receipt as an approximation for the image time.
    // If you have a true capture timestamp, substitute it here.
    let ball_now: number[] = [0, 0]
    let goal_now: number[] = [0, 0]
    if (ball_valid) {
        ball_now = camToNow(ball_cam2D, ball_pose_O, pose_now_O)
    }
    if (goal_valid) {
        goal_now = camToNow(goal_cam2D, goal_pose_O, pose_now_O)
    }

    // Build a small local grid for debugging/visualization.
    // 0 = empty, 2 = ball, 3 = goal, 4 = kick point
    const grid = newGrid()
    if (ball_valid) {
        const idxB = gridIndex(ball_now[0], ball_now[1])
        setCell(grid, idxB[0], idxB[1], 2)
    }
    if (goal_valid) {
        const idxG = gridIndex(goal_now[0], goal_now[1])
        setCell(grid, idxG[0], idxG[1], 3)
    }

    // Simple planner: if we see ball + goal, go to kick point and align to goal.
    if (ball_valid && goal_valid) {
        const kickPt = computeKickPoint(ball_now, goal_now)
        const idxK = gridIndex(kickPt[0], kickPt[1])
        setCell(grid, idxK[0], idxK[1], 4)

        const distKick = norm2(kickPt[0], kickPt[1])
        const headingKick = desiredHeadingTo(kickPt[0], kickPt[1])
        const turn = clamp(TURN_GAIN * headingKick, -0.8, 0.8)

        // Approach kick point
        if (distKick > KICK_DIST_M) {
            const speed = distKick > APPROACH_SLOW_M ? 2.5 : 1.5
            robotPuPro.walk(speed, turn)
            if (DEBUG_FLAG){
                serial.writeLine(`speed: ${speed}`)
                serial.writeLine(`turn: ${turn}`)
            }
        } else {
            // At kick point: face goal then kick
            const headingGoal = desiredHeadingTo(goal_now[0], goal_now[1])
            const turnGoal = clamp(TURN_GAIN * headingGoal, -0.8, 0.8)
            if (Math.abs(headingGoal) > 0.25) {
                robotPuPro.walk(1.0, turnGoal)
            } else {
                robotPuPro.kick() // need to keep calling kick to make it kicking
            }
        }
    }

    // Optional debug output
    if (DEBUG_FLAG && (ball_valid || goal_valid)) {
        if (ball_valid) serial.writeLine(`ball_now x=${ball_now[0]} y=${ball_now[1]}`)
        if (goal_valid) serial.writeLine(`goal_now x=${goal_now[0]} y=${goal_now[1]}`)
    }

    basic.pause(20)
})





```