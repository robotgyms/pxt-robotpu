# Dance tutorial (Robot PU)

This tutorial teaches you how to make Robot PU dance in MakeCode, starting from the built-in `robotPuPro.dance()` behavior and progressing to a **beat-synced choreography**.

The final section includes an optional **advanced** project: a Q-learning gait sequencer.

## Prerequisites

- Open https://makecode.microbit.org
- Add the Robot PU extension
- Make sure you have good footing (non-slippery surface) and enough battery

## Part 1: Quick start (built-in dance)

The easiest way to dance is to call `robotPuPro.dance()` in a loop.

```typescript
basic.forever(function () {
    robotPuPro.dance()
    basic.pause(20)
})
```

## Part 2: What is a “gait”?

A gait (pose) can be represented as a 6-value vector of servo angles:

- LeftFoot, LeftLeg, RightFoot, RightLeg, HeadYaw, HeadPitch

By switching among a few safe gaits, you can create choreography.

## Part 3: Smooth choreography (interpolate between poses)

Jumping directly between poses can make PU wobble. Interpolating (moving in small steps) looks smoother and is safer.

```typescript
// Gaits: [LeftFoot, LeftLeg, RightFoot, RightLeg, HeadYaw, HeadPitch]
// Angles are examples. Tune these for your robot.
let gaits: number[][] = [
    [90, 90, 90, 90, 90, 80],   // 0 neutral
    [80, 120, 100, 60, 70, 80], // 1 lean left
    [100, 60, 80, 120, 110, 80],// 2 lean right
    [95, 110, 85, 70, 90, 65],  // 3 squat-ish
    [85, 70, 95, 110, 120, 75], // 4 twist head right
    [95, 70, 85, 110, 60, 75],  // 5 twist head left
]

let currentAngles = [90, 90, 90, 90, 90, 80]

function setPose(angles: number[]): void {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, angles[0])
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, angles[1])
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, angles[2])
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, angles[3])
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, angles[4])
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, angles[5])
}

function interpolateTo(target: number[], steps: number, stepMs: number): void {
    let start = currentAngles
    for (let k = 1; k <= steps; k++) {
        let a0 = Math.round(start[0] + (target[0] - start[0]) * k / steps)
        let a1 = Math.round(start[1] + (target[1] - start[1]) * k / steps)
        let a2 = Math.round(start[2] + (target[2] - start[2]) * k / steps)
        let a3 = Math.round(start[3] + (target[3] - start[3]) * k / steps)
        let a4 = Math.round(start[4] + (target[4] - start[4]) * k / steps)
        let a5 = Math.round(start[5] + (target[5] - start[5]) * k / steps)

        currentAngles = [a0, a1, a2, a3, a4, a5]
        setPose(currentAngles)
        basic.pause(stepMs)
    }
}
```

## Part 4: Beat-synced dance (simple beat clock)

We can approximate a beat with a **threshold + cooldown** using `input.soundLevel()`.

- When loudness spikes above a threshold, count it as a beat.
- Every `BEATS_PER_MOVE` beats, choose a new gait.

```typescript
const BEATS_PER_MOVE = 8

let threshold = 140
let lastBeatMs = 0
let beatCount = 0
let currentGait = 0

function detectBeat(now: number, loud: number): boolean {
    // Cooldown prevents double-triggering
    if (loud > threshold && (now - lastBeatMs) > 200) {
        lastBeatMs = now
        return true
    }
    return false
}

setPose(currentAngles)

basic.forever(function () {
    let now = control.millis()
    let loud = input.soundLevel()

    if (detectBeat(now, loud)) {
        beatCount += 1

        if (beatCount % BEATS_PER_MOVE == 0) {
            // Pick a different gait
            let next = Math.randomRange(0, gaits.length - 1)
            if (next == currentGait) next = (next + 1) % gaits.length

            interpolateTo(gaits[next], 18, 20)
            currentGait = next
        }
    }

    // Idle motion between beats
    interpolateTo(gaits[currentGait], 1, 20)
})
```

## Part 5 (optional): Add “wiggle” based on loudness

To make the robot look more alive, you can add a small head wiggle that scales with loudness.

The simplest place to do this is inside the interpolation step (modify head angles slightly).

## Part 6 (advanced): Q-learning gait sequencer

This section is optional. It keeps the idea of a “gait sequencer”, but uses a simple Q-table to learn which transitions look best.

The learning signals in this example:

- **Penalty**: robot falling (detected by `Gesture.FreeFall`)
- **Reward**: “crowd noise” (`input.soundLevel()`), assuming people cheer louder for good moves

Copy the following into the JavaScript tab if you want to experiment:

