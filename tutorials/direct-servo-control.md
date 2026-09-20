
# 🦾 Robot PU: Direct Servo Control (API Mode)

This tutorial shows how to drive Robot PU's servos **directly** with the low-level actuator APIs — useful for custom gaits, poses, sensor-driven head tracking, or puppet-style control.

---

## What you will build

You will program PU's micro:bit to:

- Switch the robot into **API mode** so your servo commands are not overwritten.
- Move individual joints instantly (`servo`) or smoothly (`servoStep` / `servoStepStatus` / `servoSmooth`).
- Read back live joint targets with `servoTargets()`.
- Finish with an **on-stage demo**: PU sings Happy Birthday at 120 BPM with beat-synced head and body moves.
- Return control to the built-in behaviors when you're done.

---

## Requirements

- Robot PU with a micro:bit
- The Robot PU MakeCode extension (see below)

---

## Load the Robot PU MakeCode Extension

To use the `robotPuPro.*` blocks/APIs, add the Robot PU extension to your MakeCode project.

1. Open the MakeCode editor: https://makecode.microbit.org/
2. Create a **New Project** (or open an existing one).
3. Click **Extensions**.
4. Paste this GitHub URL:

   `https://github.com/robotgyms/pxt-robotpu`

5. Select the extension to add it to your project.

---

## ⚠️ Important: enter API mode first

Robot PU is **always running a behavior**. A background loop updates the state machine every ~10 ms — in `Rest` mode it keeps pulling all servos back to the rest pose, in `Walk` it keeps stepping, and so on.

If you issue a servo command while a normal action state is active, the state machine will **overwrite your command on the next tick**.

The fix: start the special **`API` action** before using direct servo commands.

```typescript
robotPuPro.start(robotPuPro.Action.API, 0)
```

- `API` mode makes the state machine do nothing — your code owns the servos.
- `steps = 0` means "stay in API mode until I say otherwise". `start(Action.API, N)` stays manual for `N` ticks (~10 ms each) and then returns to `Rest` automatically.
- Any other `start(...)` call — or `robotPuPro.stop()` — exits API mode and hands control back to the state machine.

> Tip: the low-level servo APIs also switch to API mode implicitly when called, but they don't reset the internal action bookkeeping. If a counted action was running (e.g. `start(Action.Walk, 100)`), always enter API mode explicitly with `start(Action.API, 0)` first.

---

## The servo joints

`robotPuPro.ServoJoint` selects which motor to move:

| Index | Joint | Index | Joint |
|------:|-------|------:|-------|
| 0 | `LeftFoot` | 5 | `HeadPitch` |
| 1 | `LeftLeg` | 6 | `LeftShoulder` |
| 2 | `RightFoot` | 7 | `LeftArm` |
| 3 | `RightLeg` | 8 | `RightShoulder` |
| 4 | `HeadYaw` | 9 | `RightArm` |

Angles are `0`–`180` degrees; `90` is roughly centered.

---

## Direct control APIs

| API | What it does |
|-----|--------------|
| `robotPuPro.servo(joint, angle)` | Jump instantly to `angle`. Good for setting a known start pose. |
| `robotPuPro.servoSmooth(joint, angle)` | Move smoothly to `angle` using the PCB's own ramping. |
| `robotPuPro.servoStep(joint, target, stepSize)` | Move **one step** (at most `stepSize` degrees) toward `target`. Call repeatedly — speed = `stepSize` × your call rate. |
| `robotPuPro.servoStepStatus(joint, target, stepSize)` | Same step, but returns the remaining error — `0` means arrived. Use in `while` loops. |
| `robotPuPro.servoTargets()` | Live target array `[10]` — read it for relative moves, e.g. `servoTargets()[4]` is head yaw. |
| `robotPuPro.servo(joint, ...)` + `setControlOffsets` / `incrementControlOffsets` | Add software offsets layered on top of motion targets. |
| `robotPuPro.setServoPower(on)` | Power the servo rail on/off. |
| `robotPuPro.moveServos(targets, speeds, syncList, syncGain, asyncList, asyncGain)` | Move many joints at once; `syncList` joints must arrive before it returns `true`. |

---

## Example 1 — pose, then smooth motion

```typescript
// Enter API mode so nothing overwrites our commands
robotPuPro.start(robotPuPro.Action.API, 0)

// Snap to a known starting pose
robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 90)
robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 90)
basic.pause(500)

// Slow, coordinated motion: raise the right leg while the head looks around.
// servoStepStatus returns 0 when the joint arrives.
while (robotPuPro.servoStepStatus(robotPuPro.ServoJoint.RightLeg, 170, 0.05) != 0) {
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 135, 0.05)
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, 60, 0.05)
}
```

