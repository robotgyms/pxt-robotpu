
# 📡 Robot PU: Barebones Radio Receiver

This is the smallest possible starting point for letting **Robot PU** receive commands over **micro:bit radio**.

---

## What you will build

You will program PU’s micro:bit to:

- Connect to the gamepad (or any radio sender) with a single call.
- Set your own radio channel for the robot and gamepad so only your devices talk to each other.
- Give your Robot PU its own name.

When it works: **tilt the joystick and PU walks; press gamepad button B4 and PU kicks.**

---

## Requirements

- Robot PU with a micro:bit in its brain
- Robot PU gamepad: a second micro:bit running the controller program — see the minimal setup in [pxt-robotpu-gamepad/hello-robotpu.md](https://github.com/robotgyms/pxt-robotpu-gamepad/blob/main/tutorials/hello-robotpu.md) or the full reference in [gamepad.md](gamepad.md)

---

## Step 1 — Load the Robot PU extension

In the MakeCode editor (https://makecode.microbit.org/):

1. Create a **New Project**.
2. Click **Extensions**, paste `https://github.com/robotgyms/pxt-robotpu`, and select it.

The editor will then recognize `robotPuPro.*` blocks.

## Step 2 — Flash the 2-line program to PU's brain

```typescript
// Set the radio channel (0-255, factory default is 166)
robotPuPro.setChannel(166)
// Connect to the gamepad
robotPuPro.connectToGamepad()
```

Download this program to the micro:bit inside **Robot PU's head**.

> ⚠️ **On the first flash** the robot will stand up and calibrate itself — about 4 seconds of servo motion and eye flashes. This is normal; it happens once, the first time any `robotPuPro.*` block runs.

## Step 3 — Set up the gamepad micro:bit

Create a **separate** MakeCode project, add the gamepad extension (**Extensions → paste `https://github.com/robotgyms/pxt-robotpu-gamepad` → select it**), then:

```typescript
robotPuGamepad.setChannel(166)
robotPuGamepad.start()
// optional: set the name your gamepad uses to greet the robot
robotPuGamepad.setName("PU")
```

Download this program to the **gamepad micro:bit**.

> ⚠️ **Two programs, two micro:bits**: `robotPuPro.*` goes to PU's brain; `robotPuGamepad.*` goes to the gamepad. Each extension only works on its own device.

## Step 4 — Pair: both devices on the same channel

`setChannel(...)` sets the **micro:bit radio group** on both sides — the two devices can only talk when the numbers match. Valid range is `0 .. 255`.

- `166` is the **factory default** — every Robot PU ships on it. If other Robot PUs are nearby (classroom, demo), their gamepads will interfere with yours — pick your own channel.
- **Manual change**: press button **A** (+1) or **B** (−1) on either device until both show the same number. (PU's buttons need the full program below; the gamepad shows its channel on its display.)
- **In code**: set your own default — `robotPuPro.setChannel(n)` on PU and `robotPuGamepad.setChannel(n)` on the gamepad.
- **If PU doesn't react**: check both devices show the same channel, then try sending `#putHello!` — PU should say it.

## Step 5 — Try it

- Move the joystick → PU walks and steers.
- Press gamepad **B4** → PU kicks. (See the button table in the appendix for the rest.)
- Radio drops out or gamepad turns off? The first received command arms PU's **dead-man watchdog** — PU stops on its own within ~2 seconds.

## Step 6 — Make it yours

- **Channel**: move both devices off `166` (Step 4) so friends' robots can't grab your radio.
- **Name**: the gamepad's `robotPuGamepad.setName("PU")` sends a `#pun` greeting — PU learns its name and speaks "My name is …". Change the string to rename your robot.
- **Channel buttons on PU** (optional full program):

```typescript
robotPuPro.setChannel(166)
robotPuPro.connectToGamepad()

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
  robotPuPro.toggleServoTrim()   // servo trim mode on/off
})
input.onButtonPressed(Button.A, function() {
  robotPuPro.changeChannel(1)    // channel +1
})
input.onButtonPressed(Button.B, function () {
  robotPuPro.changeChannel(-1)   // channel -1
})
```

---

## Appendix

### What `connectToGamepad()` does

It registers the two radio listeners and forwards every message into Robot PU:

```typescript
radio.onReceivedValue(function(name: string, value: number) {
  robotPuPro.runKeyValueCommand(name, value)
})
radio.onReceivedString(function(receivedString: string) {
  robotPuPro.runStringCommand(receivedString)
})
```

Use the manual version instead if you want to **intercept** a key before it reaches Robot PU (handle it, then `return` without forwarding).

### Gamepad controls reference

| Gamepad input          | Radio message          | What Robot PU does                              |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| Joystick up/down       | `#puspeed` `-1 .. 1`   | walk forward / backward (dead-zone around 0)    |
| Joystick left/right    | `#puturn` `-1 .. 1`    | turn left / right while walking                 |
| Tilt left / right      | `#puroll` `-90 .. 90`  | nudge PU's head left / right (yaw)*             |
| Tilt forward / back    | `#pupitch` `-90 .. 90` | nudge PU's head down / up (pitch)*              |

\* `#puroll` / `#pupitch` only move the head while PU is in the **Drive** action **and** nearly stopped (|walkSpeed| < 0.1). They do not balance the body.

| Gamepad input       | Radio message     | Normal mode          | Servo trim mode            |
| ------------------- | ----------------- | -------------------- | -------------------------- |
| Stop button         | `#puB` `0`        | stop and rest        | exit trim mode (no save)   |
| B1                  | `#puB` `1`        | explore autonomously | trim selected servo `-1°`  |
| B2                  | `#puB` `2`        | jump                 | select next servo          |
| B3                  | `#puB` `3`        | dance                | select previous servo      |
| B4                  | `#puB` `4`        | kick                 | trim selected servo `+1°`  |
| Logo                | `#pulogo` `1` or `#put<text>` | announce status / speak a phrase | same |

Gamepad's own A/B buttons change the gamepad's channel (shown on its display); A+B sends `#pun<name>` to set PU's name and trigger a greet.

Servo trim mode is entered/exited by pressing the **logo button on Robot PU's head** — see [servo-trim-calibration.md](servo-trim-calibration.md).

### Plain-sender alternative

If you use a **plain sender** micro:bit (no gamepad extension), use `radio.setGroup(166)` — not `robotPuPro.setChannel(166)`. Calling any `robotPuPro.*` block runs the full robot startup (stand → calibrate, ~4 s of servo/I2C activity), which a sender-only micro:bit doesn't need.
