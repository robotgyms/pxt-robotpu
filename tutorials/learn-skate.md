# Learn to skate

We put on roller blades on robot PU.
Use reinforcement learning to make robot PU learn skating.

## Reward function

- Reward forward momentum by accumulating positive Y acceleration from the IMU.
- Penalize falling down when `robotPuPro.bodyPitch()` or `robotPuPro.bodyRoll()` exceeds 60 degrees.

## Parameters to tune

- `w_t`: skate roll (lateral tilt of the foot)
- `l_t`: skate step size (leg swing range)
- `s_t`: skate foot height (how high the foot lifts)
- `h_t`: skate leg height (how high the leg lifts)
- `speedGain`: overall gait speed multiplier

## Why SPSA (not Q-table or plain gradient descent)

**Q-table** needs a discrete (state, action) space. Our parameters are continuous real numbers
and the sensor readings (acceleration, roll, pitch) are also continuous. Discretizing everything
produces a table far too large for the micro:bit's 16 KB RAM.

**Finite-difference gradient descent** estimates the gradient by nudging each parameter one at
a time: that needs N+1 = 6 trial runs per update step. Each trial requires the robot to skate
for a few seconds, so one update takes ~18 seconds of real time. Worse, the micro:bit
accelerometer is noisy, so a single-sample reward measurement gives a very noisy gradient.

**SPSA (Simultaneous Perturbation Stochastic Approximation)** solves both problems:
- It perturbs **all parameters at once** with random ±1 signs, so it only needs **2 trial runs**
  per gradient estimate regardless of how many parameters there are.
- The random perturbation direction acts as built-in noise averaging over many update steps.
- It is well proven for real robot gait tuning with noisy reward signals.

One SPSA update step costs 2 physical trials (~6 seconds) instead of 6 (~18 seconds).

## How one SPSA update works

```
1. Pick a random direction: delta[i] = +1 or -1 for each parameter i
2. Skate with params + eps*delta  → measure reward r_plus
3. Skate with params - eps*delta  → measure reward r_minus
4. Gradient estimate: g[i] = (r_plus - r_minus) / (2 * eps * delta[i])
5. Update: params[i] += alpha * g[i]
6. Clamp params to safe servo ranges
```

## Software architecture

### Why two loops instead of one blocking loop

A single `for` loop inside `basic.forever` stalls the MakeCode scheduler.
The gait state machine must be called every ~10 ms to produce smooth servo motion.
If the learning code sleeps inside a blocking loop, the servos freeze mid-pose and the
robot falls over before any reward is measured.

The solution is to split responsibility across two concurrent loops:

| | Loop 1 `basic.forever` | Loop 2 `control.inBackground` |
|---|---|---|
| **Runs** | every ~10 ms, always | sleeps until triggered |
| **Does** | one gait step, samples ax/ay, detects fall | reads reward, runs SPSA, updates params |
| **Writes** | `rewardAcc`, `cycleCount`, `fell` | `params`, `bestParams`, `spsaPhase` |

Loop 1 never stops moving. Loop 2 never touches servo commands directly.

### Why trigger on gait cycles, not a timer

The gait has natural synchrony: states 0+1 = left stride, 2+3 = right stride.
Every 4 completed states = 2 left + 2 right = one full skating cycle.
`cycleCount` increments when `gaitState` wraps `3 → 0`.

Measuring reward over whole cycles removes **phase bias** — you always compare
apples to apples when evaluating `r_plus` vs `r_minus`. A timer-based trigger
could catch the robot mid-stride on one trial and mid-air on another, skewing the gradient.

### Fall detection, stop, and recovery

When a fall is detected (tilt > 45°) the sequence is:

```
Loop 1 tick:
  rewardAcc -= 500   ← penalty recorded
  fell    = true     ← signals Loop 2 to wake
  paused  = true     ← Loop 1 stops skate() and reward sampling on next tick

Loop 2 wakes (fell == true):
  calls waitForRecovery()
    → talks "I fell"
    → blocks until bodyPitch < 20° AND bodyRoll < 20°  (human stands robot up)
    → waits 1 extra second to let robot settle
    → talks "Ready"
    → sets paused = false   (Loop 1 resumes)
  calls startTrial()         ← resets accumulators, same spsaPhase, same params
  continues                  ← retries the same trial cleanly
```

Three design choices worth noting:

- **`paused` stops Loop 1 immediately.** Without it, Loop 1 would keep calling `skate()` while the robot is on the floor, wasting cycles and accumulating meaningless sensor data.
- **The −500 penalty is kept, not discarded.** The fall happened under the current params, so the gradient should know those params caused a fall. Resetting `rewardAcc` to zero would lie to SPSA.
- **The trial is retried (not skipped).** After recovery, `startTrial()` resets the accumulators and Loop 2 runs the same SPSA phase again with fresh data. This prevents a single fall from corrupting the gradient with only one noisy sample.

### Why a `fell` flag instead of `break`

Loop 1 cannot `break` into Loop 2. Instead it sets `fell = true` and adds the −500
penalty to `rewardAcc`. Loop 2's wait condition checks `!fell` alongside `cycleCount`,
so it wakes up immediately on a fall without waiting for full cycles to complete.

### Why `startTrial()` is a single function

It atomically resets `rewardAcc`, `cycleCount`, `fell`, clamps params, and rebuilds
the gait arrays. Called by Loop 2 at the start of every trial phase, it ensures Loop 1
starts accumulating fresh measurements with the correct new parameters and never reads
stale reward data from the previous trial.

### `spsaPhase` state machine

SPSA needs 3 sequential trials (+ ε, − ε, candidate). The `spsaPhase` variable (0, 1, 2)
lets Loop 2 know which trial just finished and what to do next, without any blocking or
nested function calls.

```
spsaPhase 0  →  run params + eps*delta,  collect r_plus
spsaPhase 1  →  run params - eps*delta,  collect r_minus,  compute gradient step
spsaPhase 2  →  run candidate params,    collect r_new,    keep or revert
```

After phase 2, a new random `delta` is drawn and phase resets to 0.

