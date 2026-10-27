
# 📡 Robot PU: Barebones Program for Control

This is the smallest possible starting point for letting **Robot PU** receive commands over **micro:bit radio**.

---

## What you will build

You will program PU’s micro:bit to:

- Connect to the gamepad (or any radio sender) with a single call. *(Step 3)*
- Set your own radio channel for the robot and gamepad so only your devices talk to each other. *(Steps 1 & 7)*
- Give your Robot PU its own name. *(Step 4)*

When it works: **tilt the joystick and PU walks; press gamepad button B2 and PU Jumps.**

> 🎁 **Open box and play**: Both Robot PU and the gamepad ship from the factory already flashed — the robot runs this exact barebones program and the gamepad runs its controller program, both on the default channel `166`. If you don't want to change anything, **skip straight to Step 6** — just power on both devices and start driving. The earlier steps show how to *rebuild or customize* the factory programs yourself.
>
> ⚠️ **More than one brand-new Robot PU?** Every new robot + gamepad ships on channel `166`, so two out-of-the-box pairs powered on together will cross-talk — each gamepad drives *every* nearby robot. Fix it **before** a group session: pick a unique channel per pair and change the robot and gamepad **at the same time** (Step 1 — e.g. pair A on `167`, pair B on `168`).

---

## Requirements

- Robot PU with a micro:bit in its brain
- Robot PU gamepad: a second micro:bit running the controller program 

---
## Step 1 - Pick your radio channel

Choose a unique channel number (0-255) that's not used by other Robot PUs in your area. The factory default is `166`. If you are testing with multiple Robot PUs, make sure to use different channels for each student's pair.

## Step 2 — Load the Robot PU extension

In the MakeCode editor (https://makecode.microbit.org/):

1. Create a **New Project**.
2. Click **Extensions**, paste `https://github.com/robotgyms/pxt-robotpu`, and select it.

The editor will then recognize `robotPuPro.*` blocks.

## Step 3 — Flash the 2-line program to PU's brain

Copy the following code into the MakeCode editor:

```typescript
// Set YOUR radio channel (0-255, factory default is 166)
robotPuPro.setChannel(166)
// Connect to the gamepad
robotPuPro.connectToGamepad()
```
Change the channel number to the one you chose in Step 1.

Download this program to the micro:bit inside **Robot PU's head**.

> ⚠️ **On the first flash** the robot will stand up and calibrate itself — about 4 seconds of servo motion and eye flashes. This is normal; it happens once, the first time any `robotPuPro.*` block runs.

## Step 4 — Set up the gamepad and name your robot

Create a **separate** MakeCode project, add the gamepad extension (**Extensions → paste `https://github.com/robotgyms/pxt-robotpu-gamepad` → select it**), then copy the following code into the MakeCode editor:

```typescript
// Set YOUR radio channel (0-255, must match PU's channel from Step 1. Factory default is 166)
robotPuGamepad.setChannel(166)
robotPuGamepad.start()
// optional: give your Robot PU a name
robotPuGamepad.setName("PU")
```

Change the channel number to the one you chose in Step 1, and pick a name for your robot — PU speaks "My name is …" when it greets you.

Download this program to the **gamepad micro:bit**.

> ⚠️ **Two programs, two micro:bits**: `robotPuPro.*` goes to PU's brain; `robotPuGamepad.*` goes to the gamepad. Each extension only works on its own device.
>
> 💡 Factory gamepads already run this program — the steps above are for rebuilding or customizing it. See [pxt-robotpu-gamepad/hello-robotpu.md](https://github.com/robotgyms/pxt-robotpu-gamepad/blob/main/tutorials/hello-robotpu.md) for the minimal setup and [gamepad.md](gamepad.md) for the full reference.

## Step 5 — Check pairing: same channel?

Channel numbers are shown on each micro:bit's **LED display**. The channel on PU's brain micro:bit must match the gamepad micro:bit's. If they don't, set the same `setChannel(...)` number in both programs and re-flash — or use the A/B button method in Step 7.

`setChannel(...)` sets the **micro:bit radio group** on both sides — the two devices can only talk when the numbers match. Valid range is `0 .. 255`. The channel written in the program is **baked in at flash time** — changing the number in code does nothing until you re-flash.

- `166` is the **factory default** — every Robot PU ships on it. If other Robot PUs are nearby (classroom, demo), their gamepads will interfere with yours — pick your own channel.
- 🧑‍🏫 **Teachers**: assign each student/pair a **unique channel** (`167`, `168`, `169`, …) *before* anyone flashes. If everyone flashes the default `166` first, all robots cross-talk during the lesson — flash once with the assigned channel already in the code instead of flashing `166` and fixing it later.
- **Manual change**: press button **A** (+1) or **B** (−1) on either device until both show the same number — the current channel is shown on the **LED display** of both micro:bits. (PU's buttons need the program in Step 7.)
- **In code**: set your own default — `robotPuPro.setChannel(n)` on PU and `robotPuGamepad.setChannel(n)` on the gamepad.
- **If PU doesn't react**: check both devices show the same channel, and both are powered on.

## Step 6 — Try it

- Move the joystick → PU walks and steers.
- Press gamepad **B2** → PU jumps. (See the button table in the appendix for the rest.)
- Radio drops out or gamepad turns off? The first received command arms PU's **dead-man watchdog** — PU stops on its own within ~2 seconds.

## Step 7 — Make it flexible: change channel on the fly

What if another Robot PU nearby happens to use the same channel as yours?

You can change the channel on the fly by pressing button **A** (+1) or **B** (−1) on either device until both show the same number — the current channel is shown on the **LED display** of both micro:bits. The gamepad's buttons already do this; PU's buttons need the program below.

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

On the gamepad side no extra code is needed — A/B channel changing is already built into `robotPuGamepad.start()`.

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

> 📖 **Read this table before driving** — some buttons do more than move. In particular **B1 makes PU walk off and explore on its own** (it keeps going until you press Stop). Pressing it by accident on a crowded table = a wandering robot.

Gamepad's own A/B buttons change the gamepad's channel (shown on its display); A+B sends `#pun<name>` to set PU's name and trigger a greet.

Servo trim mode is entered/exited by pressing the **logo button on Robot PU's head** — see [servo-trim-calibration.md](servo-trim-calibration.md).

### Plain-sender alternative

If you use a **plain sender** micro:bit (no gamepad extension), use `radio.setGroup(166)` — not `robotPuPro.setChannel(166)`. Calling any `robotPuPro.*` block runs the full robot startup (stand → calibrate, ~4 s of servo/I2C activity), which a sender-only micro:bit doesn't need.
