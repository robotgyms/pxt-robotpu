
# 🤖 Robot PU: Q-Learning Dance Choreography (Beat-Synced Gait Sequencer) Project Wiki

Welcome to the official project repository for **Robot PU (Pair Up)**. In this project, we build a **dance controller** that:

* Starts from the robot’s **current pose (gait)**
* Detects **music beats** from the micro:bit microphone
* Changes to a **next gait** every **N beats**
* Uses **gait interpolation** + small **vibration wiggles** that track the music loudness
* Uses a simple **Q-table** to learn which gait transitions people prefer

The learning signals:

* **Penalty**: robot falling (detected by free-fall gesture)
* **Reward**: background noise level (`input.soundLevel()`), assuming people yell louder when the dance looks good

---

## 📂 1. Introduction to Robot PU Dance Mode

Robot PU already has a built-in `robotPu.dance()` behavior inside the extension. Internally it:

* Uses a beat detector (ring buffer + adaptive threshold)
* Adds pitch/yaw wiggles
* Randomly switches among stable dance poses every ~8–16 beats

In this tutorial, we will **build our own choreography layer** on top of public MakeCode APIs.

---

## 🧠 2. Key Concepts

### 2.1 Gaits (poses) as servo angle vectors

We represent each gait as 6 servo angles:

* LeftFoot, LeftLeg, RightFoot, RightLeg, HeadYaw, HeadPitch

### 2.2 Gait interpolation (smooth transition)

Instead of jumping instantly from one gait to another, we interpolate:

* For `K` steps, gradually move each servo from current angle to target angle

This helps reduce instability and makes the dance look smoother.

### 2.3 Music vibration wiggle

On each interpolation step, we add a small oscillation (wiggle) whose amplitude depends on:

* `input.soundLevel()` (louder music -> bigger wiggle)

### 2.4 Beat clock: change gait every N beats

We implement a simple beat detector (threshold + cooldown). Every time a beat happens, we increment `beatCount`.

When `beatCount % BEATS_PER_MOVE == 0`, we choose the next gait.

### 2.5 Q-table learning

We define:

* **State**: current gait index `s`
* **Action**: next gait index `a`

Q-learning updates the value of transitions:

`Q[s][a] = Q[s][a] + alpha * (reward + gamma * max(Q[a][*]) - Q[s][a])`

---

## 🛠️ 3. APIs Used (MakeCode + pxt-robotpu)

* `robotPu.servo(joint, angle)`
* `robotPu.servoStep(joint, target, stepSize)` (optional alternative)
* `robotPu.setMode(robotPu.Mode.API)` (optional, we can just drive servos)
* `input.soundLevel()`
* `input.isGesture(Gesture.FreeFall)`

---

## 💻 4. Implementation Script

Copy this code into the **JavaScript** tab of the MakeCode Editor.

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
    robotPu.servo(robotPu.ServoJoint.LeftFoot, angles[0])
    robotPu.servo(robotPu.ServoJoint.LeftLeg, angles[1])
    robotPu.servo(robotPu.ServoJoint.RightFoot, angles[2])
    robotPu.servo(robotPu.ServoJoint.RightLeg, angles[3])
    robotPu.servo(robotPu.ServoJoint.HeadYaw, angles[4])
    robotPu.servo(robotPu.ServoJoint.HeadPitch, angles[5])
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

## 🧪 5. Testing & Calibration

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

## 🚀 6. Next Steps

* **Better state definition**: include beat phase (downbeat vs offbeat) or “energy level” (quiet vs loud) as part of state.
* **Better reward**: normalize loudness by tracking background baseline noise.
* **More gaits**: add more stable pose vectors and constrain transitions that cause falls.
* **Export Q-table**: send `Q` values over radio to visualize learning.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
