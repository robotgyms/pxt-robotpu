# 🥋 Lesson: Make Robot PU Do Kungfu

## Introduction

This lesson shows how to program Robot PU to perform a **Kungfu pose sequence** — a choreographed series of body poses driven entirely by servo angle arrays.

You will learn:

- how to define robot **gaits** (body poses) as arrays of servo angles
- how to define **speed profiles** to control how fast PU transitions between poses
- how to run multiple poses in a loop using `basic.forever`
- how to keep **gamepad remote control** active while PU performs Kungfu

## Problem definition

We want Robot PU to:

- stand, raise a hand on tiptoe, spread its arms, and split its legs — in a repeating loop
- move between poses at a controlled speed (not snap instantly)
- still respond to the gamepad so you can interrupt or change channel at any time
- run in **API mode** so the built-in autonomous behaviors (walk, explore, dance) do not interfere

## Key concepts

### A. Servos and joint indices

Robot PU has **10 servos** (joints). Each servo accepts an angle from **0 to 180 degrees**. The index order is:

| Index | Joint          |
|-------|----------------|
| 0     | Left foot      |
| 1     | Left leg       |
| 2     | Right foot     |
| 3     | Right leg      |
| 4     | Head yaw       |
| 5     | Head pitch     |
| 6     | Left shoulder  |
| 7     | Right shoulder |
| 8     | Left arm       |
| 9     | Right arm      |

### B. Gaits as angle arrays

A **gait** (pose) is just an array of 10 numbers — one angle per servo. For example:

```typescript
[90, 90, 90, 90, 90, 90, 90, 90, 90, 90]  // neutral stand
```

You can design any pose by picking the desired angle for each joint.

### C. Speed profiles

A **speed profile** is also a 10-element array. Each number is the maximum step size (in degrees per `moveServos` call) that the corresponding servo is allowed to move. Lower = slower and smoother.

```typescript
[2, 2, 2, 2, 2, 2, 2, 2, 2, 2]   // slow, uniform speed for all joints
[3, 1, 3, 1, 5, 5, 6, 6, 6, 6]   // legs slow, arms and head faster
```

### D. `moveServos` — the motion engine

`robotPuPro.moveServos(targets, speeds, syncList, syncGain, asyncList, asyncGain)` moves all servos toward their targets simultaneously:

- **`syncList`** — servo indices that block (wait until they arrive) before returning `true`
- **`asyncList`** — servo indices that move in the background (non-blocking)
- **`syncGain` / `asyncGain`** — speed multipliers for each group

The action engine calls this repeatedly in `basic.forever` so the servos keep stepping toward the current target gait.

### E. API mode

`robotPuPro.setModeVar(robotPuPro.Mode.API)` puts Robot PU in **API mode**. In this mode:

- the internal state machine (walk, explore, dance, etc.) is disabled
- only your code drives the servos
- gamepad commands are still received and processed

## Implementation

Flash this program to **Robot PU's micro:bit**.

```typescript
// set servo trims
robotPuPro.setServoTrim(4, 4, 0, 0, -8, 0)

// allow gamepad remote control
radio.onReceivedValue(function(name: string, value: number) {
    robotPuPro.runKeyValueCommand(name,value)
})

// allow robots to exchange information for group activities
radio.onReceivedString(function(receivedString: string) {
    robotPuPro.runStringCommand(receivedString)
})
// trigger servo calibration by gamepad 
input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    robotPuPro.toggleServoTrim()
})

// increase radio channel
input.onButtonPressed(Button.A, function() {
    robotPuPro.changeChannel(1)
})
// decrease radio channel 
input.onButtonPressed(Button.B, function () {
    robotPuPro.changeChannel(-1)
})

// set robot to API mode to avoid autonomous actions and AI Actions
robotPuPro.setModeVar(robotPuPro.Mode.API)

// set Kungfu Gaits. Each array item is a gait with 10 servo angles, with range of 0-180
// Servos: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, right shoulder, left arm, right arm.
let kungfuGaits = [
    [90,90,90,90,90,90,90,90,90,90],   // 1st gait, stand
    [140, 90, 40, 90, 60, 60, 0, 180, 90, 90],  // 2nd gait, raise hand and tiptoe
    [90,  90, 90, 90, 120, 105, 90, 90, 0, 180], // 3rd gait, spread arms
    [0, 90, 180, 80, 110, 50, 0, 180, 0, 180] // 4th gait, split legs
]

// set Kungfu Speed 
let kungfuSpeed = [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 1, 3, 1, 5, 5, 6, 6, 6, 6]]

// set starting gait selection                  
let currentGait = kungfuGaits[0] // pick the 1st gait as starting gait
let currentSpeed = kungfuSpeed[0] // pick the 1st speed as starting speed

// action engine. It runs the gait and the gait speed you pick
basic.forever(function () {
    robotPuPro.moveServos(currentGait, currentSpeed, [0, 1, 2, 3], 1, [4, 5, 6, 7, 8, 9], 1)
    basic.pause(10)
})

// user selection of kungfu routines
basic.forever(function () {
    // go to the 1st gait
    currentGait = kungfuGaits[0] // in computer science, index 0 is the 1st item
    currentSpeed = kungfuSpeed[0]
    basic.pause(2000)
    // go to the 2nd gait
    currentGait = kungfuGaits[1] // in computer science, index 1 is the second item
    currentSpeed = kungfuSpeed[1]
    basic.pause(2000)
    // go to the 3rd gait
    currentGait = kungfuGaits[2]
    currentSpeed = kungfuSpeed[1]
    basic.pause(2000)
    // go to the 4th gait
    currentGait = kungfuGaits[3]
    currentSpeed = kungfuSpeed[1]
    basic.pause(2000)
    // it will loop back to the 1st gait
})
```

