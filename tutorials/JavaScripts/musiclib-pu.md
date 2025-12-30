
# 🎛️ Lesson: `MusicLib` Beat + Tempo Detection (Syncing Artistic Moves)

## Introduction

Robot PU can look *artistic* when its body motion is synchronized to music.

On micro:bit, the microphone gives you **loudness** (amplitude) via `input.soundLevel()`.

This lesson focuses on rhythm:

- detect **beats**
- estimate **tempo (BPM)**
- sync **dance / body movements** to those beats

## Problem definition

We want Robot PU to:

- detect when a beat happens (clap/drum hit/strong rhythm)
- estimate tempo so the robot can stay “in time”
- trigger bigger motion on beats and smaller motion between beats

Constraints:

- `input.soundLevel()` is amplitude-only, so we can do beat/tempo well.
- detecting true musical pitch/notes from room audio is not reliable with `soundLevel` alone.

## Basic idea of solutions

There are two practical approaches:

- **Internal `MusicLib`** (extension development)
  - uses a ring buffer + adaptive threshold
  - outputs a beat event and a smoothed `period`

- **MakeCode-friendly beat detector** (normal projects)
  - threshold + cooldown to avoid double-triggering
  - smooth the measured beat period

Once we have beats + tempo:

- compute `BPM ≈ 60000 / periodMs`
- use a **beat clock** to schedule motion accents

## Implementation

### A. Using the internal `MusicLib` (extension development)

The Robot PU extension has an internal helper `MusicLib` (defined in `robotpu.ts`).

It provides:

- `isABeat(timestampMs, loudness, snr, sampleMs = 125): boolean`
- `period` (ms): estimated time between beats

Important:

- `MusicLib` is **not exported as a public MakeCode block API**.
- You can only instantiate `new MusicLib()` if you are editing/running code inside the extension source.

Example (extension dev):

```typescript
let now = 0
let micLoudness = 0

let musicDetector = new MusicLib()

basic.forever(function () {
    micLoudness = input.soundLevel()
    now = control.millis()

    // SNR is a sensitivity knob (typical starting point: ~1.1 to 1.3)
    if (musicDetector.isABeat(now, micLoudness, 1.2)) {
        // Beat detected
        led.plotBarGraph(255, 255)
    } else {
        // No beat: show loudness bar
        led.plotBarGraph(micLoudness, 255)
    }
})
```
Example program can be dlownlowed from https://makecode.microbit.org/S24031-00421-18959-80697

### B. MakeCode-friendly beat detector (public projects)

If you are writing a normal MakeCode project, implement a simple beat detector yourself:

```typescript
let lastBeatMs = 0
let periodMs = 500
let threshold = 140

function onBeat(now: number): void {
    // period estimate (smoothed)
    const newPeriod = now - lastBeatMs
    if (newPeriod > 150 && newPeriod < 2000) {
        periodMs = (periodMs * 3 + newPeriod) / 4
    }
    lastBeatMs = now
}

basic.forever(function () {
    const now = control.millis()
    const s = input.soundLevel()

    // Cooldown prevents double triggers
    if (s > threshold && (now - lastBeatMs) > periodMs * 0.4) {
        onBeat(now)
        led.toggle(2, 2)
    }
})
```

## Technical explaination

### A. Beat detection

Beat detection from loudness is typically:

- measure loudness
- detect peaks (above threshold)
- add a cooldown (so a single hit doesn’t count twice)

`MusicLib` does this more robustly by using a ring buffer and an adaptive threshold.

### B. Tempo estimation

Once you have an estimated beat period:

- `BPM ≈ 60000 / periodMs`

Example (show BPM on button A):

```typescript
input.onButtonPressed(Button.A, function () {
    const bpm = Math.round(60000 / periodMs)
    basic.showNumber(bpm)
})
```

### C. Syncing motion (making Robot PU look artistic)

The key trick is a **beat clock**:

- big move on beat (downbeat)
- smaller motion between beats
- change style every N beats

Example: “pop” on each beat, otherwise keep dancing.

```typescript
let beatCount = 0

function onBeatMotion(): void {
    beatCount += 1

    // Big accent move
    for (let i = 0; i < 120; i++) {
        robotPu.jump()
    }

    // Change style every 8 beats
    if (beatCount % 8 == 0) {
        robotPu.talk("yeah")
    }
}

basic.forever(function () {
    const now = control.millis()
    const s = input.soundLevel()

    if (s > threshold && (now - lastBeatMs) > periodMs * 0.4) {
        onBeat(now)
        onBeatMotion()
    } else {
        // Between beats: continuous motion
        robotPu.dance()
    }
})
```

Notes:

- `robotPu.dance()` is already music-reactive internally, but adding your own beat clock lets you design choreography.
- If jump is too aggressive, replace it with short bursts of `walk(...)`, `sideStep(...)`, or `stand()`.

## Testing

- **Beat test**
  - play music with a clear beat (or clap)
  - confirm the beat indicator (LED toggle / bar graph) triggers only once per beat

- **Tempo test**
  - press button A to show BPM
  - verify BPM is stable (not jumping wildly)

- **Artistic sync test**
  - run the “pop on beat” example
  - adjust `threshold` until the robot moves on the beat reliably

## Next steps

- **Tune thresholds** for different environments (quiet room vs loud room)
- **Adaptive threshold**: track background noise and set threshold automatically
- **Different choreography**: head/waist wiggles on off-beats, step accents on downbeats
- **More features**: detect “drops” (sudden loudness increase) to switch dance routines