Tuning tips:

- `stepSize` can be fractional — try `0.02` (very slow) to `0.1` (faster). Lower it if motion looks jerky.
- If a `while (...)` loop blocks other code too long, add `basic.pause(1)`–`basic.pause(5)` inside it.
- Test extreme angles incrementally, especially on feet/legs, to avoid servo strain.

---

## Example 2 — continuous control in a forever loop

`servoStep` moves only one increment per call, so for live control (sensor feedback, joysticks, camera tracking) call it every loop iteration. Each call also re-asserts API mode.

```typescript
robotPuPro.start(robotPuPro.Action.API, 0)

let yaw = 0
let pitch = 0

basic.forever(function () {
    // Relative move: read the current head target, add a correction.
    // Replace `yaw`/`pitch` with your own sensor input.
    robotPuPro.servoStep(
        robotPuPro.ServoJoint.HeadYaw,
        robotPuPro.servoTargets()[4] + yaw * 0.08,
        8
    )
    robotPuPro.servoStep(
        robotPuPro.ServoJoint.HeadPitch,
        robotPuPro.servoTargets()[5] + pitch * 0.08,
        8
    )
    basic.pause(20)
})
```

---

## Example 3 — buttons move a joint, logo gives control back

```typescript
robotPuPro.start(robotPuPro.Action.API, 0)

input.onButtonPressed(Button.A, function () {
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 60, 4)
})
input.onButtonPressed(Button.B, function () {
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 120, 4)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // Leave API mode: state machine resumes and rest pose takes over
    robotPuPro.stop()
})
```

---

## Example 4 — head-banging to the beat (120 BPM)

At 120 BPM one beat lasts `60000 / 120 = 500` ms. This demo swings the head `±20°` around center (`90°`), landing on each beat, while PU sings a tune at the same tempo.

```typescript
// Enter API mode so the state machine can't pull the head back to rest
robotPuPro.start(robotPuPro.Action.API, 0)

// Start at center
robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)

const BPM = 120
const BEAT_MS = 60000 / BPM  // 500 ms per beat
const SWING = 20             // degrees each side of center

// Sing at 120 BPM on a separate fiber so it doesn't block the servo loop
control.inBackground(function () {
    robotPuPro.sing("C5 E5 G5 E5 C5 E5 G5 - ", BPM)
})

basic.forever(function () {
    // Pick the target from the beat number:
    // even beats -> +20 (right), odd beats -> -20 (left)
    if (Math.floor(control.millis() / BEAT_MS) % 2 == 0) {
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 90 + SWING, 1)
    } else {
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 90 - SWING, 1)
    }
    basic.pause(10)
})
```

How the timing works:

- `control.millis() / BEAT_MS` gives the current beat index; `% 2` alternates the target between `110` and `70` every 500 ms.
- `stepSize = 1` at a ~10 ms loop cadence moves about `100°/s`, so the 40° swing takes ~400 ms — the head arrives just before the next beat flips the target.
- Want a sharper snap on the beat? Increase `stepSize` (e.g. `4`) or use `robotPuPro.servo(...)` for an instant hit.
- Change `BPM` and the timing follows automatically — try `100` for a slower groove or `140` for a faster one.

---

## Example 5 — 🎤 ultimate demo: Happy Birthday on stage

PU sings **Happy Birthday** at 120 BPM and dances like a singer on stage — head swaying left/right on `HeadYaw`, nodding up/down on `HeadPitch`, and the **body bouncing and shifting weight** on the leg and foot servos, all locked to the beat.

The trick: instead of one fixed target per beat, we use a **4-beat stage pattern**. Each beat of the bar picks the next pose from a set of arrays — one per joint:

