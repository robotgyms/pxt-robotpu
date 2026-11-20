
# 🧪 Demo Program: extending `remote-control.md` (without changing the receiver core)

The **Full demo program** section below is a **single copy/pasteable program**.

Goal:

- start from the basic radio receiver pattern in `remote-control.md`
- add more Robot PU functions (buttons, gestures, sound, macros)

Key idea:

- keep `robotPuPro.connectToGamepad()`, which forwards radio commands into:
  - `robotPuPro.runStringCommand(...)` (strings)
  - `robotPuPro.runKeyValueCommand(...)` (name/value pairs)
- then add any extra behaviors you want as local events and helper functions

---

## What comes from `remote-control.md`

In the code below, the “remote control core” is:

- `robotPuPro.connectToGamepad()` (forwards string commands like `#putHello!` (speak), `#pun<sn>` (set the robot's serial number, then greet) and key/value commands like `#puturn`, `#puspeed`)
- `robotPuPro.setChannel(166)` (pairing channel)

If you delete everything else and keep only those pieces, you are back to the minimal receiver.

---

## Ways to drive the robot

### Sequential program

```typescript
// walk a short routine: forward, backward, sidestep left, sidestep right
robotPuPro.talk("Move forward!")

robotPuPro.setWalkSpeed(4)
robotPuPro.startAndWait(robotPuPro.Action.Walk, 10)
robotPuPro.startAndWait(robotPuPro.Action.WalkBackward, 10)

robotPuPro.setWalkSpeed(6)
robotPuPro.startAndWait(robotPuPro.Action.StepLeft, 6)
robotPuPro.startAndWait(robotPuPro.Action.StepRight, 6)

robotPuPro.setTurnSpeed(0.9)
robotPuPro.startAndWait(robotPuPro.Action.TurnLeft, 6)
robotPuPro.startAndWait(robotPuPro.Action.TurnRight, 6)

robotPuPro.setDanceSpeed(4)
robotPuPro.startAndWait(robotPuPro.Action.Dance, 30)

robotPuPro.setJumpSpeed(4)
robotPuPro.startAndWait(robotPuPro.Action.Jump, 30)

robotPuPro.start(robotPuPro.Action.Rest, 0)
basic.pause(4000)
robotPuPro.setExploreSpeedGain(0.6)
robotPuPro.setExploreTurnGain(0.25)
robotPuPro.start(robotPuPro.Action.Explore, 0)
basic.pause(4000)
robotPuPro.start(robotPuPro.Action.Rest, 0)

```

### Low-level direct control

To do something similar to:

```typescript
robotPuPro.setWalkSpeed(6)
robotPuPro.startAndWait(robotPuPro.Action.Walk, 10)
```

you can use low-level control like this:

```typescript
for (let index = 0; index < 50; index++) {
        robotPuPro.walk(6, 0)
    }
```

To do something similar to:

```typescript
robotPuPro.setWalkSpeed(4)
robotPuPro.setTurnSpeed(0.7)
robotPuPro.startAndWait(robotPuPro.Action.TurnLeft, 10)
```

you can use low-level control like this:

```typescript
for (let index = 0; index < 50; index++) {
        robotPuPro.walk(4, 0.7)
    }
```

To do something similar to:

```typescript
robotPuPro.startAndWait(robotPuPro.Action.Jump, 10)
```

you can use low-level control like this:

```typescript
for (let index = 0; index < 50; index++) {
        robotPuPro.jump()
    }
```

Though there is more code in direct control, it is more flexible and can be used to create more complex behaviors. You have to write code to count the number of steps yourself — `walk()` returns `0` each time one step finishes (it returns a non-zero gait status while a step is still in progress):

```typescript
let stepCount = 0
for (let index = 0; index < 50; index++) {
    if (robotPuPro.walk(4, 0.7) == 0) {
        stepCount++
    }
}
```

(`robotPuPro.stepCount()`, the odometry pedometer, counts the same thing if you don't want to check return values.)

Since direct control is complex, we recommend using the high-level API for most use cases. Or, you can wrap your complex movements into a function for better code organization.

Like this:

```typescript
function walkForward(steps: number) {
    let stepCount = 0
    while (stepCount < steps) {
        if (robotPuPro.walk(4, 0.7) == 0) {
            stepCount++
        }
    }
}
walkForward(10)
```

### Event-driven program

Use sequential actions only when you know exactly what to do. Most of the time a robot needs to respond to its environment, so there is no fixed order of execution — that is when you need event-driven programming. Each environment signal can trigger an event, and you write event-handling code for it.

We recommend event-driven programming for simple, fast robot reflexes. Sequential actions can be combined inside one event handler or wrapped into functions.

#### How an event handler works

```typescript
// press button A — PU says hello
input.onButtonPressed(Button.A, function () {
    robotPuPro.talk("Hello there!")
})
```

- `input.onButtonPressed(Button.A, ...)` **registers** the handler once at startup — nothing runs yet.
- Every time button A is pressed, the code inside `function () { ... }` runs.
- You can register many handlers (buttons, gestures, sounds, radio) — each one waits for its own signal.

A handler can contain a whole routine — sequential actions work inside events too:

```typescript
// press button B — PU talks, then turns in a circle
input.onButtonPressed(Button.B, function () {
    robotPuPro.talk("I will move in circles!")
    robotPuPro.setTurnSpeed(0.9)
    robotPuPro.startAndWait(robotPuPro.Action.TurnLeft, 20)
})
```

- The handler runs in its own fiber: `startAndWait()` inside it blocks only that handler — other events (gamepad commands, gestures, sounds) still fire meanwhile.
- If the same button is pressed again while its handler is still busy, the press is queued and the routine runs again.

## Full demo program

This program uses the high-level action API everywhere it can:

- **counted actions** — `startAndWait()` runs an action for N steps and waits for it to finish
- **continuous actions** — `start(action, 0)` runs until `robotPuPro.stop()` or another action starts
- **functions** — named behaviors like `scare()` built from the same high-level calls

Reach for low-level `walk()`/`jump()` control (previous section) only when an action
can't express the motion — e.g. walking in a smooth arc (speed + turn at the same time).

```typescript
// ---------- helper functions ----------

function init_sound () {
    music.setVolume(255)
    music.play(music.createSoundExpression(
    WaveShape.Square,
    400,
    600,
    255,
    0,
    200,
    SoundExpressionEffect.Warble,
    InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
    WaveShape.Square,
    400,
    600,
    255,
    0,
    200,
    SoundExpressionEffect.Warble,
    InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
    WaveShape.Square,
    400,
    600,
    255,
    0,
    200,
    SoundExpressionEffect.Warble,
    InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
    WaveShape.Square,
    400,
    600,
    255,
    0,
    150,
    SoundExpressionEffect.Warble,
    InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
    WaveShape.Noise,
    54,
    54,
    255,
    0,
    500,
    SoundExpressionEffect.None,
    InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
}
function scare () {
    robotPuPro.talk("What is it?")
    music.play(music.createSoundExpression(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    robotPuPro.setJumpSpeed(4)
    robotPuPro.startAndWait(robotPuPro.Action.Jump, 5)
    basic.pause(5000)
}
// ---------- event handlers ----------

// counted actions: press button A for a forward + turn routine
input.onButtonPressed(Button.A, function () {
    robotPuPro.talk("Move forward in circles!")
    robotPuPro.setTurnSpeed(0.5)
    robotPuPro.startAndWait(robotPuPro.Action.Walk, 6)
    robotPuPro.startAndWait(robotPuPro.Action.TurnLeft, 6)
    robotPuPro.startAndWait(robotPuPro.Action.TurnRight, 6)
})

// counted actions: press button B for a back-up-and-turn routine
// (rough circle: step back, turn, repeat — a smooth arc needs low-level walk())
input.onButtonPressed(Button.B, function () {
    robotPuPro.talk("Move backward!")
    for (let index = 0; index < 4; index++) {
        robotPuPro.startAndWait(robotPuPro.Action.WalkBackward, 6)
        robotPuPro.startAndWait(robotPuPro.Action.TurnRight, 2)
    }
})

// continuous actions: run until stopped by robotPuPro.stop() or another action
// press A+B for autopilot
input.onButtonPressed(Button.AB, function () {
    robotPuPro.talk("Autopilot")
    robotPuPro.start(robotPuPro.Action.Explore, 0)
})
// tilt the robot forward (logo down) to dance
input.onGesture(Gesture.LogoDown, function () {
    robotPuPro.talk("Dance!")
    robotPuPro.start(robotPuPro.Action.Dance, 0)
})

// event calls a function: clap or loud sound — PU gets scared and jumps
input.onSound(DetectedSound.Loud, function () {
    scare()
})
// Forward gamepad commands (buttons, speed, turn, strings) to Robot PU.
robotPuPro.connectToGamepad()
input.onGesture(Gesture.Shake, function () {
    robotPuPro.talk("I am here")
    if (randint(0, 1) == 0) {
        music.play(music.createSoundExpression(
        WaveShape.Square,
        400,
        600,
        255,
        0,
        100,
        SoundExpressionEffect.Warble,
        InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
    } else {
        music.play(music.createSoundExpression(
        WaveShape.Sine,
        200,
        600,
        255,
        0,
        150,
        SoundExpressionEffect.None,
        InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
    }
})
// press logo button to enter/exit servo trim mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    robotPuPro.toggleServoTrim()
})
input.setSoundThreshold(SoundThreshold.Loud, 184)
init_sound()
// Initialize robot by ask it to greet
robotPuPro.greet()
robotPuPro.stand()
robotPuPro.setChannel(166)
robotPuPro.sing("C5 B G - E F E G ")
```

### Note: stable walking

You may need to adjust the servo trim values so the robot walks stably — especially when moving fast or on uneven surfaces. See servo calibration in [servo-trim-calibration.md](servo-trim-calibration.md).

---

### How to add more functions (pattern)

Use one (or both) of these patterns:

- **Local input events**
  - `input.onButtonPressed(...)`
  - `input.onGesture(...)`
  - `input.onLogoEvent(...)`
  - `input.onSound(...)`

- **Your own helper functions**
  - write a function like `scare()` that calls `robotPuPro.*` blocks
  - trigger it from a button/gesture or even from a custom radio command

In future tutorials, we will show you how to generate customized events so that the robot responds not only to buttons or sensors built into the micro:bit — see [event-pu.md](event-pu.md).

---

## Where to extend this program next

Here are safe extensions that do not break compatibility with the retail gamepad protocol:

- **Add a safety timeout**
  - record `lastControlMs` inside a custom radio handler
  - if no messages arrive for ~500ms, call `robotPuPro.walk(0, 0)`

- **Add custom radio commands (optional)**
  - intercept a new key in `radio.onReceivedValue`, handle it, then `return`
  - otherwise, fall back to `robotPuPro.runKeyValueCommand(name, value)`
  - note: your own `radio.onReceivedValue` replaces the one `connectToGamepad()` installs — register it after `connectToGamepad()`, or skip `connectToGamepad()` entirely (see `remote-control.md` section 6)

Example custom command ideas:

- `#pueyes` → call `robotPuPro.leftEyeBright(...)` / `robotPuPro.rightEyeBright(...)`
- `#puscare` → call your `scare()` helper
- `#pusing` → call `robotPuPro.sing(...)` with a fixed phrase

If you want to keep everything “controller compatible”, avoid changing how `#puspeed` / `#puturn` are forwarded.