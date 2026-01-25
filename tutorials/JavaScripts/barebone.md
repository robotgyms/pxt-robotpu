
# 📡 Robot PU: Barebones Radio Receiver

This is the smallest possible starting point for letting **Robot PU** receive commands over **micro:bit radio**.

---

## What you will build

You will program PU’s micro:bit to:

- Listen for incoming **radio strings** and run them as PU commands.
- Listen for incoming **radio name/value pairs** and run them as PU commands.
- Use a specific radio channel so only your devices talk to each other.

---

## Requirements

- Robot PU with a micro:bit
- (Optional) A second micro:bit to send radio messages

---

## Load the Robot PU MakeCode Extension

To use the `robotPu.*` blocks/APIs, you must add the Robot PU extension into your MakeCode project.

1. Open the MakeCode editor: https://makecode.microbit.org/
2. Create a **New Project** (or open your existing one).
3. Click **Extensions** (in the gear menu or toolbox, depending on the MakeCode layout).
4. Search for the extension by pasting this GitHub URL:

   `https://github.com/robotgyms/pxt-robotpu`

5. Select the extension to add it to your project.

After that, the editor will recognize calls like `robotPu.setChannel(...)` and `robotPu.runStringCommand(...)`.

---

## Code (copy into MakeCode JavaScript)

```typescript
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
robotPu.setChannel(166)
```

---

## How it works

- `robotPu.setChannel(166)`
  - Sets the radio channel/group.
  - Your sender micro:bit must use the **same** channel number.
- `radio.onReceivedString(...)`
  - Runs whenever this micro:bit receives a radio **string**.
  - The string is forwarded into `robotPu.runStringCommand(...)`.
- `radio.onReceivedValue(...)`
  - Runs whenever this micro:bit receives a radio **name/value** message.
  - The pair is forwarded into `robotPu.runKeyValueCommand(name, value)`.

---

## Quick test idea

On a second micro:bit, set the same channel and send something simple:

```typescript
robotPu.setChannel(166)
input.onButtonPressed(Button.A, function () {
    radio.sendString("wave")
})
input.onButtonPressed(Button.B, function () {
    radio.sendValue("speed", 2)
})
```

If your receiver is working, PU should react to the incoming commands (depending on what commands your Robot PU firmware/extension recognizes).

