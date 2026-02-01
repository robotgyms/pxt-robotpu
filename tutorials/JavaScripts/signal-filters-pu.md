# 🎛️ Lesson: Signal Filtering for Robot PU

Robot PU’s ultrasonic sonar is powerful, but real-world readings can be noisy. Small fluctuations can make a robot:

- **jitter** (rapidly switching decisions)
- **oscillate** (turn left/right repeatedly)
- **over-react** to single bad readings

This tutorial introduces the most useful filter types and then upgrades the **right-hand rule maze solver** (from `maze-pu.md`) by filtering the 5-bin sonar distance array.

---

## 1. The signal we are filtering: `frontDistanceArray()`

The extension exposes a 5-bin “front scan”:

```typescript
const d = robotPu.frontDistanceArray()
// d[0] far left
// d[1] left
// d[2] center/front
// d[3] right
// d[4] far right
```

These bins are built from the same internal scan binning used by the autopilot code (see `robotpu.ts` around the angle-to-bin mapping near line ~1078).

---

## 2. What is signal filtering?

**Signal filtering** is processing a noisy sensor stream into a cleaner signal that makes decisions more reliable.

Filtering helps you:

- smooth jitter
- remove spikes
- stabilize thresholds
- improve wall following and maze solving

---

## 3. Filter toolbox (what to use and when)

### A. Clamp (min/max)

**Best for**: preventing impossible values from breaking your logic.

```typescript
function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}
```

### B. Moving average (box filter)

**Best for**: smoothing jitter, but it adds delay.

```typescript
let window: number[] = []
const WINDOW_SIZE = 5

function movingAverage(x: number): number {
    window.push(x)
    if (window.length > WINDOW_SIZE) window.shift()

    let sum = 0
    for (let v of window) sum += v
    return sum / window.length
}

basic.forever(function () {
    const d = robotPu.frontDistanceArray()
    const frontRaw = d[2]
    const frontFiltered = movingAverage(frontRaw)
    serial.writeValue("front", frontFiltered)
    basic.pause(100)
})
```

### C. Exponential moving average (EMA / low-pass)

**Best for**: smooth + lightweight (no window array).

Formula:

`filtered = filtered + alpha * (raw - filtered)`

```typescript
let rightFiltered = 0
const ALPHA = 0.35

function ema(prev: number, x: number, a: number): number {
    if (prev <= 0) return x
    return prev + a * (x - prev)
}

basic.forever(function () {
    const d = robotPu.frontDistanceArray()
    const rightRaw = d[4]
    rightFiltered = ema(rightFiltered, rightRaw, ALPHA)
    serial.writeValue("right", rightFiltered)
    basic.pause(100)
})
```

### D. Median filter (great for sonar spikes)

**Best for**: removing one-off spikes while keeping sharp changes.

Median-of-3 is a classic choice.

```typescript
function median3(a: number, b: number, c: number): number {
    const arr = [a, b, c]
    arr.sort((x, y) => x - y)
    return arr[1]
}

basic.forever(function () {
    // take 3 readings (spaced slightly) and median-filter the front bin
    const a = robotPu.frontDistanceArray()[2]
    basic.pause(10)
    const b = robotPu.frontDistanceArray()[2]
    basic.pause(10)
    const c = robotPu.frontDistanceArray()[2]

    const frontMed = median3(a, b, c)
    serial.writeValue("front_med", frontMed)
    basic.pause(100)
})
```

### E. Complementary blend (fast + smooth)

**Best for**: combining raw responsiveness with filtered stability.

`blend = beta * raw + (1 - beta) * slowFiltered`

```typescript
let frontLPF = 0
const ALPHA_LPF = 0.75
const BETA = 0.55

basic.forever(function () {
    const raw = robotPu.frontDistanceArray()[2]
    frontLPF = frontLPF + (1 - ALPHA_LPF) * (raw - frontLPF)
    const blended = BETA * raw + (1 - BETA) * frontLPF
    serial.writeValue("front_blend", blended)
    basic.pause(100)
})
```

### F. Hysteresis (two thresholds)

**Best for**: preventing flip-flop when a signal is near the threshold.

```typescript
const OPEN_ON_CM = 30
const OPEN_OFF_CM = 22

function hysteresisUpdate(isOpen: boolean, d: number): boolean {
    if (isOpen) {
        if (d > 0 && d < OPEN_OFF_CM) return false
        return true
    } else {
        if (d > OPEN_ON_CM) return true
        return false
    }
}
```

---

## 4. Filters you should know about (but usually won’t use here)

### A. Kalman filter

Powerful, but too heavy for this use case on micro:bit.

### B. High-pass / band-pass / band-stop

Great for audio/vibration and frequency-domain problems, but not usually useful for slow sonar distances.

---

## 5. Upgraded maze solver (right-hand rule + filtering)

This is a drop-in replacement for the logic in `maze-pu.md`. It uses a combined pipeline:

- Median-of-3 per bin (spike rejection)
- EMA per bin (jitter smoothing)
- Complementary blend (keeps response snappy)

Copy into the **JavaScript** tab of MakeCode:

```typescript
// Right-hand rule maze solver with a combined filtering pipeline
// d[0..4] are left -> right distance bins

const OPEN_MIN_CM = 26
const TOO_CLOSE_CM = 12
const OPEN_MARGIN_CM = 12
const CLOSE_MARGIN_CM = 6
const WALL_TRACK_MAX_CM = 40

const FWD_SPEED = 1.8
const TURN_SPEED = 1.4
const TURN_BIAS = 0.9

// Filtering parameters
const EMA_ALPHA = 0.35      // bigger = faster response, smaller = smoother
const BETA = 0.55           // raw vs filtered blend (0.4..0.6 is typical)
const CLAMP_MAX_CM = 200

// Filter state per bin
let emaState: number[] = [0, 0, 0, 0, 0]

let leftOpen = false
let frontOpen = false
let rightOpen = false

let leftWallRef = 18
let rightWallRef = 18
let frontWallRef = 20

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function median3(a: number, b: number, c: number): number {
    const arr = [a, b, c]
    arr.sort((x, y) => x - y)
    return arr[1]
}

function ema(prev: number, x: number, a: number): number {
    if (prev <= 0) return x
    return prev + a * (x - prev)
}

function hysteresisUpdate(isOpen: boolean, d: number, openOn: number, openOff: number): boolean {
    if (isOpen) {
        if (d > 0 && d < openOff) return false
        return true
    } else {
        if (d > openOn) return true
        return false
    }
}

function max2(a: number, b: number): number {
    return a > b ? a : b
}

function driveFor(ms: number, speed: number, turn: number): void {
    const t0 = control.millis()
    while (control.millis() - t0 < ms) {
        robotPu.walk(speed, turn)
        basic.pause(10)
    }
}

function stepForward(): void {
    driveFor(220, FWD_SPEED, 0)
}

function turnRight90ish(): void {
    driveFor(380, TURN_SPEED, TURN_BIAS)
}

function turnLeft90ish(): void {
    driveFor(380, TURN_SPEED, -TURN_BIAS)
}

function turnAround(): void {
    turnLeft90ish()
    basic.pause(50)
    turnLeft90ish()
}

function filteredBins(): number[] {
    // sample 3 frames for median
    const a = robotPu.frontDistanceArray()
    basic.pause(5)
    const b = robotPu.frontDistanceArray()
    basic.pause(5)
    const c = robotPu.frontDistanceArray()

    const out: number[] = [0, 0, 0, 0, 0]
    for (let i = 0; i < 5; i++) {
        const raw = clampInt(a[i], 0, CLAMP_MAX_CM)
        const med = median3(a[i], b[i], c[i])
        const medC = clampInt(med, 0, CLAMP_MAX_CM)

        // EMA of median
        emaState[i] = ema(emaState[i], medC, EMA_ALPHA)

        // Complementary blend: raw + EMA
        out[i] = BETA * raw + (1 - BETA) * emaState[i]
    }
    return out
}

function updateWallRef(prev: number, d: number, a: number): number {
    if (d > 0 && d < WALL_TRACK_MAX_CM) {
        return ema(prev, d, a)
    }
    return prev
}

basic.forever(function () {
    const d = filteredBins()

    const dLeft = max2(d[0], d[1])
    const dFront = d[2]
    const dRight = max2(d[3], d[4])

    leftWallRef = updateWallRef(leftWallRef, dLeft, 0.08)
    rightWallRef = updateWallRef(rightWallRef, dRight, 0.08)
    frontWallRef = updateWallRef(frontWallRef, dFront, 0.05)

    const rightOn = Math.max(OPEN_MIN_CM, rightWallRef + OPEN_MARGIN_CM)
    const rightOff = Math.max(OPEN_MIN_CM - 2, rightWallRef + CLOSE_MARGIN_CM)
    const frontOn = Math.max(OPEN_MIN_CM, frontWallRef + OPEN_MARGIN_CM)
    const frontOff = Math.max(OPEN_MIN_CM - 2, frontWallRef + CLOSE_MARGIN_CM)
    const leftOn = Math.max(OPEN_MIN_CM, leftWallRef + OPEN_MARGIN_CM)
    const leftOff = Math.max(OPEN_MIN_CM - 2, leftWallRef + CLOSE_MARGIN_CM)

    rightOpen = hysteresisUpdate(rightOpen, dRight, rightOn, rightOff)
    frontOpen = hysteresisUpdate(frontOpen, dFront, frontOn, frontOff)
    leftOpen = hysteresisUpdate(leftOpen, dLeft, leftOn, leftOff)

    // Emergency: too close in front
    if (dFront > 0 && dFront < TOO_CLOSE_CM) {
        turnLeft90ish()
        return
    }

    // Right-hand rule priority
    if (rightOpen) {
        turnRight90ish()
    } else if (frontOpen) {
        stepForward()
    } else if (leftOpen) {
        turnLeft90ish()
    } else {
        turnAround()
    }
})
```

---

## 6. Why the filtered maze solver works better

### A. Fewer wrong turns

Median filtering rejects single spikes, so one bad echo won’t trigger a turn.

### B. Smoother corridor tracking

EMA reduces jitter, so your “open vs closed” decisions don’t flap around.

### C. Still responsive

The complementary blend keeps the robot from feeling “laggy” like a heavy moving average.