```javascript
robotPuPro.setServoTrim(-6, -5, -6, -5, -8, 0)

// --- Gait parameters [w_t, l_t, s_t, h_t, speedGain] ---
let params =     [18,  45,  15,  35,  2.0]
let bestParams = [22,  45,  15,  30,  2.0]
let bestReward = -999

// Safe range for each parameter: [min, max]
let paramMin = [5,  20, 0,  10, 0.5]
let paramMax = [35, 50, 15, 50, 4.0]

// SPSA hyper-parameters
let alpha0   = 0.1  // initial learning rate
let alphaExp = 0.6  // decay exponent: effective alpha = alpha0 / step^alphaExp
                    // higher = faster decay (less fluctuation, slower exploration)
let eps      = 2.0  // perturbation size (how far to nudge for gradient estimate)
let momentum = 0.7  // blend toward bestParams: 0 = pure gradient, 1 = no movement
                    // candidate = bestParams * momentum + gradientStep * (1-momentum)

// --- Gait arrays rebuilt from params each trial ---
let w_t = params[0]
let l_t = params[1]
let s_t = params[2]
let h_t = params[3]
let skates1 = [90 - w_t,       90 + h_t,      90 - w_t - s_t, 90 + h_t,  90 - l_t,  80]
let skates2 = [90,             90 + l_t,      90,             90 + l_t,  90 - l_t, 80]
let skates3 = [90 + w_t + s_t, 90 - h_t,      90 + w_t,       90 - h_t,  90 + l_t,  80]
let skates4 = [90,             90 - l_t,      90,             90 - l_t,  90 + l_t, 80]
let skateSpeed1 = [1, 1, 3, 1, 1, 1]  // left foot
let skateSpeed2 = [3, 1, 1, 1, 1, 1]  // right foot
let gaitState = 0

function rebuildGaits(): void {
    w_t = params[0]; l_t = params[1]; s_t = params[2]; h_t = params[3]
    skates1 = [90 - w_t,       90 + h_t,      90 - w_t - s_t, 90 + h_t,  90 - l_t,  80]
    skates2 = [90,             90 + l_t,      90,             90 + l_t,  90 - l_t, 80]
    skates3 = [90 + w_t + s_t, 90 - h_t,      90 + w_t,       90 - h_t,  90 + l_t,  80]
    skates4 = [90,             90 - l_t,      90,             90 - l_t,  90 + l_t, 80]
}

function skate(speedGain: number): void {
    switch (gaitState) {
        case 0:
            if (robotPuPro.moveServos(skates1, skateSpeed1, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true) {
                gaitState += 1
                gaitState = gaitState % 4
            }
            break
        case 1:
            if (robotPuPro.moveServos(skates2, skateSpeed1, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true) {
                gaitState += 1
                gaitState = gaitState % 4
            }
            break
        case 2:
            if (robotPuPro.moveServos(skates3, skateSpeed2, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true) {
                gaitState += 1
                gaitState = gaitState % 4
            }
            break
        case 3:
            if (robotPuPro.moveServos(skates4, skateSpeed2, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true) {
                gaitState += 1
                gaitState = gaitState % 4
            }
            break
    }
}

// --- Two-loop architecture ---
//
// NOTE: control.inBackground() SPAWNS a new fiber each call — it does NOT
// overwrite any existing background fiber. MakeCode already runs one fiber
// from main.ts (updateStates + stateMachine every 5 ms). Our SPSA loop adds
// a second independent fiber. Both run concurrently under the scheduler.
//
// The internal fiber calls robot.updateStates() which has its own fall
// detection (bodyRoll2 > 75 deg, sets gst = -3). To prevent it from
// hijacking control during a skate trial we keep gst = Mode.API (6) at all
// times. getRobotAPI() sets this automatically each time moveServos() is
// called, but we also pin it explicitly inside waitForRecovery().
//
// Why not one blocking for-loop?
//   A blocking loop inside basic.forever stalls the MakeCode scheduler.
//   The gait state machine needs to be called every ~10 ms to produce
//   smooth servo motion. If the learning code sleeps inside a loop, the
//   servos freeze mid-pose.
//
// Solution: two concurrent loops
//   Loop 1 (basic.forever)  — runs every tick, always skating, samples reward
//   Loop 2 (control.inBackground) — waits for N full gait cycles, then
//     reads the accumulated reward, runs one SPSA gradient step, updates params
//
// Why trigger on gait cycles (not a timer)?
//   The gait has natural synchrony: states 0+1 = left stride, 2+3 = right stride.
//   Every 4 completed states = 2 left + 2 right = one full skating cycle.
//   Measuring reward over whole cycles removes phase bias — you always compare
//   apples to apples when evaluating two different parameter sets.

// Reward weights
let w_x = 0.5   // lateral wobble penalty weight (X accel)

// Shared reward accumulators — written by Loop 1, read & reset by Loop 2
// Split into two components so we can log them separately:
//   efficiencyAcc  = sum of positive Y acceleration (forward momentum)
//   stabilityAcc   = sum of -w_x*|ax| penalties + fall penalty
//   rewardAcc      = efficiencyAcc + stabilityAcc  (used by SPSA)
let efficiencyAcc = 0
let stabilityAcc = 0
let rewardAcc = 0
let cycleCount = 0      // counts completed gait states (0-3 each = 1 count)
let fell = false        // set true by Loop 1 when fall detected; read by Loop 2
let paused = false      // set true by Loop 2 during recovery; Loop 1 stops action
let stepCount = 0       // total SPSA update steps completed, used for log numbering

// SPSA phase bookkeeping
// phase 0 = collecting reward for params+eps*delta (r_plus trial)
// phase 1 = collecting reward for params-eps*delta (r_minus trial)
// phase 2 = collecting reward for candidate update (r_new trial)
let spsaPhase = 0
let rPlus = 0
let rMinus = 0
let delta = [0, 0, 0, 0, 0]
let measureCycles = 4   // how many full gait cycles to measure per trial

// Clamp all params to safe servo ranges.
function clampParams(): void {
    for (let i = 0; i < 5; i++) {
        params[i] = Math.constrain(params[i], paramMin[i], paramMax[i])
    }
}

// Apply params for the current SPSA phase and reset accumulators.
function startTrial(): void {
    efficiencyAcc = 0
    stabilityAcc = 0
    rewardAcc = 0
    cycleCount = 0
    fell = false
    clampParams()
    rebuildGaits()
}

// Emit one CSV log line over serial after every accepted parameter update.
// Format: step, reward, efficiency, stability, w_t, l_t, s_t, h_t, speedGain
// Connect micro:bit USB to a PC and open a serial terminal at 115200 baud
// (or use MakeCode's built-in serial console) to record the learning curve.
function logUpdate(reward: number, efficiency: number, stability: number): void {
    serial.writeLine(
        stepCount + "," +
        Math.round(reward) + "," +
        Math.round(efficiency) + "," +
        Math.round(stability) + "," +
        Math.round(bestParams[0]) + "," +
        Math.round(bestParams[1]) + "," +
        Math.round(bestParams[2]) + "," +
        Math.round(bestParams[3]) + "," +
        Math.round(bestParams[4] * 100)  // speedGain * 100 to avoid decimals
    )
}

// Block Loop 2 until the robot is upright again (both angles < 20 deg).
// During this wait, Loop 1 is paused so no gait commands are sent.
// The human places the robot back on its feet; once stable, training resumes.
//
// We also keep robotPu in API mode (gst = 6) throughout recovery so the
// internal state machine fiber (updateStates/stateMachine in main.ts) cannot
// transition gst to -3 ("Help me") and interrupt the learning session.
function waitForRecovery(): void {
    paused = true
    robotPuPro.talk("I fell")   // melodic voice; use billy.say() for real speech
    // pin API mode to block the internal state machine from taking over
    robotPuPro.setModeVar(robotPuPro.Mode.API)
    // wait until both tilt angles are safely upright
    while (Math.abs(robotPuPro.bodyPitch()) > 20 || Math.abs(robotPuPro.bodyRoll()) > 20) {
        basic.pause(200)
        robotPuPro.setModeVar(robotPuPro.Mode.API)  // re-pin each poll in case it got reset
    }
    // small extra pause to let the robot settle after being placed
    basic.pause(1000)
    paused = false
    robotPuPro.talk("Ready")
}

// --- Loop 1: gait execution + per-tick reward sampling ---
// Runs continuously. Every tick:
//   - skips action entirely while paused (robot fell, waiting for recovery)
//   - skates one servo step
//   - samples ax, ay and accumulates reward
//   - detects fall early at 45 degrees: adds penalty, sets fell, sets paused
//   - increments cycleCount each time gaitState wraps from 3 → 0
basic.forever(function () {
    // stop action and measurement while Loop 2 handles recovery
    if (paused) {
        basic.pause(10)
        return
    }

    let prevState = gaitState
    skate(params[4])

    // count a completed full cycle when gaitState wraps (3 → 0)
    if (prevState == 3 && gaitState == 0) {
        cycleCount += 1
    }

    // per-tick reward: efficiency (Y accel) minus lateral wobble (X accel)
    let ay = input.acceleration(Dimension.Y)
    let ax = input.acceleration(Dimension.X)
    let effTick = (ay > 0) ? ay : 0
    let stabTick = -(w_x * Math.abs(ax))
    efficiencyAcc += effTick
    stabilityAcc += stabTick
    rewardAcc += effTick + stabTick

    // fall detection: add penalty to stability and signal Loop 2 to stop and recover
    if (Math.abs(robotPuPro.bodyPitch()) > 45 || Math.abs(robotPuPro.bodyRoll()) > 45) {
        stabilityAcc -= 500
        rewardAcc -= 500
        fell = true
        paused = true   // stops Loop 1 immediately on next tick
    }

    basic.pause(10)
})

// --- Loop 2: SPSA learning — runs in background, triggers every measureCycles ---
// Waits until Loop 1 has completed measureCycles full gait cycles (or a fall),
// reads the accumulated reward, advances the SPSA state machine, updates params.
control.inBackground(function () {
    // Pick initial random perturbation direction for this SPSA step
    for (let i = 0; i < 5; i++) {
        delta[i] = Math.randomRange(0, 1) == 0 ? 1 : -1
    }
    // Start phase 0: params + eps*delta
    for (let i = 0; i < 5; i++) params[i] = bestParams[i] + eps * delta[i]
    startTrial()

    while (true) {
        // Wait until enough cycles measured or robot fell
        while (cycleCount < measureCycles && !fell) {
            basic.pause(10)
        }

        // If the robot fell: wait for human to place it back upright, then
        // restart the current trial from scratch with the same params.
        // The bad reward (with -500 penalty) is already in rewardAcc and
        // will be used as-is — so falling still costs the SPSA step.
        if (fell) {
            waitForRecovery()
            startTrial()    // reset accumulators; same spsaPhase, same params
            continue
        }

        if (spsaPhase == 0) {
            // Finished r_plus trial
            rPlus = rewardAcc
            // Start phase 1: params - eps*delta
            spsaPhase = 1
            for (let i = 0; i < 5; i++) params[i] = bestParams[i] - eps * delta[i]
            startTrial()

        } else if (spsaPhase == 1) {
            // Finished r_minus trial — compute gradient step
            rMinus = rewardAcc
            // Decay alpha: steps get smaller as training progresses so the
            // optimizer settles rather than bouncing around a good solution.
            let alphaEff = alpha0 / Math.pow(stepCount + 1, alphaExp)
            for (let i = 0; i < 5; i++) {
                let g = (rPlus - rMinus) / (2 * eps * delta[i])
                // Blend candidate toward bestParams (momentum pull):
                //   pure gradient would be: bestParams[i] + alphaEff * g
                //   momentum pulls it back: * (1-momentum) + bestParams[i] * momentum
                //   net effect: smaller effective step, anchored near best known params
                params[i] = bestParams[i] * momentum + (bestParams[i] + alphaEff * g) * (1 - momentum)
            }
            // Start phase 2: evaluate the candidate params
            spsaPhase = 2
            startTrial()

        } else {
            // Finished candidate trial — keep or revert
            let rNew = rewardAcc
            let effNew = efficiencyAcc
            let stabNew = stabilityAcc
            if (rNew > bestReward) {
                bestReward = rNew
                for (let i = 0; i < 5; i++) bestParams[i] = params[i]
                robotPuPro.talk("Better")
            } else {
                for (let i = 0; i < 5; i++) params[i] = bestParams[i]
                rebuildGaits()
            }
            // log every step regardless of keep/revert so the trend is visible
            stepCount += 1
            logUpdate(rNew, effNew, stabNew)
            // Start next SPSA step: new random direction, phase 0
            spsaPhase = 0
            for (let i = 0; i < 5; i++) {
                delta[i] = Math.randomRange(0, 1) == 0 ? 1 : -1
            }
            for (let i = 0; i < 5; i++) params[i] = bestParams[i] + eps * delta[i]
            startTrial()
        }
    }
})

// Print CSV header so the serial log is self-labelled.
// Columns: step, reward, efficiency, stability, w_t, l_t, s_t, h_t, speedGain*100
serial.writeLine("step,reward,efficiency,stability,w_t,l_t,s_t,h_t,speedGain100")
robotPuPro.talk("Learning to skate")
```