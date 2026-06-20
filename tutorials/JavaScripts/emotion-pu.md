
# Emotions tutorial (Robot PU)

Robot PU can communicate “emotions” using:

- **Eye brightness + blink patterns**
- **Body language** (rest / stand / walk / explore / dance / head gestures)
- Optional **speech** (`robotPuPro.talk(...)` — melodic RoboVoice; or `billy.say(...)` with pxt-billy for real voice)

In this tutorial you will build a simple pipeline:

1. **Signals → Emotion** (what the world “feels like”)
2. **Emotion → Expression** (how PU shows it)

---

## Prerequisites

- Open https://makecode.microbit.org
- Add the Robot PU extension

## What you will build

- A small **emotion state machine** (Calm / Curious / Scared / Excited / Sad)
- A non-blocking **eye blink scheduler** using `control.millis()`
- A simple **body language mapper** (emotion → action)

## Signals we can sense

Robot PU projects typically have access to these signals:

* **Distance to obstacles**: `robotPuPro.sonarDistanceCm()`
* **Sound / noise level**: `input.soundLevel()`
* **Falls / instability**: `input.isGesture(Gesture.FreeFall)`
* **Time**: `control.millis()`

We’ll combine them into a small set of environment states.

---

## Define emotions (state machine)

We’ll use an `Emotion` enum (discrete states). Example set:

* **Calm**: nothing special happening
* **Curious**: something is nearby but not dangerous
* **Scared**: obstacle is too close
* **Excited**: loud environment / music / crowd
* **Sad**: repeated falls or very quiet for a long time

Important idea:

* Emotions should not switch every millisecond.
* Add **hysteresis** (cooldowns / thresholds) so the robot feels consistent.

---

## Emotion → eye blink patterns

Robot PU exposes public eye controls:

* `robotPuPro.leftEyeBright(brightness)` where `brightness` is `0..1`
* `robotPuPro.rightEyeBright(brightness)` where `brightness` is `0..1`

We’ll implement blinks using brightness pulses.

Examples:

* **Calm**: slow gentle blink
* **Curious**: quick double-blink
* **Scared**: rapid blink (alarm)
* **Excited**: bright eyes + fast blink
* **Sad**: dim eyes, slow blink

---

## Emotion → body language actions

We’ll map emotions to actions such as:

* `robotPuPro.rest()` / `robotPuPro.stand()`
* `robotPuPro.explore()` (slow wandering)
* `robotPuPro.dance()` (high-energy)
* Head gestures using `robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, angle)` / `HeadPitch`
* Optional voice: `robotPuPro.talk("...")` — plays a melodic tune; for real speech add **pxt-billy** and use `billy.say("...")` instead

Note:

* Many Robot PU actions are **asynchronous** (return codes). A simple approach is to just call them repeatedly inside loops.

---

## Implementation (copy/paste)

Copy this code into the **JavaScript** tab of the MakeCode Editor.

