
# Lesson: Motorizing Robot PU (Servos + I2C)

This lesson explains how Robot PU moves using multiple servos, why it uses an **I2C-based servo controller**, and how the extension coordinates smooth multi-servo motion.

---

## What you’ll learn

1. What a servo is and how Robot PU uses servos for movement.
2. Why Robot PU drives servos over **I2C** instead of directly from the micro:bit pins.
3. I2C basics (SDA/SCL, addresses, reads/writes).
4. How to program I2C in MakeCode Static TypeScript.
5. How the internal `WK` class coordinates:
   1. Progressive servo moves (step-by-step) to control speed.
   2. Moving multiple servos at the same time.
   3. Detecting when a motion is complete.

## Knowledge
 - https://makecode.microbit.org/javascript/functions
 - https://makecode.microbit.org/courses/blocks-to-javascript/writing-functions
 - https://en.wikipedia.org/wiki/Function_(computer_programming)
 - https://makecode.microbit.org/reference/pins
 - https://makecode.microbit.org/v2/device/pins
 - https://en.wikipedia.org/wiki/I2C
 - https://makecode.microbit.org/reference/pins/i2c-read-number
---

## 0) Functions: wrap complex motor sequences into a consistent API

When your robot program gets bigger, “raw motor commands” become hard to read:

- lots of repeated `robotPuPro.servo(...)` calls
- lots of magic numbers (angles, delays)
- easy to accidentally move joints in the wrong order

The solution is to define a small set of **functions** that act like your own “mini API”.

Goals for a good motor API:

- consistent naming (`pose...`, `step...`, `do...`)
- consistent units (angles in degrees, time in ms)
- clear joint ordering (always the same)
- safe ranges (clamp angles)

### 0.1) Joint list helper

Robot PU public API controls individual joints with `robotPuPro.servo(joint, angle)`.

Define a single canonical joint order and reuse it everywhere.

```typescript
const JOINTS: robotPuPro.ServoJoint[] = [
    robotPuPro.ServoJoint.LeftFoot,
    robotPuPro.ServoJoint.LeftLeg,
    robotPuPro.ServoJoint.RightFoot,
    robotPuPro.ServoJoint.RightLeg,
    robotPuPro.ServoJoint.HeadYaw,
    robotPuPro.ServoJoint.HeadPitch
]
```

### 0.2) Clamp + pose application helpers

```typescript
function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function applyPose(angles: number[]): void {
    const n = Math.min(JOINTS.length, angles.length)
    for (let i = 0; i < n; i++) {
        const a = clampInt(Math.round(angles[i]), 0, 180)
        robotPuPro.servo(JOINTS[i], a)
    }
}
```

Now you can write readable, consistent code like:

```typescript
const POSE_STAND = [90, 90, 90, 90, 90, 80]
const POSE_DUCK  = [10, 150, 170, 30, 40, 125]

applyPose(POSE_STAND)
basic.pause(500)
applyPose(POSE_DUCK)
```

### 0.3) Smooth transitions (a reusable “move to pose” API)

This helper interpolates between poses in small steps.

```typescript
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

function transitionPose(fromPose: number[], toPose: number[], steps: number, stepMs: number): void {
    const safeSteps = Math.max(1, Math.round(steps))
    for (let k = 0; k <= safeSteps; k++) {
        const t = k / safeSteps
        let pose: number[] = []
        for (let i = 0; i < JOINTS.length; i++) {
            pose.push(lerp(fromPose[i], toPose[i], t))
        }
        applyPose(pose)
        basic.pause(stepMs)
    }
}
```

### 0.3.1) Graceful motion: easy-in / easy-out servo control (easing)

Linear interpolation (`t = 0..1`) moves at a constant speed. For robots, constant speed often looks a bit *robotic*: the motion starts abruptly and stops abruptly.

An **easy-in / easy-out** profile makes the robot:

1. Accelerate smoothly at the beginning.
2. Move fastest in the middle.
3. Decelerate smoothly near the end.

You can do this by transforming `t` with an easing function, then using that eased value for interpolation.

