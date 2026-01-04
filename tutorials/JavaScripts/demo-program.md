
# 🧪 Demo Program: extending `remote-control.md` (without changing the receiver core)

This file is a **single copy/pasteable program**.

Goal:

- start from the basic radio receiver pattern in `remote-control.md`
- add more Robot PU functions (buttons, gestures, sound, macros)

Key idea:

- keep the two radio handlers:
  - `radio.onReceivedString(...)` → `robotPu.runStringCommand(...)`
  - `radio.onReceivedValue(...)` → `robotPu.runKeyValueCommand(...)`
- then add any extra behaviors you want as local events and helper functions

---

## 1. What comes from `remote-control.md`

In the code below, the “remote control core” is:

- `radio.onReceivedString(...)` (string commands like `#putHello!`, `#punName`)
- `radio.onReceivedValue(...)` (key/value commands like `#puturn`, `#puspeed`)
- `robotPu.setChannel(166)` (pairing channel)

If you delete everything else and keep only those pieces, you are back to the minimal receiver.

---

## 2. How to add more functions (pattern)

Use one (or both) of these patterns:

- **Local input events**
  - `input.onButtonPressed(...)`
  - `input.onGesture(...)`
  - `input.onLogoEvent(...)`

- **Your own helper functions**
  - write a function like `scare()` that calls `robotPu.*` blocks
  - trigger it from a button/gesture or even from a custom radio command

---

## 3. Full program

```typescript
// press button A to walk forward in circles
input.onButtonPressed(Button.A, function () {
    robotPu.talk("Move forward!")
    for (let index = 0; index < 400; index++) {
        robotPu.walk(3, -0.5)
    }
})
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
    robotPu.talk("What is it?")
    music.play(music.createSoundExpression(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    for (let index = 0; index < 50; index++) {
        robotPu.jumpDo()
    }
    basic.pause(5000)
}
// press button A+B to do autopilot
input.onButtonPressed(Button.AB, function () {
    robotPu.talk("Autopilot")
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
    robotPu.talk("Move backward!")
    for (let index = 0; index < 400; index++) {
        robotPu.walk(-1, -0.5)
    }
})
input.onGesture(Gesture.Shake, function () {
    robotPu.talk("I am here")
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
// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
// press logo button to dance using set mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    robotPu.talk("Dance!")
    robotPu.setMode(robotPu.Mode.Dance)
})
input.setSoundThreshold(SoundThreshold.Loud, 184)
init_sound()
// Initialize robot by ask it to greet
robotPu.greet()
robotPu.standDo()
robotPu.setChannel(166)
robotPu.sing("C5 B G - E F E G ")
```

### Initialization and Setup

The code above initializes the robot by asking it to greet, stand, and set the channel to 166. It also plays a musical phrase using the `sing` function.

---

## 4. Where to extend this program next

Here are safe extensions that do not break compatibility with the retail gamepad protocol:

- **Add a safety timeout**
  - record `lastControlMs` inside the two radio handlers
  - if no messages arrive for ~500ms, call `robotPu.walkDo(0, 0)`

- **Add custom radio commands (optional)**
  - intercept a new key in `radio.onReceivedValue`, handle it, then `return`
  - otherwise, fall back to `robotPu.runKeyValueCommand(name, value)`

Example custom command ideas:

- `#pueyes` → call `robotPu.leftEyeBright(...)` / `robotPu.rightEyeBright(...)`
- `#puscare` → call your `scare()` helper
- `#pusing` → call `robotPu.sing(...)` with a fixed phrase

If you want to keep everything “controller compatible”, avoid changing how `#puspeed` / `#puturn` are forwarded.