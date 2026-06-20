# Balance on uneven ground with feedback control (Robot PU)

Uneven ground can push Robot PU off-balance during **walking** and **dancing**. Robot PU already has built-in stabilization, but you can improve robustness by adding a small **feedback controller** in MakeCode.

This tutorial explains feedback control (P/PI/PD/PID) and shows how to apply a lightweight PID loop using:

- micro:bit tilt sensing (`input.rotation(...)`)
- Robot PU control bias keys: `#puroll` and `#pupitch`
- normal behaviors: `robotPuPro.walk(...)` and `robotPuPro.dance()`

## Feedback control: the idea

A feedback loop has:

- **Setpoint**: the value you want (here: roll ≈ 0, pitch ≈ 0)
- **Measurement**: what you have (roll, pitch from the accelerometer)
- **Error**: `e = setpoint - measurement`
- **Controller**: computes an output from the error
- **Actuation**: apply output to the robot (`#puroll`, `#pupitch`)

## P, PI, PD, PID (what each term does)

- **P (proportional)**
  - output grows with error
  - easy, responsive, can oscillate if too strong
- **I (integral)**
  - output grows with accumulated error over time
  - removes steady bias/drift, can “wind up” if unchecked
- **D (derivative)**
  - output grows with how fast error is changing
  - adds damping, but is sensitive to noise

PID combines all three:

`u = Kp * e + Ki * ∑e*dt + Kd * de/dt`

## Discrete PID for micro:bit (MakeCode friendly)

In MakeCode, we update the controller in a loop using `control.millis()` to estimate `dt`.

The important practical details:

- **Clamp outputs** to keep motion safe.
- **Anti-windup**: clamp the integral term.
- **Derivative noise**: smooth `de/dt`.

## PID helper (roll + pitch)

```typescript
class Pid {
    kp: number
    ki: number
    kd: number
    i: number = 0
    prevE: number = 0
    prevD: number = 0

    iLimit: number
    dSmooth: number

    constructor(kp: number, ki: number, kd: number, iLimit: number, dSmooth: number) {
        this.kp = kp
        this.ki = ki
        this.kd = kd
        this.iLimit = iLimit
        this.dSmooth = dSmooth
    }

    update(e: number, dt: number): number {
        // Integral with anti-windup
        this.i += e * dt
        this.i = Math.constrain(this.i, -this.iLimit, this.iLimit)

        // Derivative with smoothing
        let dRaw = dt > 0 ? (e - this.prevE) / dt : 0
        let d = this.prevD * this.dSmooth + dRaw * (1 - this.dSmooth)
        this.prevD = d
        this.prevE = e

        return this.kp * e + this.ki * this.i + this.kd * d
    }
}
```

## Example 1: PID-assisted walking on uneven ground

This example:

- walks with a gentle forward command
- runs a PID loop that generates roll/pitch compensation
- sends compensation using `#puroll` and `#pupitch`

```typescript
let lastMs = control.millis()

// Start conservative. Tune one axis at a time.
let rollPid = new Pid(0.8, 0.0, 0.12, 20, 0.6)
let pitchPid = new Pid(0.8, 0.0, 0.12, 20, 0.6)

const OUT_LIMIT = 35

basic.forever(function () {
    let now = control.millis()
    let dt = (now - lastMs) / 1000
    lastMs = now

    // Measurement
    let roll = input.rotation(Rotation.Roll)
    let pitch = input.rotation(Rotation.Pitch)

    // Setpoint = 0 (upright)
    let eRoll = 0 - roll
    let ePitch = 0 - pitch

    let uRoll = rollPid.update(eRoll, dt)
    let uPitch = pitchPid.update(ePitch, dt)

    uRoll = Math.constrain(uRoll, -OUT_LIMIT, OUT_LIMIT)
    uPitch = Math.constrain(uPitch, -OUT_LIMIT, OUT_LIMIT)

    // Apply bias into the stabilizer
    robotPuPro.runKeyValueCommand("#puroll", uRoll)
    robotPuPro.runKeyValueCommand("#pupitch", uPitch)

    // Gentle walking command (avoid sharp turns on uneven ground)
    robotPuPro.walk(0.9, 0.10)
    basic.pause(20)
})
```

## Example 2: PID-assisted dancing with tilt guard

Dancing can be unstable on uneven ground. This example runs PID assist, but stops to recover when tilt is large.

```typescript
let lastMs = control.millis()

let rollPid = new Pid(0.8, 0.0, 0.12, 20, 0.6)
let pitchPid = new Pid(0.8, 0.0, 0.12, 20, 0.6)

const OUT_LIMIT = 35
const TILT_RECOVER = 30

basic.forever(function () {
    let now = control.millis()
    let dt = (now - lastMs) / 1000
    lastMs = now

    let roll = input.rotation(Rotation.Roll)
    let pitch = input.rotation(Rotation.Pitch)

    // Safety guard
    if (Math.max(Math.abs(roll), Math.abs(pitch)) >= TILT_RECOVER) {
        robotPuPro.walk(0, 0)
        robotPuPro.rest()
        basic.pause(150)
        return
    }

    let uRoll = rollPid.update(0 - roll, dt)
    let uPitch = pitchPid.update(0 - pitch, dt)

    uRoll = Math.constrain(uRoll, -OUT_LIMIT, OUT_LIMIT)
    uPitch = Math.constrain(uPitch, -OUT_LIMIT, OUT_LIMIT)

    robotPuPro.runKeyValueCommand("#puroll", uRoll)
    robotPuPro.runKeyValueCommand("#pupitch", uPitch)

    robotPuPro.dance()
    basic.pause(20)
})
```

## Tuning guide (practical)

- **Start with P only**
  - set `ki = 0`, `kd = 0`
  - increase `kp` until it reacts, then back off a little
- **Add D to stop oscillation**
  - increase `kd` slowly
  - if it jitters, increase `dSmooth` or reduce `kd`
- **Add I only if needed**
  - if it leans consistently in one direction, add a small `ki`
  - keep `iLimit` small to prevent windup
- **Keep outputs bounded**
  - tune `OUT_LIMIT` first (safety)

## Troubleshooting

- **Jittery output**
  - increase `basic.pause(...)` a bit
  - increase `dSmooth`
  - reduce `kd`
- **Slow correction**
  - increase `kp`
- **Overshoot / oscillation**
  - reduce `kp`
  - increase `kd` slightly