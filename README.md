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

The retail kit includes a **gamepad that uses the second micro:bit**. For the best experience (and to ensure the radio control protocol matches RobotPU’s `runKeyValueCMD` / `runStrCMD`), flash the official Robot PU gamepad program to the gamepad micro:bit:

- https://makecode.microbit.org/S34024-98531-58275-59424

## Activities and Use Cases

- **Little AI friend**: walk, dance, navigate, maze solving, chat, generate songs, sing
- **Games**: soccer, hide-and-seek, group dance/chorus
- **Learn-then-create**: programming, electronics, mechanics, 3D printing accessories
- **Community**: share code and parts, collaborate, coordinate multiple robots

## Installation

1. In MakeCode, open your micro:bit project.
2. Add extension → Import URL (or local path) → point to this repository.
3. Ensure the dependency to Billy voice is available (see Dependencies below).
4. Call any `RobotPU.*` block once in `on start` (for example `RobotPU.calibrate()` or `RobotPU.rest()`) to trigger auto-initialization.

If you are using the retail gamepad:

- Flash the official gamepad program to the **gamepad micro:bit**:
  - https://makecode.microbit.org/S34024-98531-58275-59424
- Make sure the gamepad and RobotPU micro:bit are on the same radio channel (see `channel()` / `set_channel(...)`).

## Dependencies

- core, radio, neopixel (from MakeCode)
- Billy voice package: github:adamish/pxt-billy

## Blocks / API

This extension auto-initializes the robot on the first call to any `RobotPU.*` API:

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

#### `walk_do(speed: number, turn: number): void`

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

#### `explore_do(): void`

- **Block**: `explore` (statement form)
- **What it does**: Same as `explore()` but discards the return value.

#### `dance(): number`

- **Block**: `dance`
- **What it does**: Beat-reactive dancing.
  - Uses `input.soundLevel()` to detect beats and vary movement.
  - Animates the NeoPixel LEDs during high beats.
- **Return**: `number` motion status (same convention as `walk`)

#### `dance_do(): void`

- **Block**: `dance` (statement form)
- **What it does**: Same as `dance()` but discards the return value.

#### `kick(): number`

- **Block**: `kick`
- **What it does**: A quick kick-like burst using an accelerated forward gait.
- **Return**: `number` motion status
  - Returns `0` when the kick completes and the robot transitions back to manual/neutral behavior internally.

#### `kick_do(): void`

- **Block**: `kick` (statement form)
- **What it does**: Same as `kick()` but discards the return value.

#### `jump(): number`

- **Block**: `jump`
- **What it does**: Executes a jump sequence.
  - Uses an auxiliary servo during the sequence.
- **Return**: `number` motion status
  - Returns `0` when the jump completes and the auxiliary servo retracts.

#### `jump_do(): void`

- **Block**: `jump` (statement form)
- **What it does**: Same as `jump()` but discards the return value.

#### `rest(): number`

- **Block**: `rest`
- **What it does**: Balanced idle / rest pose.
  - Keeps balance using the accelerometer.
  - Reacts to sound level with subtle motion.
- **Return**: `number` motion status (same convention as `walk`)

#### `rest_do(): void`

- **Block**: `rest` (statement form)
- **What it does**: Same as `rest()` but discards the return value.

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

#### `setServoTrim(left_foot: number, left_leg: number, right_foot: number, right_leg: number, head_yaw: number, head_pitch: number): void`

- **Block**: `set servo trim left foot %left_foot left leg %left_leg right foot %right_foot right leg %right_leg head yaw %head_yaw head pitch %head_pitch`
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

If you have the retail Robot PU gamepad, use the official gamepad program (it is designed to be compatible with RobotPU’s command keys and message formats):

- https://makecode.microbit.org/S34024-98531-58275-59424

#### Radio control protocol (micro:bit radio, including BLE-to-radio bridges)

RobotPU can be controlled over the micro:bit radio protocol by sending either:

- **Value messages** (recommended for joysticks / continuous control)
  - Send using `radio.sendValue(name, value)`
  - Receive using `radio.onReceivedValue((name, value) => ...)`
  - Forward to RobotPU using `RobotPU.runKeyValueCMD(name, value)`
- **String messages** (recommended for text, singing, and simple triggers)
  - Send using `radio.sendString(text)`
  - Receive using `radio.onReceivedString((text) => ...)`
  - Forward to RobotPU using `RobotPU.runStrCMD(text)`

**Important note about `radio.sendValue`**:

- micro:bit radio “value” packets are transmitted as integers.
- For **movement control** (`#puspeed`, `#puturn`), it’s common to send scaled integers (for example `-100 .. 100`) representing a normalized value.
- For **gesture head control** (`#puroll`, `#pupitch`), the official gamepad program sends angles (degrees) so RobotPU can yaw/pitch its head.

**Channel / pairing**:

- RobotPU uses the micro:bit radio **group** as its channel.
- Use `RobotPU.channel()` / `RobotPU.set_channel(...)` (or `radio.setGroup(...)` on the sender) so both devices are on the same group (0..255).

**Receiver (RobotPU micro:bit) example**:

```ts
radio.onReceivedValue(function (name, value) {
    RobotPU.runKeyValueCMD(name, value)
})
radio.onReceivedString(function (text) {
    RobotPU.runStrCMD(text)
})
```

**Sender (gamepad micro:bit) example**:

```ts
// send joystick values as integers (recommended)
// your gamepad program may choose any scale; RobotPU uses the value you send
radio.sendValue("#puspeed", 80)
radio.sendValue("#puturn", -40)

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

If your controller is a phone/app over BLE, the typical architecture is:

- Phone/app (BLE)
- Controller micro:bit receives BLE events and converts them to `radio.sendValue(...)` / `radio.sendString(...)`
- RobotPU micro:bit receives radio and calls `RobotPU.runKeyValueCMD(...)` / `RobotPU.runStrCMD(...)`

#### `runStrCMD(s: string): void`

- **Block**: `execute command %s`
- **What it does**: Parses and executes a string command.
- **Supported command formats**:
  - `#put<text>`: speak `<text>` (text-to-speech)
  - `#pus<song>`: sing `<song>`
  - `#puhi<name>`: speak “My friend <name> is here”
  - `#pun<sn>`: set the robot serial/name string to `<sn>` and then `greet()`

#### `runKeyValueCMD(key: string, v: number): void`

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

#### `set_channel(channel: number): void`

- **Block**: `set channel to %channel`
- **What it does**: Sets the radio group/channel used for communication.
- **Parameter**:
  - `channel`: `0 .. 255`

#### `change_channel(delta: number): void`

- **Block**: `change channel by %delta`
- **What it does**: Adjusts the radio group/channel by `delta`.
- **Notes**:
  - Values wrap into `0..255`.

## Example (JavaScript)

```ts
input.onButtonPressed(Button.A, function () {
    RobotPU.walk(2, 0)
})
input.onButtonPressed(Button.B, function () {
    RobotPU.rest()
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    RobotPU.dance()
})
// Background exploration
basic.forever(function () {
    RobotPU.explore()
})
// response to radio commands from gamepad
radio.onReceivedValue(function (name, value) {
    RobotPU.runKeyValueCMD(name, value)
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
