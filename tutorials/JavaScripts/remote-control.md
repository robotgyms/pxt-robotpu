 # 📻 Lesson: Remote Control Robot PU (radio commands)

This lesson shows how to control **Robot PU** using a second micro:bit (or any radio sender) by forwarding radio messages into:

- `robotPu.runKeyValueCommand(key, value)`
- `robotPu.runStringCommand(text)`

You can use this for:

- “gamepad-like” live steering (continuous speed + turn)
- one-shot button actions (kick/jump/dance)
- sending short phrases / commands as strings

---

## 1. What you need

- **Robot micro:bit** plugged into Robot PU (receiver)
- **Controller micro:bit** (sender)
- Both must be on the **same radio group** (“channel”)

---

## 2. Receiver program (Robot PU side)

Put this in your Robot PU MakeCode project. It registers radio handlers and forwards the messages into the extension.

```typescript
// Register the event listener for incoming string messages
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})

// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

// Choose a channel 0..255. Both sides must match.
robotPu.setChannel(166)
```

Notes:

- `runKeyValueCommand(...)` is meant for “structured” messages like joystick axes and buttons.
- `runStringCommand(...)` is meant for “free text” messages (often prefixed with `#pu...`).

---

## 3. Sender program (Controller side)

You can build your controller in many ways. A common pattern is:

- use `radio.sendValue(key, value)` for numbers (axes, buttons)
- use `radio.sendString(text)` for short commands or phrases

If you want a ready-made starting point for a real “gamepad” micro:bit program, see:

- `gamepad.md`

---

## 4. Channel pairing (most common failure)

Radio messages are only received if **both micro:bits use the same radio group**.

Robot side:

- `robotPu.setChannel(166)`

Controller side:

- `radio.setGroup(166)`

If you have multiple robots/controllers in the same room:

- choose a unique channel per robot
- show the channel number on the controller display so you can confirm pairing

---

## 5. Message patterns (what to send)

The extension supports a small protocol of keys/strings (used by the official controller program). Typical messages include:

### A. Continuous steering

- `radio.sendValue("#puspeed", y)`
- `radio.sendValue("#puturn", x)`

Where `x` and `y` are usually normalized joystick values (often around `-1..1`).

### B. Buttons

Examples:

- `radio.sendValue("#puA", 1)`
- `radio.sendValue("#puB", 1)`
- `radio.sendValue("#puAB", 1)`
- `radio.sendValue("#pulogo", 1)`

### C. Strings / phrases

Examples:

- `radio.sendString("#putHello!")`
- `radio.sendString("#punPeu")`

---

## 6. Safety tip: stop if radio goes quiet

When you do continuous steering, the controller usually sends updates at ~50Hz. If the controller turns off or goes out of range, you may want Robot PU to stop.

This simple pattern stops the robot if it hasn’t received a steering update recently:

```typescript
let lastSteerMs = control.millis()
let speed = 0
let turn = 0

radio.onReceivedValue(function (name, value) {
    if (name == "#puspeed") {
        speed = value
        lastSteerMs = control.millis()
    } else if (name == "#puturn") {
        turn = value
        lastSteerMs = control.millis()
    }

    robotPu.runKeyValueCommand(name, value)
})

basic.forever(function () {
    if (control.millis() - lastSteerMs > 500) {
        // No steering updates for 0.5s → stop
        robotPu.walkDo(0, 0)
    }
    basic.pause(20)
})
```

---

## 7. Troubleshooting

- **No response at all**
  - confirm both sides use the same radio group (`robotPu.setChannel(...)` vs `radio.setGroup(...)`).
  - confirm the receiver program actually registered `radio.onReceivedValue` / `radio.onReceivedString`.

- **Robot moves but feels laggy**
  - send at a steady rate (example: every 20ms). Avoid long blocking loops on the controller.

- **Robot drifts / won’t stay still**
  - add a dead-zone on the controller for small joystick noise near 0.

- **Multiple robots respond to one controller**
  - give each robot a unique channel.