```typescript
function clamp01(t: number): number {
    if (t < 0) return 0
    if (t > 1) return 1
    return t
}

// Smoothstep: 0->1 with zero slope at both ends
function easeInOutSmoothStep(t: number): number {
    t = clamp01(t)
    return t * t * (3 - 2 * t)
}

function transitionPoseEase(fromPose: number[], toPose: number[], steps: number, stepMs: number): void {
    const safeSteps = Math.max(1, Math.round(steps))
    for (let k = 0; k <= safeSteps; k++) {
        const t = k / safeSteps
        const te = easeInOutSmoothStep(t)
        let pose: number[] = []
        for (let i = 0; i < JOINTS.length; i++) {
            pose.push(lerp(fromPose[i], toPose[i], te))
        }
        applyPose(pose)
        basic.pause(stepMs)
    }
}
```

Cosine-based alternatives (also easy-in/easy-out):

```typescript
// Cosine interpolation curve: te = (1 - cos(pi * t)) / 2
function easeInOutCosine(t: number): number {
    t = clamp01(t)
    return (1 - Math.cos(Math.PI * t)) / 2
}

// Direct cosine interpolation between a and b.
// Equivalent to: lerp(a, b, easeInOutCosine(t))
function coserp(a: number, b: number, t: number): number {
    return lerp(a, b, easeInOutCosine(t))
}
```

If you want cosine easing instead of smoothstep, just replace:

```typescript
const te = easeInOutSmoothStep(t)
```

with:

```typescript
const te = easeInOutCosine(t)
```

Example (try comparing linear vs eased):

```typescript
transitionPose(POSE_STAND, POSE_DUCK, 18, 20)
basic.pause(600)
transitionPoseEase(POSE_DUCK, POSE_STAND, 18, 20)
```

Notes:

- If the robot still feels “jerky”, increase `steps` (more intermediate poses) or increase `stepMs` (slower updates).
- Easing mainly improves the *start/stop feel*. To also limit per-tick jumps, keep step sizes small enough that your servos can follow smoothly.

Example:

```typescript
transitionPose(POSE_STAND, POSE_DUCK, 12, 30)
basic.pause(500)
transitionPose(POSE_DUCK, POSE_STAND, 12, 30)
```

### 0.4) Wrap a complex action into one function

Your top-level program becomes much cleaner when actions are named.

```typescript
function doBow(): void {
    const neutral = POSE_STAND
    const bowPose = [90, 90, 90, 90, 90, 140]
    transitionPose(neutral, bowPose, 10, 20)
    basic.pause(200)
    transitionPose(bowPose, neutral, 10, 20)
}

input.onButtonPressed(Button.A, function () {
    doBow()
})
```

Notes:

- This is the same idea used internally by the extension: break movement into reusable building blocks.
- If you later change the robot’s “safe angles”, you only update `applyPose()`.

## 1) Robot PU’s servos (what they are doing)

Robot PU is a multi-joint robot: each joint is driven by a servo that expects a target position (often expressed as an angle like `0..180`).

When you “walk”, “dance”, “kick”, etc., Robot PU isn’t sending just one command; it’s continuously moving multiple joints toward target poses.

---

## 1.1) Servo map: left foot / left leg / right foot / right leg / head

Inside the extension, Robot PU treats its servos as 6 channels (indices `0..5`). You’ll see this ordering reflected in `setTrim(...)`:

1. `0`: left foot
2. `1`: left leg
3. `2`: right foot
4. `3`: right leg
5. `4`: head yaw (turn left/right)
6. `5`: head pitch (look up/down)

This is also why many gaits treat:

1. The **legs** as `[0, 1, 2, 3]`
2. The **head/body** as `[4, 5]`

| Robot Position | Left Foot | Left Leg | Right Foot | Right Leg | Neck (Yaw) | Head (Pitch) | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Stand | 90 | 90 | 90 | 90 | 90 | 90 | Robot Stands Straight |
| Jump | 130 | 90 | 50 | 90 | 90 | 30 | Robot Jumps with Feet, head raised |
| Duck | 0 | 85 | 180 | 95 | 90 | 90 | Robot squats down, with feet folded |
| Calibrate | 90 | 60 | 90 | 120 | 90 | 90 | Robot calibrates by putting heels aligned |
| Side Move 1 | 75 | 90 | 30 | 90 | 135 | 105 | Robot tiptoes to left |
| Side Move 2 | 150 | 90 | 105 | 90 | 45 | 105 | Robot tiptoes to right |

In `Parameters.stateTargets`, pose `0` is the neutral **stand** pose and pose `1` is a compact **duck** pose.

Here is an example to make the robot go to positions one by one.

Key ideas:

- `robotPuPro.setMode(robotPuPro.Mode.API)` tells the robot you are directly commanding joints (instead of running walk/dance state machines).
- The `radio.onReceived...` handlers are optional. They are only needed if you want to also control the robot from a gamepad/remote using `robotPuPro.runStringCommand(...)` and `robotPuPro.runKeyValueCommand(...)`.
- `robotPuPro.setChannel(166)` must match your controller/gamepad radio channel.
- use `robotPuPro.servo()` to move each servo
- use `pause()` to allow time for the movement to happen

```typescript
function pos1 () {
    robotPuPro.setMode(robotPuPro.Mode.API)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 90)
}
radio.onReceivedString(function (receivedString) {
    robotPuPro.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPuPro.runKeyValueCommand(name, value)
})
function pos2 () {
    robotPuPro.setMode(robotPuPro.Mode.API)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 71)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 71)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 72)
}
robotPuPro.setChannel(166)
basic.forever(function () {
    pos1()
    basic.pause(500)
    pos2()
    basic.pause(500)
})
```

upload to robot PU and see what happens:
- https://makecode.microbit.org/_H6t4wb1xq4CC
---

## 2) Why I2C-based servo control is used (micro:bit limits)

The micro:bit *can* drive a servo using PWM (`pins.servoWritePin(...)`), but Robot PU needs **multiple servos** moving smoothly at the same time.

Typical constraints when trying to drive many servos directly from the micro:bit:

1. **Limited PWM timing budget**: servos need precise pulse timing; doing many channels in software is hard.
2. **Hardware PWM channel limit**: the micro:bit’s built-in PWM support is practical for only a small number of servos at once (commonly up to about 4) before timing conflicts/jitter become a problem.
3. **CPU time**: Robot PU also needs to run logic loops, sensor reads, radio, etc.
4. **Pin count**: multiple independent PWM outputs would consume many pins.
5. **Consistency**: a dedicated controller can generate stable pulses even when your code is busy.

Power and voltage constraints also matter:

1. **Not enough power for servos**: micro:bit’s 3V pin and on-board regulator are not designed to supply the surge current multiple servos can draw (brownouts/resets are common if you try).
2. **Voltage is too low for some servos**: the micro:bit is **3.3V logic**, and while many servos accept a 3.3V control signal, many hobby servos expect ~5V power for full torque/speed.

To solve this, Robot PU uses an onboard controller that receives compact commands over **I2C** and handles the multi-servo pulse generation.

---

## 2.1) micro:bit pins (edge connector basics for Robot PU)

Robot PU uses the micro:bit edge connector to access power and the I2C bus.

### A. The important pins for Robot PU

- **`P19`**: I2C `SCL` (clock)
- **`P20`**: I2C `SDA` (data)
- **`3V`**: micro:bit 3.3V output (logic-level power)
- **`GND`**: ground reference

Important:

- `P19/P20` are the default I2C pins. If you use I2C devices (or Robot PU’s servo controller), avoid repurposing these pins for other uses.

### B. Power caution (servos draw much more current than micro:bit can supply)

Even though the micro:bit has a `3V` pin:

- Do **not** try to power multiple servos from micro:bit `3V`.
- Sudden servo load can cause **brownouts/resets**.

Robot PU solves this by having its own motor power path and an onboard controller. The micro:bit mostly sends **commands**, not power.

### C. How the `pins` API relates to I2C

Robot PU hides the low-level `pins.i2c...` calls inside the extension, but it helps to know what’s happening.

Example: simple I2C register read

```typescript
// Example pattern: read a 1-byte register from an I2C device
const addr = 0x10
const reg = 0x03

pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8LE)
const value = pins.i2cReadNumber(addr, NumberFormat.UInt8LE)
basic.showNumber(value)
```

Example: scan-like check ("does a device respond?")

```typescript
const addr = 0x10

// Many devices will ACK a write of a single byte.
// If the address is wrong, you may see 0 or an error-like value depending on device behavior.
pins.i2cWriteNumber(addr, 0x00, NumberFormat.UInt8LE)
basic.showString("OK")
```

Notes:

- Different I2C chips have different register maps; the above shows the *pattern*, not Robot PU’s internal protocol.
- In Robot PU, `WK` uses `pins.i2cWriteBuffer(...)` to send 4-byte packets.

---

## 3) I2C basics (what it is)

I2C is a two-wire communication bus:

1. `SDA` = data line
2. `SCL` = clock line

On the micro:bit edge connector these are typically:

1. `P20` = SDA
2. `P19` = SCL

Each I2C device has an **address** (usually shown as 7-bit hex like `0x10`, `0x68`, `0x3C`).