```typescript
// Enter API mode so the state machine can't pull the body back to rest
robotPuPro.start(robotPuPro.Action.API, 0)

// Start centered
robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 90)
robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, 90)
robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, 90)
robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, 90)
robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 90)

const BPM = 120
const BEAT_MS = 60000 / BPM  // 500 ms per beat

// Singer's stage pattern, one pose per beat of a 4-beat bar:
//   beat 1: bounce (legs bend, feet compensate) + head right/down
//   beat 2: shift weight right (feet roll) + head up to the crowd
//   beat 3: bounce again + head left/down
//   beat 4: shift weight left + head slightly up
const yawPattern = [20, 0, -20, 0]
const pitchPattern = [5, -25, 5, -15]
const legPattern = [8, 0, 8, 0]     // both legs bend together for the bounce
const footPattern = [-8, 10, -8, -10] // feet compensate the bend / roll the body

// The performance: Happy Birthday at 120 BPM, looped on a separate fiber
control.inBackground(function () {
    while (true) {
        robotPuPro.sing(
            "G4 G4 A4 G4 C5 B4 - " +
            "G4 G4 A4 G4 D5 C5 - " +
            "G4 G4 G5 E5 C5 B4 A4 - " +
            "F5 F5 E5 C5 D5 C5 - ",
            BPM
        )
    }
})

basic.forever(function () {
    // Which beat of the 4-beat bar are we on?
    const beat = Math.floor(control.millis() / BEAT_MS) % 4
    // Step all six joints toward this beat's pose
    robotPuPro.servoStep(robotPuPro.ServoJoint.LeftFoot, 90 + footPattern[beat], 1.5)
    robotPuPro.servoStep(robotPuPro.ServoJoint.LeftLeg, 90 + legPattern[beat], 1.5)
    robotPuPro.servoStep(robotPuPro.ServoJoint.RightFoot, 90 + footPattern[beat], 1.5)
    robotPuPro.servoStep(robotPuPro.ServoJoint.RightLeg, 90 + legPattern[beat], 1.5)
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 90 + yawPattern[beat], 1.5)
    robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, 90 + pitchPattern[beat], 1.5)
    basic.pause(10)
})
```

How it works:

- `Math.floor(control.millis() / BEAT_MS) % 4` advances through the 4-beat bar; each beat selects one pose from every pattern array, so the whole body hits a new stage pose every 500 ms.
- The **bounce**: both legs bend by `+8` while both feet tilt `-8`, so the soles stay flat and PU dips like a singer crouching on the downbeat.
- The **weight shift**: both feet roll the same way (`+10` then `-10`) to lean the body side to side without lifting a foot.
- `stepSize = 1.5` at a ~10 ms loop cadence moves ~`150°/s` — every joint lands on its pose well before the next beat, giving crisp "hits" instead of a lazy drift.
- `robotPuPro.sing(...)` plays the melody through `music` at `BPM` beats per minute inside `control.inBackground`, so the servo loop never stalls while a note is playing.
- The loop never pauses longer than 10 ms, so `servoStep` also keeps re-asserting API mode — the rest pose can't sneak in.

> ⚠️ **Balance first!** The leg and foot servos hold PU upright — unlike the head, bad moves here can topple it. Keep leg/foot offsets small (`±8`–`10`), start on a flat surface, and reduce the values if PU wobbles. If it does fall, the built-in fall protection takes over automatically and returns to API mode after recovery.

Make it your own:

- **Longer choreography**: extend all arrays to 8 beats (or more) — e.g. add a big look-up (`pitch = -25`) on the high `G5` note, or a deep double-crouch on the last "to you!"
- **Bigger personality**: raise the head swing to `±30`, or add a second `forever` loop that pumps `robotPuPro.leftEyeBright(...)` / `rightEyeBright(...)` with `ledLevel()` so the eyes flash with the music.
- **Opposite-phase groove**: move the head one way while the weight shifts the other (`yawPattern` vs `footPattern` signs flipped) for a counter-balanced dance look.
- **Sync to the words**: count beats per lyric phrase — the melody above is ~30 beats long, so poses at `beat % 4` cycle through the pattern about 7 times per song.
- **If your PU has arms**: add `LeftShoulder`/`RightShoulder`/`LeftArm`/`RightArm` patterns the same way — arms up on the chorus!

---

## Things to know

- **Fall protection still wins.** Free-fall and tipped-over detection can take the robot out of API mode into the fetal / "help me" states — that's intentional. After it recovers, the robot returns to API mode (not Rest).
- **`servo` / `servoStep` use raw angles.** They bypass the trim and control offsets that `moveServos` and the built-in behaviors apply. If you need trim-corrected positioning, use `moveServos` instead.
- **`servoStep` is incremental, not blocking.** One call = one small step. Use `servoStepStatus` in a `while` loop when you need to wait for arrival.
- **The gamepad can interrupt you.** Radio commands like `#pua...` switch actions and will pull the robot out of API mode. Disable the sender or pick a private channel with `robotPuPro.setChannel(...)`.
- **Getting back is easy.** Call `robotPuPro.stop()` or `robotPuPro.start(robotPuPro.Action.Rest, 0)` to return to normal behavior.

---

## Quick test idea

Enter API mode, then slowly nod the head:

```typescript
robotPuPro.start(robotPuPro.Action.API, 0)

basic.forever(function () {
    while (robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadPitch, 120, 0.1) != 0) {
    }
    basic.pause(300)
    while (robotPuPro.servoStepStatus(robotPuPro.ServoJoint.HeadPitch, 60, 0.1) != 0) {
    }
    basic.pause(300)
})
```

The head should rock gently and **stay where you put it** — no fighting with the rest pose.
