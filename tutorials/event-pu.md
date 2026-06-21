# ⚡ Lesson: Events & Event Handlers (Robot PU + micro:bit)

In MakeCode (micro:bit JavaScript/TypeScript), an **event** is a message like:

- “Button A pressed”
- “Radio value received”
- “A new movement command arrived”

Events help you build programs that are:

- easier to organize (no giant `forever` loop)
- easier to extend (add new behaviors without rewriting everything)
- safer for robotics (separate sensing, decision-making, and actuation)

This lesson shows how to create **custom events** using the micro:bit runtime APIs, and how to use them as design patterns for **multi-robot interactions via radio**.

---

## 1. The core APIs

MakeCode provides an event bus through `control`:

- `control.raiseEvent(src, value)`
  - fires an event
- `control.onEvent(src, value, handler)`
  - registers an event handler
- `control.waitForEvent(src, value)`
  - blocks until an event occurs (use carefully)

Think of:

- `src` = event “group” / “namespace”
- `value` = event “type” inside that group

---

## 2. Minimal example: custom event + handler

```typescript
const SRC_DEMO = 9000
const EVT_HELLO = 1

control.onEvent(SRC_DEMO, EVT_HELLO, function () {
    basic.showString("HI")
})

input.onButtonPressed(Button.A, function () {
    control.raiseEvent(SRC_DEMO, EVT_HELLO)
})
```

Notes:

- Choose `src` values that are unlikely to collide with system events (commonly use `9000+`).
- Keep event handlers short; do not run long blocking loops inside handlers.

---

## 3. Design patterns for robotics (why events help)

### A. “Event bus” pattern (decouple modules)

Use custom events as messages between parts of your program:

- **Radio receiver** raises events
- **Motion controller** listens and acts

This avoids mixing parsing logic with robot motion.

### B. “Command event” pattern

When a command arrives (speed, heading, stop, etc.), raise a single event like:

- `EVT_CMD_UPDATED`

Then one place computes targets and the motor loop just applies them.

### C. “State machine” pattern

Events can trigger state transitions:

- `EVT_START`
- `EVT_STOP`
- `EVT_LOST_SIGNAL`

Your main loop checks the current state and executes the correct behavior.

---

## 4. Multi-robot interaction via radio: Follow-the-Leader (speed + heading)

Goal:

- One “leader” controller (gamepad micro:bit) broadcasts:
  - `speed` (how fast to walk)
  - `heading` (compass direction 0..359)
- Each Robot PU receives the values, converts them into a **custom event**, and updates its motion.

### Coordinate conventions

- micro:bit compass heading:
  - `0 = North`, `90 = East`, `180 = South`, `270 = West`
- Robot PU motion API:
  - `robotPuPro.walk(speed, turn)`
  - `turn` is `-1..1` (left..right)

---

## 5. Code: Leader (gamepad transmitter)

This is a simple example:

- Button A increases speed
- Button B decreases speed
- It broadcasts current compass heading and speed repeatedly

```typescript
radio.setGroup(166)

let speed = 1.5

input.onButtonPressed(Button.A, function () {
    speed += 0.5
})

input.onButtonPressed(Button.B, function () {
    speed -= 0.5
})

basic.forever(function () {
    speed = Math.max(-3, Math.min(4, speed))
    const heading = input.compassHeading()

    // Send speed as int (x10) and heading in degrees
    radio.sendValue("spd", Math.round(speed * 10))
    radio.sendValue("hdg", heading)

    basic.pause(100)
})
```

Notes:

- All follower robots must use the same `radio.setGroup(...)`.
- `input.compassHeading()` requires compass calibration.

---

## 6. Code: Follower (Robot PU receiver + custom event)

This program demonstrates the **radio → custom event → motion** pipeline.

```typescript
// Radio group must match the leader
radio.setGroup(166)

// Custom event IDs
const SRC_FOLLOW = 9001
const EVT_CMD_UPDATED = 1

// Latest command (shared state)
let cmdSpeed10 = 0
let cmdHeading = 0
let lastCmdMs = 0

function angleWrap180(a: number): number {
    // Wrap to [-180, 180)
    while (a >= 180) a -= 360
    while (a < -180) a += 360
    return a
}

function clamp(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

// 1) Radio receiver updates shared state, then raises a custom event
radio.onReceivedValue(function (name: string, value: number) {
    if (name == "spd") {
        cmdSpeed10 = value
        lastCmdMs = control.millis()
        control.raiseEvent(SRC_FOLLOW, EVT_CMD_UPDATED)
    } else if (name == "hdg") {
        cmdHeading = value
        lastCmdMs = control.millis()
        control.raiseEvent(SRC_FOLLOW, EVT_CMD_UPDATED)
    }
})

// 2) Event handler computes motion targets (fast, non-blocking)
let targetSpeed = 0
let targetTurn = 0

control.onEvent(SRC_FOLLOW, EVT_CMD_UPDATED, function () {
    targetSpeed = clamp(cmdSpeed10 / 10, -3, 4)

    const myHeading = input.compassHeading()
    const errDeg = angleWrap180(cmdHeading - myHeading)

    // Convert heading error to turn [-1..1]
    targetTurn = clamp(errDeg / 90, -1, 1)
})

// 3) Motion loop: repeatedly call walk() with the latest targets
basic.forever(function () {
    // Fail-safe: if signal is stale, stop
    if (control.millis() - lastCmdMs > 1000) {
        robotPuPro.walk(0, 0)
        basic.pause(20)
        return
    }

    robotPuPro.walk(targetSpeed, targetTurn)
    basic.pause(20)
})
```

Why this pattern is good:

- Radio parsing is isolated from motion control
- New commands become a single event (`EVT_CMD_UPDATED`)
- The motion loop stays simple and consistent
- The follower has a signal-loss fail-safe

---

## 7. Extensions and variations

Try these upgrades:

- Add `robotId` and broadcast to only one robot (addressing)
- Add a `mode` command (rest / walk / dance) and raise different events
- Add a “formation offset” heading (each robot adds +10°, -10°)
- Add event-driven status reporting back to the leader (battery, sensors, etc.)