Robot PU’s controller address is represented in the extension by the `WK` class field:

```javascript
// Inside WK
this.i2cAddress = 16 // decimal == 0x10 hex

```

---

## 4) Programming I2C in MakeCode (STS)

In MakeCode, you typically talk to an I2C device using buffers:

1. Build a small `Buffer` containing a register/command and data bytes.
2. Send it with `pins.i2cWriteBuffer(address, buffer)`.
3. Optionally read back bytes with `pins.i2cReadBuffer(...)` / `pins.i2cReadNumber(...)`.

### Example: write a command packet

```javascript
let addr = 0x10
let buf = pins.createBuffer(4)

buf.setNumber(NumberFormat.UInt8LE, 0, 0x03) // example register
buf.setNumber(NumberFormat.UInt8LE, 1, 90)   // example angle
buf.setNumber(NumberFormat.UInt8LE, 2, 0)
buf.setNumber(NumberFormat.UInt8LE, 3, 0)

pins.i2cWriteBuffer(addr, buf)

```

That is the same pattern Robot PU uses internally: build a 4-byte packet and send it.

---

## 5) The `WK` class: how Robot PU actually drives motion

`WK` is the internal “hardware link” that sends motor/servo/light commands over I2C.

### 5.1 Immediate servo command (`WK.servo`)

`WK.servo(sr, a)` sets a single servo channel to an angle.

Key ideas:

1. The angle is clamped to a safe range (`0..180`).
2. A “register” value is computed from the servo index.
3. A 4-byte packet is written over I2C.

Conceptually:

```javascript
// Simplified idea (matches the pattern in WK)
let reg = servoIndex + 3
let packet = pins.createBuffer(4)
packet.setNumber(NumberFormat.UInt8LE, 0, reg)
packet.setNumber(NumberFormat.UInt8LE, 1, angle)
packet.setNumber(NumberFormat.UInt8LE, 2, 0)
packet.setNumber(NumberFormat.UInt8LE, 3, 0)
pins.i2cWriteBuffer(0x10, packet)

```

### 5.2 Progressive servo movement (`WK.servoStep`) — controlling speed

If you jump from angle `20` to `160` in one call, the movement can look “snappy” and can shake the robot.

Robot PU instead uses **stepping**:

1. Compute error = `target - current`.
2. Move only a small amount each update (the “step size”).
3. Repeat every tick until the error is small.

In the real code, the current target per servo is stored in `Parameters.servoTarget[idx]` and updated gradually.

This is how Robot PU controls motion “speed” without relying on delays. Smaller steps = slower, smoother motion.

Here is an example that moves each servo at different speed controlled by step size and pause
 - https://makecode.microbit.org/_i9YJmw1ieKDM

```typescript
function pos1 () {
    basic.showNumber(1)
    resetErr()
    while (!(allErrZero())) {
        leftFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftFoot, 90, 2)
        leftLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftLeg, 90, 4)
        rightFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightFoot, 90, 2)
        rightLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, 90, 4)
        headPitchErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadPitch, 90, 3)
        headYawErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadYaw, 90, 1)
        basic.pause(20)
    }
}
function allErrZero () {
    return leftFeetErr == 0 && leftLegErr == 0 && rightFeetErr == 0 && rightLegErr == 0 && headPitchErr == 0 && headYawErr == 0
}
function pos2 () {
    basic.showNumber(2)
    resetErr()
    while (!(allErrZero())) {
        leftFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftFoot, 70, 4)
        leftLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftLeg, 71, 2)
        rightFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightFoot, 70, 4)
        rightLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, 71, 2)
        headPitchErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadPitch, 70, 1)
        headYawErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadYaw, 72, 3)
        basic.pause(20)
    }
}
function resetErr () {
    leftFeetErr = 1
    leftLegErr = 1
    rightFeetErr = 1
    rightLegErr = 1
    headPitchErr = 1
    headYawErr = 1
}
let headYawErr = 0
let headPitchErr = 0
let rightLegErr = 0
let rightFeetErr = 0
let leftLegErr = 0
let leftFeetErr = 0
robotPuPro.setChannel(166)
basic.forever(function () {
    pos1()
    pos2()
})
```
You can wrap the motor function event better with the help of array.
   - https://makecode.microbit.org/_1ey03L4iwRbK