```typescript
enum Emotion {
    Calm,
    Curious,
    Scared,
    Excited,
    Sad
}

// --- Parameters (tune these) ---
const NEAR_CM = 35
const DANGER_CM = 15
const LOUD_LEVEL = 160
const QUIET_LEVEL = 60

const EMOTION_HOLD_MS = 1200
const SAD_AFTER_FALLS = 3

// --- State ---
let emotion = Emotion.Calm
let lastEmotionChange = 0
let fallCount = 0
let lastFallMs = 0

let lastBlinkMs = 0
let blinkPhase = 0

function setEyes(b: number): void {
    robotPuPro.leftEyeBright(b)
    robotPuPro.rightEyeBright(b)
}

function blinkPattern(now: number): void {
    // Non-blocking blink “scheduler” based on time.
    // Each emotion gets its own blink interval and brightness style.

    let baseBright = 0.06
    let intervalMs = 900
    let blinkOnMs = 80

    if (emotion == Emotion.Calm) {
        baseBright = 0.05
        intervalMs = 1000
        blinkOnMs = 70
    } else if (emotion == Emotion.Curious) {
        baseBright = 0.08
        intervalMs = 650
        blinkOnMs = 60
    } else if (emotion == Emotion.Scared) {
        baseBright = 0.12
        intervalMs = 220
        blinkOnMs = 50
    } else if (emotion == Emotion.Excited) {
        baseBright = 0.18
        intervalMs = 320
        blinkOnMs = 55
    } else if (emotion == Emotion.Sad) {
        baseBright = 0.03
        intervalMs = 1300
        blinkOnMs = 90
    }

    // Double-blink for Curious
    const doDouble = (emotion == Emotion.Curious)

    if (now - lastBlinkMs >= intervalMs) {
        lastBlinkMs = now
        blinkPhase = 1
    }

    if (blinkPhase == 0) {
        setEyes(baseBright)
    } else if (blinkPhase == 1) {
        setEyes(0)
        if (now - lastBlinkMs >= blinkOnMs) {
            // for double blink: reopen briefly then blink again
            if (doDouble) {
                blinkPhase = 2
                lastBlinkMs = now
            } else {
                blinkPhase = 0
            }
        }
    } else if (blinkPhase == 2) {
        setEyes(baseBright)
        if (now - lastBlinkMs >= 70) {
            blinkPhase = 3
            lastBlinkMs = now
        }
    } else if (blinkPhase == 3) {
        setEyes(0)
        if (now - lastBlinkMs >= blinkOnMs) {
            blinkPhase = 0
        }
    }
}

function chooseEmotion(now: number, distCm: number, loud: number, fell: boolean): Emotion {
    // Priority-based mapping (environment -> emotion)
    if (fell) return Emotion.Sad
    if (distCm > 0 && distCm < DANGER_CM) return Emotion.Scared
    if (loud > LOUD_LEVEL) return Emotion.Excited
    if (distCm > 0 && distCm < NEAR_CM) return Emotion.Curious
    if (loud < QUIET_LEVEL && fallCount >= SAD_AFTER_FALLS) return Emotion.Sad
    return Emotion.Calm
}

function applyBodyLanguage(now: number, distCm: number, loud: number): void {
    // Emotion -> actions
    if (emotion == Emotion.Calm) {
        robotPuPro.rest()
    } else if (emotion == Emotion.Curious) {
        // Look left/right while staying mostly still
        const yaw = 90 + Math.round(20 * Math.sin(now / 500))
        robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, yaw)
        robotPuPro.stand()
    } else if (emotion == Emotion.Scared) {
        // Back away / turn away from obstacle
        robotPuPro.walk(-1.2, 0)
    } else if (emotion == Emotion.Excited) {
        // Dance when the crowd is loud
        robotPuPro.dance()
    } else if (emotion == Emotion.Sad) {
        // “Low energy” posture + small head droop
        robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, 120)
        robotPuPro.rest()
    }
}

basic.forever(function () {
    const now = control.millis()

    // Environment signals
    const distCm = robotPuPro.sonarDistanceCm()
    const loud = input.soundLevel()
    const fell = input.isGesture(Gesture.FreeFall)

    if (fell && (now - lastFallMs) > 800) {
        fallCount += 1
        lastFallMs = now
    }

    // Decide emotion (with hold time)
    const desired = chooseEmotion(now, distCm, loud, fell)
    if (desired != emotion && (now - lastEmotionChange) > EMOTION_HOLD_MS) {
        emotion = desired
        lastEmotionChange = now

        // Optional: say the emotion
        // robotPuPro.talk("" + emotion)   // melodic voice
        // billy.say("" + emotion)           // real speech (requires pxt-billy)
    }

    // Express emotion
    blinkPattern(now)
    applyBodyLanguage(now, distCm, loud)

    basic.pause(20)
})

```

---

## Testing and calibration

1. **Calm test**: quiet room, no obstacles nearby. Eyes should blink slowly.
2. **Curious test**: place a wall ~20–30cm in front. Eyes should double-blink.
3. **Scared test**: place a wall very close (<15cm). PU should back away and blink fast.
4. **Excited test**: clap or play music loudly. PU should dance with brighter eyes.
5. **Sad test**: gently trigger free-fall gesture (pick up and release carefully) or let it tip. Eyes should dim and slow.

Tune:

* `NEAR_CM`, `DANGER_CM`
* `LOUD_LEVEL`, `QUIET_LEVEL`
* blink intervals and brightness values

---

## Troubleshooting

- **Eyes flicker too fast / looks jittery**
  - increase `basic.pause(20)` to `basic.pause(40)`
  - increase `EMOTION_HOLD_MS`
- **It’s always scared**
  - increase `DANGER_CM` only if needed; otherwise decrease it
  - ensure `sonarDistanceCm()` is returning realistic values (not 0)
- **It never gets excited**
  - lower `LOUD_LEVEL`
  - test by clapping close to the micro:bit
- **It keeps switching emotions**
  - increase `EMOTION_HOLD_MS`
  - widen the gap between thresholds (example: raise `NEAR_CM` and lower `DANGER_CM`)

## Next steps

* **More environment states**: include compass heading changes, repeated obstacle hits, or maze progress.
* **Emotion blending**: use probabilities instead of discrete states.
* **Personalities**: different robots can map the same world to different emotional responses.

