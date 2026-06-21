# ROS /cmd_vel Topic on Robot PU

In ROS, `/cmd_vel` is the topic that tells a robot how to move: linear speed forward/backward and angular speed turn left/right.

This tutorial shows how to publish and subscribe to `/cmd_vel` using Robot PU radio messages.

---

## Prerequisites

- micro:bit + Robot PU
- Robot PU extension added in MakeCode
- Basic MakeCode JavaScript

---

## What you will build

- A **teleop node** that sends velocity commands from buttons or a gamepad.
- A **controller node** that receives commands and drives the motors.

---

## /cmd_vel message format

Use two numbers: `linear,angular`.

- `linear` — forward speed in percent, range `-100` to `100`
- `angular` — turn rate in percent, range `-100` to `100`

Example radio strings:

- `cmd,50,0` — drive forward at 50%
- `cmd,0,30` — turn left at 30%
- `cmd,0,0` — stop

---

## Example: teleop publisher

```typescript
radio.setGroup(42)

let linear = 0
let angular = 0

input.onButtonPressed(Button.A, function () {
    linear = 50
    angular = 0
})

input.onButtonPressed(Button.B, function () {
    linear = -50
    angular = 0
})

input.onButtonPressed(Button.AB, function () {
    linear = 0
    angular = 0
})

input.onGesture(Gesture.TiltLeft, function () {
    angular = -30
})

input.onGesture(Gesture.TiltRight, function () {
    angular = 30
})

basic.forever(function () {
    radio.sendString("cmd," + linear + "," + angular)
    basic.pause(100)
})
```

## Example: controller subscriber

```typescript
radio.setGroup(42)

let linear = 0
let angular = 0

radio.onReceivedString(function (msg) {
    let parts = msg.split(",")
    if (parts[0] == "cmd" && parts.length == 3) {
        linear = parseInt(parts[1])
        angular = parseInt(parts[2])
    }
})

basic.forever(function () {
    robotPuPro.moveArcade(linear, angular)
    basic.pause(100)
})
```

---

## How to test

1. Flash the publisher to a separate micro:bit or the gamepad micro:bit.
2. Flash the subscriber to Robot PU.
3. Press buttons to drive forward, backward, or stop.

---

## Next steps

- **Read scan-topic.md**: Learn how to combine motion with obstacle data.
- **Read diagnostics-topic.md**: Add health checks while driving.