## Technical explanation

### A. Servo trim

```typescript
robotPuPro.setServoTrim(4, 4, 0, 0, -8, 0)
```

These six numbers are **trim offsets** (degrees) for: left foot, left leg, right foot, right leg, head yaw, head pitch. They compensate for physical assembly tolerances so the robot stands straight. You will have different values for your own robot.

### B. How two `basic.forever` loops work together

micro:bit runs multiple `basic.forever` loops as **cooperative tasks** — they take turns. Here both loops run concurrently:

- **Loop 1 (action engine)**: calls `moveServos` every 10 ms to continuously step servos toward `currentGait` at `currentSpeed`.
- **Loop 2 (sequencer)**: changes `currentGait` and `currentSpeed` every 2 seconds by picking from the arrays.

Because Loop 1 runs so frequently, the servos smoothly track any change Loop 2 makes to `currentGait`.

### C. The four Kungfu poses

| Index | Name           | Description                                      |
|-------|----------------|--------------------------------------------------|
| 0     | Stand          | All servos neutral (90°), upright rest pose      |
| 1     | Raise & tiptoe | Feet angled (tiptoe), arm raised, head turned    |
| 2     | Spread arms    | Arms fully spread, head pitched and yawed        |
| 3     | Split legs     | Legs fully split, arms extended, head tilted     |

### D. Speed profiles and how they feel

`kungfuSpeed[0]` — all joints move at max 2°/call → **slow and deliberate**, good for transitioning out of the stand pose.

`kungfuSpeed[1]` — legs move at 1–3°/call (slow), head and arms at 5–6°/call (faster) → **arms snap into position while legs carefully reposition**, creating a realistic martial arts effect.

### E. Sync vs async servo groups in `moveServos`

```typescript
robotPuPro.moveServos(currentGait, currentSpeed, [0, 1, 2, 3], 1, [4, 5, 6, 7, 8, 9], 1)
```

- **Sync group** `[0, 1, 2, 3]` — foot and leg servos. The function waits for these before returning `true`.
- **Async group** `[4, 5, 6, 7, 8, 9]` — head and arm servos. These move in the background and do not delay the loop.

This separation ensures the legs stabilize the body before the arms swing into position.

### F. Radio and gamepad integration

Even while the Kungfu sequence plays, the radio listeners remain active:

- `runKeyValueCommand` handles gamepad joystick and button events.
- `runStringCommand` handles text/speech events from other robots or the gamepad.
- The logo button enters servo trim calibration mode at any time.
- Buttons A/B change the radio channel so you can control multiple robots independently.

## Testing

### A. Basic pose check

- Flash this program to Robot PU.
- Watch Robot PU cycle through the four poses every 2 seconds.
- Confirm all joints move — if a servo does not move, check the trim values and the gait angles.

### B. Modify a pose

- Change one angle in `kungfuGaits[1]` (for example, set index 6 from `0` to `45`).
- Re-flash and observe how the left shoulder changes in pose 2.
- This is a great way to understand which index maps to which joint.

### C. Add a pause

- Try changing `basic.pause(2000)` to `basic.pause(500)` in Loop 2.
- The robot now cycles faster — notice the effect of the slower speed profile on smoothness.

### D. Gamepad integration test

- Flash the gamepad micro:bit with the official Robot PU gamepad program.
- Press button B1 on the gamepad while Kungfu is running — Robot PU should switch to autopilot mode.
- Press the micro:bit logo to enter trim calibration mode without stopping the Kungfu sequence.

## Next steps

- **Design your own pose**
    - Add a 5th gait to `kungfuGaits` with a custom arm or leg position, and add it to the sequencer.
- **Add a button trigger**
    - Use `input.onButtonPressed(Button.AB, ...)` to jump to a specific gait immediately.
- **Add sound**
    - Call `robotPuPro.playToneSequenceMs([440, 550, 660], [100, 100, 200])` when a dramatic pose is reached.
- **Sync multiple robots**
    - Use `radio.sendString(...)` from a coordinator robot to trigger the same gait on all robots simultaneously.
- **Try different speed gains**
    - Change the `syncSpeedGain` and `asyncSpeedGain` arguments in `moveServos` to scale all speeds up or down without editing the speed array.