```typescript
const GAITS = 6

// Beat detector
let lastBeatMs = 0
let periodMs = 500
let threshold = 140
let beatCount = 0
const BEATS_PER_MOVE = 8

// Q-learning
const alpha = 0.15
const gamma = 0.8
let epsilon = 0.25

let Q: number[][] = []

function initQ(): void {
    Q = []
    for (let s = 0; s < GAITS; s++) {
        const row: number[] = []
        for (let a = 0; a < GAITS; a++) row.push(0)
        Q.push(row)
    }
}

function maxQ(s: number): number {
    let m = Q[s][0]
    for (let a = 1; a < GAITS; a++) {
        if (Q[s][a] > m) m = Q[s][a]
    }
    return m
}

function chooseAction(s: number): number {
    if (Math.randomRange(0, 100) < Math.round(epsilon * 100)) {
        return Math.randomRange(0, GAITS - 1)
    }
    let bestA = 0
    let bestV = Q[s][0]
    for (let a = 1; a < GAITS; a++) {
        const v = Q[s][a]
        if (v > bestV) {
            bestV = v
            bestA = a
        }
    }
    return bestA
}

function updateQ(s: number, a: number, r: number): void {
    const target = r + gamma * maxQ(a)
    Q[s][a] = Q[s][a] + alpha * (target - Q[s][a])
}

// Gaits: [LeftFoot, LeftLeg, RightFoot, RightLeg, HeadYaw, HeadPitch]
// Angles are examples. Tune these to your robot.
let gait: number[][] = [
    [90, 90, 90, 90, 90, 80],   // 0 neutral
    [80, 120, 100, 60, 70, 80], // 1 lean left
    [100, 60, 80, 120, 110, 80],// 2 lean right
    [95, 110, 85, 70, 90, 65],  // 3 squat-ish
    [85, 70, 95, 110, 120, 75], // 4 twist head right
    [95, 70, 85, 110, 60, 75],  // 5 twist head left
]

let currentAngles = [90, 90, 90, 90, 90, 80]
let currentGait = 0

function setPose(angles: number[]): void {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, angles[0])
    robotPuPro.servo(robotPuPro.ServoJoint.LeftLeg, angles[1])
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, angles[2])
    robotPuPro.servo(robotPuPro.ServoJoint.RightLeg, angles[3])
    robotPuPro.servo(robotPuPro.ServoJoint.HeadYaw, angles[4])
    robotPuPro.servo(robotPuPro.ServoJoint.HeadPitch, angles[5])
}

function interpAndWiggle(target: number[], steps: number, stepMs: number): void {
    const start = currentAngles
    for (let k = 1; k <= steps; k++) {
        const ms = input.soundLevel()
        const amp = Math.min(8, Math.max(0, Math.round((ms - 60) * 0.06)))
        const phase = control.millis() / 120
        const wig = Math.round(amp * Math.sin(phase))

        const a0 = Math.round(start[0] + (target[0] - start[0]) * k / steps)
        const a1 = Math.round(start[1] + (target[1] - start[1]) * k / steps)
        const a2 = Math.round(start[2] + (target[2] - start[2]) * k / steps)
        const a3 = Math.round(start[3] + (target[3] - start[3]) * k / steps)
        const a4 = Math.round(start[4] + (target[4] - start[4]) * k / steps) + wig
        const a5 = Math.round(start[5] + (target[5] - start[5]) * k / steps) + Math.round(wig * 0.6)

        currentAngles = [a0, a1, a2, a3, a4, a5]
        setPose(currentAngles)
        basic.pause(stepMs)
    }
}

function detectBeat(now: number, loud: number): boolean {
    if (loud > threshold && (now - lastBeatMs) > periodMs * 0.4) {
        const newPeriod = now - lastBeatMs
        if (newPeriod > 150 && newPeriod < 2000) {
            periodMs = (periodMs * 3 + newPeriod) / 4
        }
        lastBeatMs = now
        return true
    }
    return false
}

initQ()
setPose(currentAngles)

basic.forever(function () {
    const now = control.millis()
    const loud = input.soundLevel()

    // Beat clock
    if (detectBeat(now, loud)) {
        beatCount += 1
    }

    // Change gait every N beats
    if (beatCount > 0 && beatCount % BEATS_PER_MOVE == 0 && (now - lastBeatMs) < 80) {
        const s = currentGait
        const a = chooseAction(s)

        // Execute transition (interpolate)
        interpAndWiggle(gait[a], 18, 20)

        // Reward / penalty
        let reward = 0
        reward += Math.round((loud - 90) * 0.2)   // “crowd noise” reward
        if (reward < -10) reward = -10
        if (reward > 20) reward = 20

        if (input.isGesture(Gesture.FreeFall)) {
            reward = -40 // falling penalty
        }

        updateQ(s, a, reward)

        currentGait = a

        // Slowly reduce exploration as it learns
        epsilon = Math.max(0.05, epsilon * 0.999)
    } else {
        // Between gait changes: keep tiny wiggle so it looks alive
        interpAndWiggle(gait[currentGait], 1, 20)
    }
})

```

---

## Testing and calibration

1. **Start quiet**: run in a quiet room first to avoid accidental beat triggers.
2. **Tune beat threshold**:
   1. If it triggers too often, increase `threshold`.
   2. If it never triggers, decrease `threshold`.
3. **Tune stability**:
   1. Reduce wiggle by lowering `amp` mapping.
   2. Reduce interpolation aggressiveness by increasing `steps` and/or increasing `stepMs`.
4. **Tune learning**:
   1. Increase `alpha` to learn faster (but can become unstable).
   2. Reduce `epsilon` faster to “lock in” a favorite routine.

---

## Next steps

* **Better state definition**: include beat phase (downbeat vs offbeat) or “energy level” (quiet vs loud) as part of state.
* **Better reward**: normalize loudness by tracking background baseline noise.
* **More gaits**: add more stable pose vectors and constrain transitions that cause falls.
* **Export Q-table**: send `Q` values over radio to visualize learning.

---

## Troubleshooting

- **It changes gaits too often**
  - increase `threshold` or increase the beat cooldown in `detectBeat()`
- **It never detects a beat**
  - decrease `threshold`
- **It wobbles or tips**
  - increase interpolation `steps` or `stepMs`
  - reduce extreme gait angles
  - avoid dancing on slippery surfaces
