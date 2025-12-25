
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

---

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

In `Parameters.stateTargets`, pose `0` is the neutral **stand** pose and pose `1` is a compact **duck** pose.

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