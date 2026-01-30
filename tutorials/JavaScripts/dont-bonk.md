
# 🤖 Robot PU: Operation “Don’t Bonk!” Project Wiki

Welcome to the official project repository for **Robot PU (Pair Up)**. In this challenge, you will program PU to **approach a wall as closely as possible without touching it**—using PU’s front sonar sensor and a smart “braking curve” algorithm.

---

## 📂 1. Introduction to Robot PU

**Robot PU** is an interactive STEM buddy controlled by a micro:bit. He is known for his:

* **Advanced Movement**: Walking, sidestepping, exploring, and performing motion sequences.
* **Autopilot Intelligence**: Using sensors to navigate and avoid obstacles.
* **Interactive AI**: Expressing behavior through motion, sounds, and speech.

---

## 🧱 2. Project: Operation “Don’t Bonk!”

### Problem Definition

We want PU to move forward toward a **Target Wall**, then stop with the **smallest possible gap**—without ever touching the wall.

### The Challenge Rules

1. **Autonomous Only**: Once you press “Start,” you cannot touch a controller. PU must rely entirely on his code and sensors.
2. **The Approach**: PU must move forward. Creeping inch-by-inch is allowed, but boring (see Tie-Breaker rules).
3. **The Stop**: Once PU’s wheels stop moving completely, the run is over. No inching forward after the initial stop.
4. **The Bonk Rule**: If any part of Robot PU touches the wall at any speed, it is an automatic **GAME OVER**.

### How to Win (Scoring)

Victory is determined by the **Gap of Glory**.

1. **Measurement**: Use a ruler or calipers to measure the distance between PU’s frontmost point and the wall.
2. **The Ranking**: The robot with the **smallest distance greater than 0.00mm** wins.

Example:

* Player A stops at 5cm.
* Player B stops at 1cm.
* Player C touches the wall.
* Winner: Player B.

#### ⚡ The Tie-Breaker: The “Speed Demon” Rule

If two engineers write code that stops PU at the **exact same distance**, the winner is the robot that **stopped first**.

This means you can’t just program PU to drive at 1% speed. You need an algorithm that is fast **and** precise.

---

## 🧠 3. Engineering Tips

* **Trust Your Sensors (But Not Too Much)**: Sensors have noise. They might say the wall is 10cm away when it’s actually 9cm. Your code should handle uncertainty.
* **The Braking Curve**: If you run full speed until the last centimeter, momentum can skid PU into the wall. Slow down as you get closer.
* **Sensor Update Rate**: The faster PU moves, the less time your program has to “think” between sensor pings.

---

## 🛠️ 4. Hardware Configuration

Robot PU uses a **front-facing ultrasonic sonar sensor**.

| API | Meaning |
| --- | --- |
| `robotPu.sonarDistanceCm()` | Read the current sonar distance in centimeters. |
| `robotPu.walk(speed, turn)` | Walk with forward speed and turning bias. |

The basic code is to get distance and walk, do not add any other code to slow down the observe-think-action loop.
```typescript
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
let distance = 0
robotPu.setChannel(166)
basic.forever(function () {
    distance = robotPu.sonarDistanceCm()
    robotPu.walkDo(Math.map(distance, 7, 20, -1, 6), 0)
    basic.pause(10)
})

```
---

## 💻 5. Implementation Script

Copy this code into the **JavaScript** tab of the MakeCode Editor.

Tips to win the game:

* Smooth the sonar distance to avoid measurement fluctuations.
* Map the sonar distance to proper moving speed.

```typescript
function clamp(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function ema(prev: number, next: number, alpha: number): number {
    // Exponential moving average: alpha closer to 1 = trust new reading more
    return prev * (1 - alpha) + next * alpha
}

let filteredCm = robotPu.sonarDistanceCm()

// Tunable parameters (adjust during calibration)
const FAR_CM = 80          // far away: go faster
const CAUTION_CM = 30      // begin slowing down
const STOP_CM = 6          // target stop distance (must stay > 0)
const HARD_STOP_CM = 4     // emergency stop threshold

const TURN = 0             // keep straight; adjust if your PU drifts

basic.forever(function () {
    // 1) Read sensor
    const rawCm = robotPu.sonarDistanceCm()

    // 2) Smooth sensor to reduce noise/jitter
    // If your readings are very jumpy, reduce alpha (e.g., 0.2)
    filteredCm = ema(filteredCm, rawCm, 0.35)

    // 3) Decide speed based on distance (a simple braking curve)
    let speed = 0

    if (filteredCm <= HARD_STOP_CM) {
        // Too close: stop immediately
        speed = 0
    } else if (filteredCm <= STOP_CM) {
        // Goal zone: stop
        speed = 0
    } else if (filteredCm <= CAUTION_CM) {
        // Caution zone: slow down as we approach
        // Map CAUTION_CM..STOP_CM to speed 1.2..0.2
        speed = Math.map(filteredCm, STOP_CM, CAUTION_CM, 0.2, 1.2)
    } else {
        // Far zone: move faster
        // Map FAR_CM..CAUTION_CM to speed 2.0..1.2
        speed = Math.map(filteredCm, CAUTION_CM, FAR_CM, 1.2, 2.0)
    }

    speed = clamp(speed, 0, 2.0)

    // 4) Command motion
    // Once speed hits 0, the run is “over” per the rules (no inching forward after stop).
    if (speed == 0) {
        robotPu.walk(0, 0)
        basic.pause(1000)
    } else {
        robotPu.walk(speed, TURN)
        basic.pause(30) // control loop rate (faster loop = more responsive braking)
    }
})

```

---

## 🧪 6. Testing & Calibration