```typescript
function pose(target: number [], step: number [], pauseMS: number) {
    basic.showNumber(1)
    resetErr()
    while (!(allErrZero())) {
        leftFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftFoot, target[0], step[0])
        leftLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.LeftLeg, target[1], step[1])
        rightFeetErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightFoot, target[2], step[2])
        rightLegErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, target[3], step[3])
        headPitchErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadPitch, target[4], step[4])
        headYawErr = robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadYaw, target[5], step[5])
        basic.pause(pauseMS)
    }
}
function allErrZero () {
    return leftFeetErr == 0 && leftLegErr == 0 && rightFeetErr == 0 && rightLegErr == 0 && headPitchErr == 0 && headYawErr == 0
}

function resetErr () {
    leftFeetErr = 1
    leftLegErr = 1
    rightFeetErr = 1
    rightLegErr = 1
    headPitchErr = 1
    headYawErr = 1
}
let headYawErr = 0
let headPitchErr = 0
let rightLegErr = 0
let rightFeetErr = 0
let leftLegErr = 0
let leftFeetErr = 0
robotPuPro.setChannel(166)
let targets : number [][] = [[90,90,90,90,90,90], [70,72,70,72,71,75]]
let stepSizes: number [][] = [[1,1,1,1,1,1],[1,2,1,2,1,1]]
basic.forever(function () {
    pose(targets[0], stepSizes[0], 20)
    pose(targets[1], stepSizes[1], 20)
})
```

### 5.3 Moving multiple servos at the same time

Walking is a coordinated pose. Robot PU updates multiple servos during each update cycle.

In `WK.move(...)`, two groups are supported:

1. `sync_list`: servos that must reach the pose together.
2. `async_list`: servos that can move with a different speed (for style or balance).

During each update tick, the code calls `servoStep(...)` for **each** servo in each list. That means all those servos progress at the same time.

This “many small steps per tick” approach is how PU moves multiple joints smoothly without blocking.

### 5.4 Detecting when movement is completed

Robot PU needs to know when it has reached a pose so it can advance to the next pose in a sequence.

Inside `WK`:

1. Each `servoStep` updates `Parameters.servoErr[idx]`.
2. `isServoIdle(servoList, p)` checks if each servo’s error is “close enough” (currently `< 1`).

When `isServoIdle(sync_list, p)` becomes true, `WK.move(...)` advances to the next state and increments `numSteps`.

This gives you a clean *“pose completed”* signal without needing a physical position sensor on the servo.

---

## 6) Putting it together (mental model)

When Robot PU is “doing an action” (walk/dance/etc.), the control loop is roughly:

1. Pick a target pose (a set of target angles).
2. Every update tick:
   1. Step each servo toward its target (small increments).
   2. Track errors.
   3. When all required servos are close enough, advance to the next pose.

That combination (I2C + stepping + completion detection) is what makes PU’s movements smooth and repeatable.

---

## 7) Example: stand -> duck on free-fall -> stand again

This example uses the micro:bit accelerometer gesture `Gesture.FreeFall` to detect when the robot is in free fall.

Program behavior:

1. Start in a normal standing pose (pose index `0` in `Parameters.stateTargets`).
2. While free-fall is happening, move into a protective duck pose (pose index `1`).
3. When free-fall ends, wait a few seconds, then command the robot to stand again.

### 7.1 Load the Robot PU extension (MakeCode)

1. Open https://makecode.microbit.org
2. Click **New Project**
3. Click **Extensions**
4. Search for the Robot PU extension (or paste the GitHub repo URL if you’re installing from GitHub)
5. Add it, then switch to **JavaScript**

### 7.2 Define the two poses (from `Parameters.stateTargets`)

These are the two poses we’ll use (from the `Parameters.stateTargets` table in the code):

1. Stand pose (index `0`): `[90, 90, 90, 90, 90, 80]`
2. Duck/crouch pose (index `1`): `[10, 150, 170, 30, 40, 125]`

Servo index order is:

1. `0` left foot
2. `1` left leg
3. `2` right foot
4. `3` right leg
5. `4` head yaw
6. `5` head pitch

### 7.3 Instant movement (snappy) using `WK.servo`

This sends the final angles directly. It’s immediate, but can look “snappy” and can shake the robot.

```javascript
let wk = new WK()

let stand = [90, 90, 90, 90, 90, 80]
let duck = [10, 150, 170, 30, 40, 125]

// Jump straight to stand, pause, then jump straight to duck
for (let i = 0; i < 6; i++) wk.servo(i, stand[i])
basic.pause(2000)
for (let i = 0; i < 6; i++) wk.servo(i, duck[i])

```

