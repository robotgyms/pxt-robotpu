
# 📡 Robot PU: Barebones Radio Receiver

This is the smallest possible starting point for letting **Robot PU** receive commands over **micro:bit radio**.

---

## What you will build

You will program PU’s micro:bit to:

- Connect to the gamepad (or any radio sender) with a single call.
- Use a specific radio channel so only your devices talk to each other.
- Change channels and toggle servo trim mode from PU’s own buttons.

---

## Requirements

- Robot PU with a micro:bit
- Robot PU gamepad: a second micro:bit running the controller program — see [gamepad.md](gamepad.md), or the minimal gamepad setup in the [pxt-robotpu-gamepad repo](https://github.com/robotgyms/pxt-robotpu-gamepad/blob/main/tutorials/hello-robotpu.md)

---

## Pairing: both devices on the same channel

Radio messages only reach each other if the **radio group numbers match**. The Robot PU channel **is** the micro:bit radio group:

```typescript
// Robot PU side
robotPuPro.setChannel(166)
robotPuPro.connectToGamepad()

// Gamepad side (pxt-robotpu-gamepad extension)
robotPuGamepad.setChannel(166)
robotPuGamepad.start()
```

- Both lines set radio group `166` — pick any `0..255` you like, as long as both devices use the same number.
- The default gamepad program uses channel `166`, so `166` works out of the box.
- To re-pair at runtime, press button **A**/**B** on either device to step its channel up/down until they match (the full program below wires PU's buttons; the gamepad's own A/B buttons do the same there).
- If PU does not react: check that both devices show the same channel number, then try a `#putHello!` string to confirm the link.

---

## Load the Robot PU MakeCode Extension

To use the `robotPuPro.*` blocks/APIs, you must add the Robot PU extension into your MakeCode project.

1. Open the MakeCode editor: https://makecode.microbit.org/
2. Create a **New Project** (or open your existing one).
3. Click **Extensions** (in the gear menu or toolbox, depending on the MakeCode layout).
4. Search for the extension by pasting this GitHub URL:

   `https://github.com/robotgyms/pxt-robotpu`

5. Select the extension to add it to your project.

After that, the editor will recognize calls like `robotPuPro.setChannel(...)` and `robotPuPro.connectToGamepad()`.

---

## Minimal version of barebone program (copy into MakeCode JavaScript)

```typescript
// Set the radio channel to 166
robotPuPro.setChannel(166)
// Connect to the gamepad
robotPuPro.connectToGamepad()
```
Two lines of code to establish robot remote control with gamepad.
> **Note**: This is the minimal version. You can add more functionality as needed.  

---

## Full version of barebone program (copy into MakeCode JavaScript)

```typescript
// Set the radio channel to 166
robotPuPro.setChannel(166)
// Connect to the gamepad
robotPuPro.connectToGamepad()

// Toggle servo trim mode when the logo button is pressed
input.onLogoEvent(TouchButtonEvent.Pressed, function() {
  robotPuPro.toggleServoTrim()
})

// Increase the radio channel when button A is pressed
input.onButtonPressed(Button.A, function() {
  robotPuPro.changeChannel(1)
})

// Decrease the radio channel when button B is pressed
input.onButtonPressed(Button.B, function () {
  robotPuPro.changeChannel(-1)
})
```

---

## How it works

- `robotPuPro.setChannel(166)`
  - Sets the radio channel/group.
  - Your gamepad micro:bit must use the **same** channel number.
- `robotPuPro.connectToGamepad()`
  - Registers the two radio listeners and forwards every message into Robot PU:
    - `radio.onReceivedValue(...)` → `robotPuPro.runKeyValueCommand(name, value)` (joystick axes and buttons)
    - `radio.onReceivedString(...)` → `robotPuPro.runStringCommand(text)` (speak/sing phrases)
  - It is exactly equivalent to writing this yourself:

    ```typescript
    // Listen for radio name/value pairs from gamepad and other robot devices
    radio.onReceivedValue(function(name: string, value: number) {
      robotPuPro.runKeyValueCommand(name, value)
    })
    // Listen for radio strings from gamepad and other robot devices
    radio.onReceivedString(function(receivedString: string) {
      robotPuPro.runStringCommand(receivedString)
    })
    ```

  - Use the manual version instead if you ever want to **intercept** a key before it reaches Robot PU (handle it, then `return` without forwarding).

> Note: the first radio command received turns on Robot PU's dead-man watchdog. If the gamepad stops sending (off or out of range), PU stops moving on its own.

---

## Using the gamepad

Once the channels match, everything the gamepad sends is handled automatically.

### Joysticks and tilt

| Gamepad input          | Radio message          | What Robot PU does                              |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| Joystick up/down       | `#puspeed` `-1 .. 1`   | walk forward / backward (dead-zone around 0)    |
| Joystick left/right    | `#puturn` `-1 .. 1`    | turn left / right while walking                 |
| Tilt left / right      | `#puroll` `-90 .. 90`  | nudge PU's head left / right (yaw)*             |
| Tilt forward / back    | `#pupitch` `-90 .. 90` | nudge PU's head down / up (pitch)*              |

\* `#puroll` / `#pupitch` only move the head while PU is in the **Drive** action **and** nearly stopped (|walkSpeed| < 0.1). They nudge head yaw/pitch — they do not balance the body.

### Buttons

| Gamepad input       | Radio message     | Normal mode          | Servo trim mode            |
| ------------------- | ----------------- | -------------------- | -------------------------- |
| Stop button         | `#puB` `0`        | stop and rest        | exit trim mode (no save)   |
| B1                  | `#puB` `1`        | explore autonomously | trim selected servo `-1°`  |
| B2                  | `#puB` `2`        | jump                 | select next servo          |
| B3                  | `#puB` `3`        | dance                | select previous servo      |
| B4                  | `#puB` `4`        | kick                 | trim selected servo `+1°`  |
| Logo                | `#pulogo` `1` or `#put<text>` | announce status / speak a phrase | same |

### Gamepad micro:bit A/B buttons (channel select)

These run **on the gamepad itself**, not on PU — they change the gamepad's radio group so it can pair with a robot on a different channel:

| Gamepad input | Effect                                             |
| ------------- | -------------------------------------------------- |
| A             | channel `+1` (shows the new channel)               |
| B             | channel `-1` (shows the new channel)               |
| A+B           | sends `#pun<name>` — sets PU's serial number `sn` (what `greet()` speaks as "My name is ..."); PU greets you |

On the robot side, the `input.onButtonPressed(Button.A/B)` blocks in the full version above do the same thing on PU — press A/B on PU's micro:bit to nudge its channel until it matches the gamepad.

> Servo trim mode is entered/exited by pressing the **logo button on Robot PU's head** (`robotPuPro.toggleServoTrim()`). See [servo-trim-calibration.md](servo-trim-calibration.md).

---

## Quick test idea

On a second micro:bit, set the same channel and send something simple:

**Gamepad-side setup:** create a *separate* MakeCode project for the gamepad micro:bit and add the gamepad extension — **Extensions → paste `https://github.com/robotgyms/pxt-robotpu-gamepad` → select it**. Then add:

```typescript
robotPuGamepad.setChannel(166)
robotPuGamepad.start()
// optional: set the name of your robot
robotPuGamepad.setName("PU")
```

> 📻 **About `setChannel(166)`**: `robotPuPro.setChannel(...)` on the robot and `robotPuGamepad.setChannel(...)` on the gamepad set the **same thing** — the micro:bit radio group. The two devices can only talk when the numbers match, and the valid range is `0 .. 255`.
>
> `166` is the **factory default channel** — every Robot PU ships on it. If other Robot PUs are nearby (classroom, demo, robot meetup), their gamepads will interfere with yours. Pick your own channel (`0 .. 255`) to keep your pair private.
>
> ⚠️ **Two programs, two micro:bits**: the `robotPuPro.*` program is flashed to the micro:bit in **Robot PU's brain** (inside the robot head); the `robotPuGamepad.*` program is flashed to the **gamepad micro:bit**. Don't mix them up — each extension only works on its own device.
>
> To use a different channel, change both sides: on PU call `robotPuPro.setChannel(n)` or `robotPuPro.changeChannel(±1)` (buttons A/B in the full program above), and on the gamepad call `robotPuGamepad.setChannel(n)` or press its own A/B buttons to step the channel.

> ⚠️ If you use a **plain sender** micro:bit (no gamepad extension) instead, use `radio.setGroup(166)` — not `robotPuPro.setChannel(166)`. Calling any `robotPuPro.*` block runs the full robot startup (stand → calibrate, ~4 s of servo/I2C activity), which a sender-only micro:bit doesn't need.

If your receiver is working, PU walks when you tilt the joystick and kicks when you press gamepad button **B4**.
