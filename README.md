# RobotPU MakeCode Extension

## Overview

RobotPU is a playful, programmable robot built on BBC micro:bit. This extension exposes high‑level behaviors of the PU robot so learners can create interactive projects with block coding or JavaScript/TypeScript in MakeCode.

PU can walk, autopilot, dance, kick, jump, rest, talk, and sing. It reacts to music, balances using its IMU, and navigates with an ultrasonic sensor.
The retail kit includes a gamepad built from the second micro:bit for radio-based remote control, including gesture head control (tilt to yaw/pitch PU’s head).
![RobotPU](https://raw.githubusercontent.com/robotgyms/pxt-RobotPU/main/assets/robotpu.png)

Learn more about The Story of PU, which shows robot PU's activities, hardware, software, tutorials, and upgrade projects at:
- https://robotgyms.com/pu
- https://www.youtube.com/@TheStoryofPu-yw8tr
- https://www.tiktok.com/@thestoryofpu

Purchase Links: 
- https://robotgyms.com/product/robot-pu/
- https://www.amazon.com/Robot-Programmable-Interactive-Upgradable-Self-Balancing/dp/B0DR8RGVXN

## Features

- **Expressive personality**: dance routines, reactions, auto-pilot, soccer
- **Classroom-ready** with block coding and Python paths
- **Maker-friendly** with free tutorials and upgrade projects
- **Open-source** with community resources

## What’s in the Kit (typical)

- Robot PU (pre-built and upgradable)
- 2× micro:bit
- Gamepad
- Manual
- Online tutorials and examples

The retail kit includes a **gamepad that uses the second micro:bit**. For the best experience (and to ensure the radio control protocol matches robotPu’s `runKeyValueCommand` / `runStringCommand`), flash the official Robot PU gamepad program to the gamepad micro:bit:

- https://makecode.microbit.org/S34024-98531-58275-59424

## Activities and Use Cases

- **Little AI friend**: walk, dance, navigate, maze solving, chat, generate songs, sing
- **Games**: soccer, hide-and-seek, group dance/chorus
- **Learn-then-create**: programming, electronics, mechanics, 3D printing accessories
- **Community**: share code and parts, collaborate, coordinate multiple robots

## Quick Start (with the retail gamepad)

1. Flash your **Robot PU micro:bit** with a MakeCode project that uses this extension.
2. Flash your **gamepad micro:bit** with the official Robot PU gamepad program:
   - https://makecode.microbit.org/S34024-98531-58275-59424
3. Ensure both micro:bits use the same radio channel (group):
   - Use `robotPu.setChannel(...)` in your Robot PU project, or set the same `radio.setGroup(...)` on both devices.
4. In your Robot PU project, forward radio messages to robotPu (see the Remote Control section for example code).

## Installation

1. In MakeCode, open your micro:bit project.
2. Add extension → Import URL (or local path) → point to this repository.
3. Ensure the dependency to Billy voice is available (see Dependencies below).
4. Call any `robotPu.*` block once in `on start` (for example `robotPu.calibrate()` or `robotPu.rest()`) to trigger auto-initialization.

## Dependencies

- core, radio, neopixel (from MakeCode)
- Billy voice package: github:adamish/pxt-billy

## Blocks / API

This extension auto-initializes the robot on the first call to any `robotPu.*` API:

- **Creates** an internal `RobotPu` instance
- **Runs** `calibrate()` once
- **Starts** a background loop that continuously updates sensors and runs the internal behavior state machine

Because of this, there is **no separate `init` block** in the current API.

### Actions

#### `greet()`

- **Block**: `greet`
- **What it does**: Speaks an introduction using Billy voice (includes the robot serial string and name).
- **Return**: `void`

#### `walk(speed: number, turn: number): number`

- **Block**: `walk speed %speed turn %turn`
- **Parameters**:
  - `speed`: `-5 .. 5`
    - Positive = forward
    - Negative = backward
  - `turn`: `-1 .. 1`
    - `-1` = hard left
    - `0` = straight
    - `1` = hard right
- **What it does**: Executes a self-balancing walking gait using the micro:bit accelerometer.
- **Return**: `number` motion status
  - `1` means the gait step is still in progress
  - `0` means the current step completed (the internal gait state advanced)
- **Notes**:
  - This is designed to be called repeatedly (e.g. inside `basic.forever`).
  - You may use speed higher than 5 to make the robot move faster but the robot will be less stable because it cannot balance well due to the limited sampling rate of IMU and servo action speed.

#### `walkDo(speed: number, turn: number): void`

- **Block**: `walk speed %speed turn %turn` (statement form)
- **What it does**: Same as `walk(...)` but discards the return value.

#### `explore(): number`

- **Block**: `explore`
- **What it does**: Autonomous obstacle avoidance using the onboard ultrasonic sensor (HCSR04).
  - Samples distance ahead while sweeping and steers toward the most open direction.
  - Internally calls `walk(...)` with computed speed/turn.
- **Return**: `number` motion status (same convention as `walk`)
- **Notes**:
  - The explore speed range is influenced by `setWalkSpeedRange(min, max)`.

#### `exploreDo(): void`

- **Block**: `explore` (statement form)
-- **What it does**: Same as `explore()` but discards the return value.

#### `dance(): number`

- **Block**: `dance`
- **What it does**: Beat-reactive dancing.
  - Uses `input.soundLevel()` to detect beats and vary movement.
  - Animates the NeoPixel LEDs during high beats.
- **Return**: `number` motion status (same convention as `walk`)

#### `danceDo(): void`

- **Block**: `dance` (statement form)
-- **What it does**: Same as `dance()` but discards the return value.

#### `kick(): number`

- **Block**: `kick`
- **What it does**: A quick kick-like burst using an accelerated forward gait.
- **Return**: `number` motion status
  - Returns `0` when the kick completes and the robot transitions back to manual/neutral behavior internally.

#### `kickDo(): void`

- **Block**: `kick` (statement form)
-- **What it does**: Same as `kick()` but discards the return value.

#### `jump(): number`

- **Block**: `jump`
- **What it does**: Executes a jump sequence.
  - Uses an auxiliary servo during the sequence.
- **Return**: `number` motion status
  - Returns `0` when the jump completes and the auxiliary servo retracts.

#### `jumpDo(): void`

- **Block**: `jump` (statement form)
-- **What it does**: Same as `jump()` but discards the return value.

#### `rest(): number`

- **Block**: `rest`
- **What it does**: Balanced idle / rest pose.
  - Keeps balance using the accelerometer.
  - Reacts to sound level with subtle motion.
- **Return**: `number` motion status (same convention as `walk`)

#### `restDo(): void`

- **Block**: `rest` (statement form)
-- **What it does**: Same as `rest()` but discards the return value.

#### `talk(text: string): void`

- **Block**: `talk %text`
- **What it does**: Text-to-speech using the Billy voice package.
- **Parameters**:
  - `text`: Text to speak.

#### `sing(s: string): void`

- **Block**: `sing %s`
- **What it does**: Sings a Billy phonetic / song-string.
- **Parameters**:
  - `s`: Phonetic/song string supported by Billy.

### Setup

#### `setServoTrim(leftFoot: number, leftLeg: number, rightFoot: number, rightLeg: number, headYaw: number, headPitch: number): void`

- **Block**: `set servo trim left foot %leftFoot left leg %leftLeg right foot %rightFoot right leg %rightLeg head yaw %headYaw head pitch %headPitch`
- **What it does**: Sets persistent trim offsets (in degrees) added to the target servo angles.
- **When to use**: If your robot does not stand level, walks crooked, or the head is not centered.
- **Notes**:
  - Trims are applied immediately and remain active until changed.

#### `calibrate(): void`

- **Block**: `calibrate`
- **What it does**: Runs a calibration routine.
  - Moves to a calibration pose.
  - Flashes the eyes for feedback.
  - Returns to neutral pose.
- **Notes**:
  - Calibration is already run once automatically on first use; call this again if you changed trim or hardware.

#### `setWalkSpeedRange(min: number, max: number): void`

- **Block**: `set walk speed range min %min max %max`
- **What it does**: Sets the robot’s internal maximum speed scalars used by autonomous behaviors and remote control.
- **Parameters**:
  - `min`: backward max speed (typically negative)
  - `max`: forward max speed (typically positive)
- **Notes**:
  - This affects `explore()` speed planning and remote-control mapping.

### Remote Control

These APIs are intended for advanced integrations (custom gamepads / phone apps / another micro:bit sending commands).

If you have the retail Robot PU gamepad, use the official gamepad program (it is designed to be compatible with RobotPU’s command keys and message formats).

#### Radio control protocol (micro:bit radio, including BLE-to-radio bridges)

RobotPU can be controlled over the micro:bit radio protocol by sending either:

- **Value messages** (recommended for joysticks / continuous control)
  - Send using `radio.sendValue(name, value)`
  - Receive using `radio.onReceivedValue((name, value) => ...)`
  - Forward to robotPu using `robotPu.runKeyValueCommand(name, value)`
- **String messages** (recommended for text, singing, and simple triggers)
  - Send using `radio.sendString(text)`
  - Receive using `radio.onReceivedString((text) => ...)`
  - Forward to robotPu using `robotPu.runStringCommand(text)`

**Important note about `radio.sendValue`**:

- micro:bit radio “value” packets are transmitted as integers.
- For **movement control** (`#puspeed`, `#puturn`), RobotPU expects a value roughly in `-1 .. 1`.
  - If your controller sends a different scale (for example `-100 .. 100`), scale it on the receiver before calling `robotPu.runKeyValueCommand`.
- For **gesture head control** (`#puroll`, `#pupitch`), values are treated as angles (degrees) to yaw/pitch PU’s head.

**Channel / pairing**:

- RobotPU uses the micro:bit radio **group** as its channel.
- Use `robotPu.channel()` / `robotPu.setChannel(...)` (or `radio.setGroup(...)` on the sender) so both devices are on the same group (0..255).

**Receiver (RobotPU micro:bit) example**:

```ts
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
radio.onReceivedString(function (text) {
    robotPu.runStringCommand(text)
})
```

**Sender (gamepad micro:bit) example**:

```ts
// movement (normalized)
radio.sendValue("#puspeed", 1)
radio.sendValue("#puturn", -1)

// gesture remote control (head): send micro:bit roll/pitch as degrees
// RobotPU maps #puroll/#pupitch to head yaw/pitch offsets (smoothed internally)
radio.sendValue("#puroll", input.rotation(Rotation.Roll))
radio.sendValue("#pupitch", input.rotation(Rotation.Pitch))
// text actions
radio.sendString("#putHello!")
```

**Gesture remote control (gamepad)**:

- The retail gamepad program reads the gamepad micro:bit’s tilt:
  - **Roll** (left/right tilt) → sends `#puroll`
  - **Pitch** (forward/back tilt) → sends `#pupitch`
- RobotPU uses these values to control its head orientation:
  - `#puroll` controls head **yaw** (left/right)
  - `#pupitch` controls head **pitch** (up/down)
- Values are interpreted as **degrees of offset** and are smoothed internally.
- Recommended range: `-90 .. 90` (values outside this range may saturate at servo limits).

**Custom controller scaling (optional)**:

If your controller sends larger integers for movement (for example `-100 .. 100`), scale them before forwarding:

```ts
radio.onReceivedValue(function (name, value) {
    if (name == "#puspeed" || name == "#puturn") {
        robotPu.runKeyValueCommand(name, value / 100)
    } else {
        robotPu.runKeyValueCommand(name, value)
    }
})
```

If your controller is a phone/app over BLE, the typical architecture is:

- Phone/app (BLE)
- Controller micro:bit receives BLE events and converts them to `radio.sendValue(...)` / `radio.sendString(...)`
- RobotPU micro:bit receives radio and calls `robotPu.runKeyValueCommand(...)` / `robotPu.runStringCommand(...)`

#### `runStringCommand(s: string): void`

- **Block**: `execute command %s`
- **What it does**: Parses and executes a string command.
- **Supported command formats**:
  - `#put<text>`: speak `<text>` (text-to-speech)
  - `#pus<song>`: sing `<song>`
  - `#puhi<name>`: speak “My friend <name> is here”
  - `#pun<sn>`: set the robot serial/name string to `<sn>` and then `greet()`

#### `runKeyValueCommand(key: string, v: number): void`

- **Block**: `execute command key %key value %v`
- **What it does**: Executes a key/value command (mostly used for joystick-style control).
- **Supported keys**:
  - `#puspeed`: forward/back command.
    - Recommended normalized range: `-1 .. 1` (after scaling/normalization)
    - A deadzone of about `±0.2` is applied.
    - Internally scaled by the configured max speeds (see `setWalkSpeedRange(min, max)`).
  - `#puturn`: turn command.
    - Recommended normalized range: `-1 .. 1` (after scaling/normalization)
    - Smoothed internally (low-pass).
  - `#puroll`: roll bias (head/body side tilt).
    - Recommended range: `-90 .. 90`
    - Smoothed internally.
  - `#pupitch`: pitch bias (head/body up/down).
    - Recommended range: `-90 .. 90`
    - Smoothed internally; sign is inverted internally.
  - `#puB`: set internal behavior/state (advanced).
    - Examples: `1` explore, `3` dance, `4` kick, `2` jump.
  - `#pulogo`: speak serial/name (advanced).
  - `#purs`: set rest pose index (advanced).
    - Example: send `26` for the rest pose.

### Variables

#### `channel(): number`

- **Block**: `channel`
- **What it does**: Returns the current radio group/channel used for communication.
- **Return**: `0 .. 255`

#### `setChannel(channel: number): void`

- **Block**: `set channel to %channel`
- **What it does**: Sets the radio group/channel used for communication.
- **Parameter**:
  - `channel`: `0 .. 255`

#### `changeChannel(delta: number): void`

- **Block**: `change channel by %delta`
- **What it does**: Adjusts the radio group/channel by `delta`.
- **Notes**:
  - Values wrap into `0..255`.

## Example (JavaScript)

```ts
// Initialize robot by ask it to greet
robotPu.greet()

// press button A to walk forward in circles
input.onButtonPressed(Button.A, function () {
    for (let index = 0; index < 400; index++) {
        robotPu.walk(3, -0.5)
    }
})
// logo up to sing
input.onGesture(Gesture.LogoUp, function () {
    robotPu.sing("E D G F B A C5 B ")
})
// tilt left to kick
input.onGesture(Gesture.TiltLeft, function () {
    robotPu.kick()
})
// face down to talk
input.onGesture(Gesture.ScreenDown, function () {
    robotPu.talk("Put me down")
})
// press button A+B to do autopilot
input.onButtonPressed(Button.AB, function () {
    for (let index = 0; index < 4000; index++) {
        robotPu.explore()
    }
})
// Register the event listener for incoming string messages
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
// press button B to walk backward in circles
input.onButtonPressed(Button.B, function () {
    for (let index = 0; index < 400; index++) {
        robotPu.walk(-1, -0.5)
    }
})
// tilt right to jump
input.onGesture(Gesture.TiltRight, function () {
    robotPu.jump()
})
// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
// logo down to rest
input.onGesture(Gesture.LogoDown, function () {
    robotPu.rest()
})
// press logo button to dance using set mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    robotPu.setMode(robotPu.Mode.Dance)
})
```

## Tips

- **Speed and turning**: positive speed walks forward, negative walks backward; `turn` is −1 (left) to 1 (right).
- **Explore** uses the onboard ultrasonic sensor (HCSR04) for obstacle avoidance.
- **Voice**: `talk` and `sing` require the Billy voice dependency.

## License

- Apache License 2.0. See `LICENSE`.
- Copyright © 2025 Robot Gyms Inc.

## Acknowledgments

- PU robot concept and kit by Robot Gyms. This MakeCode extension wraps the robot behaviors for education and rapid prototyping.