### 7.4 Progressive movement (smooth) using `WK.servoStep`

`servoStep(target, sp, idx, pr)` moves one servo a small amount per update:

1. The **step size** `sp` controls speed.
2. Call it repeatedly inside a loop.
3. Use `wk.isServoIdle(...)` to know when you’ve arrived.

```javascript
let pr = new Parameters()
let wk = new WK()

let stand = [90, 90, 90, 90, 90, 80]
let duck = [10, 150, 170, 30, 40, 125]
let all = [0, 1, 2, 3, 4, 5]

let target = duck
let stepSize = 2 // smaller = slower/smoother, larger = faster

basic.forever(function () {
    for (let i of all) {
        wk.servoStep(target[i], stepSize, i, pr)
    }

    if (wk.isServoIdle(all, pr)) {
        // Swap targets to compare the effect back-and-forth
        target = (target == duck) ? stand : duck
        basic.pause(500)
    }

    basic.pause(5)
})

```

### 7.5 Free-fall behavior using `WK.move` (pose indices from `Parameters`)

This version uses the pose indices directly (`0` for stand, `1` for duck), and relies on `WK.move(...)` to drive all servos together (with stepping + completion detection internally).

```javascript
let pr = new Parameters()
let wk = new WK()

let allServos = [0, 1, 2, 3, 4, 5]
let POSE_STAND = 0
let POSE_DUCK = 1

let pose = POSE_STAND
let fallEndTS = -1

basic.forever(function () {
    let falling = input.isGesture(Gesture.FreeFall)

    if (falling) {
        pose = POSE_DUCK
        fallEndTS = -1
    } else {
        if (pose == POSE_DUCK && fallEndTS < 0) {
            fallEndTS = control.millis()
        }
        if (fallEndTS >= 0 && control.millis() - fallEndTS > 2000) {
            pose = POSE_STAND
        }
    }

    // Drive the selected pose (one-state sequence)
    wk.move(pr, [pose], allServos, 2.0, [], 0.5)

    basic.pause(5)
})
```

### 7.6 Kungfu, Taiji, and Yoga

This example shows how to create **slow, steady, “flowing” motions** (Kungfu / Taiji / Yoga style) by moving joints in small increments rather than jumping directly to the final angle.

You’ll typically combine 3 APIs:

1. **`robotPuPro.servo(joint, angle)`**
   - Sets a joint immediately to an angle (good for resetting to a known starting pose).
2. **`robotPuPro.servoStep(joint, targetAngle, speed)`**
   - Moves the joint gradually toward `targetAngle`.
   - Smaller `speed` values produce slower / smoother motion.
3. **`robotPuPro.servoStepStatus(joint, targetAngle, speed)`**
   - Returns `0` when the joint has reached the target, otherwise non‑zero.
   - Useful for building “move-until-finished” loops while you simultaneously step other joints.

In the demo below:

- **`Stand()`** resets the robot to a neutral pose.
- **`Yoga()`** and **`Jump()`** are direct poses (instant set).
- **`Yoga2()`** and **`Yoga3()`** demonstrate a *controlled transition*:
  - One joint (the right leg) is treated as the *main* motion.
  - While the right leg is still moving (status non‑zero), the head yaw/pitch are stepped too, giving a coordinated “performance” feel.

Tuning tips:

- **Speed**: try `0.02` (very slow) to `0.10` (faster). If motion becomes jerky, lower the value.
- **Loop friendliness**: if you find the `while (...)` loop blocks other behaviors, add a tiny pause inside the loop (for example `basic.pause(1)` to `basic.pause(5)`).
- **Angle safety**: if a pose causes binding or strain, reduce extreme angles first (especially feet/legs) and test incrementally.

MakeCode share link:

https://makecode.microbit.org/#pub:40302-28555-29408-09924

```javascript
function Stand () {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 90)
}
function Yoga3 () {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
    while (robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, 170, 0.05) != 0) {
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 135, 0.05)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, 60, 0.05)
    }
}
function Yoga () {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 0)
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 30)
}
function Yoga2 () {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 70)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
    while (robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, 20, 0.05) != 0) {
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 45, 0.05)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, 90, 0.05)
    }
}
function Jump () {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 100)
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 45)
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 30)
}
basic.forever(function () {
    Stand()
    basic.pause(500)
    Jump()
    basic.pause(500)
    Yoga()
    basic.pause(500)
    Yoga2()
    Yoga3()
})