1. **The Arena**: A flat surface with a distinct **Start Line** and a solid, flat **Target Wall**.
2. **The Distance**: Place Robot PU at the Start Line, exactly **2 meters (or 6 feet)** away from the wall.
3. **Autonomous Run**: Press start and do not touch a controller.
4. **Tune Parameters**:
   1. If PU stops too far, decrease `STOP_CM` slightly.
   2. If PU bonks, increase `STOP_CM` and/or increase `CAUTION_CM`.
   3. If readings fluctuate, reduce EMA `alpha` (e.g., from `0.35` to `0.2`).
5. **Measure the Gap of Glory**: Use a ruler/calipers from PU’s frontmost point to the wall.

---

## 🚀 7. Next Steps

* **Stronger Filtering**: Take 3-5 samples and use a median filter.
* **Drift Correction**: Add a small `TURN` bias if PU veers.
* **Speed Demon Optimization**: Keep a higher speed longer, but brake safely using a larger `CAUTION_CM`.

---

## 💡 8. Next Steps (Code Upgrades)

Use the snippets below as **drop-in replacements** or add-ons to the program in Section 5.

### 8.1 Stronger Filtering: 5-sample median sonar

Median filtering removes “spikes” better than averaging.

```typescript
function sort5(a: number[]): void {
    for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
            if (a[j] < a[i]) {
                const t = a[i]
                a[i] = a[j]
                a[j] = t
            }
        }
    }
}

function sonarMedian5Cm(): number {
    const s: number[] = []
    for (let i = 0; i < 5; i++) {
        s.push(robotPu.sonarDistanceCm())
        basic.pause(5)
    }
    sort5(s)
    return s[2]
}

// In your loop, replace:
// const rawCm = robotPu.sonarDistanceCm()
// with:
// const rawCm = sonarMedian5Cm()
```

### 8.2 Drift Correction: TURN bias + simple “steering while driving”

If PU consistently veers, use a small constant `TURN` bias.

```typescript
// Example values (try small changes like +/- 0.05)
const TURN = -0.08

// keep calling:
robotPu.walk(speed, TURN)
```

If PU veers more at higher speed, you can scale turn bias with speed:

```typescript
const TURN_BIAS = -0.06
let turn = TURN_BIAS
if (speed > 1.5) turn = TURN_BIAS * 1.3
robotPu.walk(speed, turn)
```

### 8.3 “Speed Demon” Optimization: faster far, stronger braking near

This profile stays faster until closer to the wall, then brakes more aggressively.

```typescript
// Replace your constants with a more aggressive profile
const FAR_CM = 100
const CAUTION_CM = 40
const STOP_CM = 6
const HARD_STOP_CM = 4

// Replace your speed mapping with this:
let speed = 0
if (filteredCm <= HARD_STOP_CM) {
    speed = 0
} else if (filteredCm <= STOP_CM) {
    speed = 0
} else if (filteredCm <= 12) {
    // Very close: crawl
    speed = 0.25
} else if (filteredCm <= CAUTION_CM) {
    // Brake harder across the caution zone
    speed = Math.map(filteredCm, 12, CAUTION_CM, 0.25, 1.6)
} else {
    // Far: move quickly
    speed = 2.3
}

// Keep speed within a safe range
speed = clamp(speed, 0, 2.5)
```

### 8.4 Remote Commands + Sonar “Beep & Walk” Demo

This example does two things at the same time:

1. It listens for **radio commands** from another micro:bit (or controller program) and passes them into Robot PU’s command runner.
2. It uses the **sonar distance** to generate an audio “parking sensor” effect (closer wall = higher pitch + faster beeps), while also mapping distance into a walking speed.

```typescript
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
let pulseDelay = 0
let pitch = 0
let distance = 0
robotPu.setChannel(166)
robotPu.setWalkSpeedRange(-3, 4)
basic.forever(function () {
    distance = robotPu.sonarDistanceCm()
    if (distance > 2 && distance < 100) {
        // Map 2cm->2000Hz and 100cm->200Hz
        pitch = Math.map(distance, 2, 100, 2000, 200)
        // Map 2cm->100ms and 100cm->800ms
        pulseDelay = Math.map(distance, 2, 100, 100, 800)
        music.setVolume(255)
        music.playTone(pitch, 50)
        basic.pause(pulseDelay)
    } else {
        basic.pause(500)
    }
})
basic.forever(function () {
    robotPu.walkDo(Math.map(distance, 7, 20, -1, 6), 0)
    basic.pause(10)
})

```

What each part is doing:

1. `radio.onReceivedString(...)` and `radio.onReceivedValue(...)`
   - Any incoming radio message is forwarded into `robotPu.runStringCommand(...)` or `robotPu.runKeyValueCommand(...)`.
   - This lets a second micro:bit send higher-level “commands” (strings or named values) while this program is also running its autonomous sonar logic.
2. `robotPu.setChannel(166)`
   - Sets the radio group/channel so only devices on the same channel talk to each other.
3. `robotPu.setWalkSpeedRange(-3, 4)`
   - Defines the allowed walking speed range. The negative minimum is important if you want to ever walk backward.
4. Sonar “beep” block
   - When distance is between `2` and `100` cm, the code maps distance into:
     - `pitch`: closer = higher frequency.
     - `pulseDelay`: closer = shorter delay (faster beeps).
   - Outside that range, it waits longer to avoid annoying noise when the reading is out-of-range.
5. `robotPu.walkDo(Math.map(distance, 8, 20, 0, 4), 0)`
   - Converts distance into forward walking speed: when the wall is close, speed approaches `0`; when farther, speed approaches `4`.

To allow PU to **back up** when it gets too close, tweak the mapping so very small distances produce a **negative speed**:

```typescript
robotPu.walkDo(Math.map(distance, 7, 20, -1, 4), 0)
```

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
