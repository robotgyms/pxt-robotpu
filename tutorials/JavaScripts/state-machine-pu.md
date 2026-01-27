# 🔁 Lesson: State Machines (Robot PU Dance on Beat)

A **state machine** (finite state machine, FSM) is a way to structure robot behavior as:

- **States**: what the robot is doing right now
- **Transitions**: when to switch to a different state
- **Guards**: safety or rule checks that must be true before switching

State machines are perfect for robotics because they keep behavior **predictable** and **safe**.

In this lesson we’ll use Robot PU’s **`dance()`** behavior as a real example:

- The robot listens for **beats** (from microphone sound level)
- On certain beats, it switches to the **next dance gait state**
- The switching is constrained by:
  - **Safety concerns** (don’t do risky moves when unstable)
  - **Cosmetic concerns** (avoid repeating the same move, don’t switch too fast)

---

## 1. State machine vocabulary

### A. States

Examples:

- `IDLE`
- `DANCING`
- `RECOVER`

### B. Transitions

Examples:

- `IDLE -> DANCING` when a beat is detected
- `DANCING -> RECOVER` when the robot tilts too far

### C. Guards (rules)

A guard is a condition that prevents unsafe or ugly transitions.

Examples:

- “Only switch to the next move if body roll and pitch are within safe limits.”
- “Only change moves if at least 1 second passed since last change.”

---

## 2. How Robot PU `dance()` behaves internally (concept)

Inside the extension (`robotpu.ts`), `dance()` does roughly this:

- Reads `input.soundLevel()`
- Uses the music helper to detect whether the signal is “a beat”
- Occasionally (on a slower/low beat) it selects a **new dance gait state** from an approved list
- While dancing it also applies **balance compensation** so movement is safer

That’s already a state machine:

- **State**: current `danceState`
- **Event**: beat detected
- **Cosmetic rule**: don’t switch every beat (cooldown based on tempo)
- **Safety rule**: balance control limits how aggressively it can tilt

---

## 3. Build your own beat-driven dance state machine (MakeCode)

We’ll implement a *project-level* state machine in MakeCode that uses:

- **Event**: beat detected (simple beat detector)
- **Safety guard**: don’t switch moves if tilt is too high
- **Cosmetic guard**:
  - don’t switch too frequently
  - don’t repeat the same move twice

Important note:

- In MakeCode you don’t directly set Robot PU’s internal gait list.
- Instead, we demonstrate the **FSM design pattern** by deciding *when to dance* and *when to recover*, and we use beat events to drive those transitions.

---

## 4. Implementation script

Copy into the **JavaScript** tab of MakeCode.

```typescript
// Beat-driven dance state machine

enum DanceSM {
    Idle = 0,
    Dancing = 1,
    Recover = 2
}

let sm = DanceSM.Idle

// Safety thresholds (degrees)
const SAFE_ROLL = 25
const SAFE_PITCH = 25

// Cosmetic rules
const SWITCH_COOLDOWN_MS = 1200
let lastSwitchMs = 0
let lastMove = -1

// "Moves" here are cosmetic labels for your state machine logic.
// The robot's internal dance routine will still generate motion,
// but you can use these IDs to pick patterns (lights/sounds/etc.).
const MOVES = [0, 1, 2, 3]
let moveIndex = 0

function abs(x: number): number {
    return x < 0 ? -x : x
}

function isSafe(): boolean {
    const r = abs(robotPu.bodyRoll())
    const p = abs(robotPu.bodyPitch())
    return r < SAFE_ROLL && p < SAFE_PITCH
}

// Very small beat detector:
// detects a "clap/beat" when sound rises above threshold,
// and rate-limits triggers with a cooldown.
const BEAT_THRESHOLD = 160
const BEAT_DEBOUNCE_MS = 250
let lastBeatMs = 0

function beatDetected(): boolean {
    const now = control.millis()
    if (now - lastBeatMs < BEAT_DEBOUNCE_MS) return false
    if (input.soundLevel() >= BEAT_THRESHOLD) {
        lastBeatMs = now
        return true
    }
    return false
}

function nextMove(): number {
    // cosmetic rule: avoid repeating
    let m = MOVES[moveIndex]
    moveIndex = (moveIndex + 1) % MOVES.length
    if (m == lastMove) {
        m = MOVES[moveIndex]
        moveIndex = (moveIndex + 1) % MOVES.length
    }
    lastMove = m
    return m
}

basic.forever(function () {
    const now = control.millis()
    const safe = isSafe()
    const beat = beatDetected()

    // Global safety transition
    if (!safe && sm != DanceSM.Recover) {
        sm = DanceSM.Recover
    }

    if (sm == DanceSM.Idle) {
        robotPu.stand()

        if (beat && safe) {
            // Start dancing on beat
            sm = DanceSM.Dancing
            lastSwitchMs = now
            nextMove()
        }
    }
    else if (sm == DanceSM.Dancing) {
        // Keep calling dance() so the internal routine can run
        robotPu.dance()

        // Switch to next "gait state" on beat if:
        // - safe
        // - cooldown expired (cosmetic)
        if (beat && safe && (now - lastSwitchMs > SWITCH_COOLDOWN_MS)) {
            lastSwitchMs = now
            nextMove()

            // Cosmetic feedback per move (example: LEDs)
            // You can replace this with your own effects.
            if (lastMove == 0) basic.showIcon(IconNames.Heart)
            else if (lastMove == 1) basic.showIcon(IconNames.Diamond)
            else if (lastMove == 2) basic.showIcon(IconNames.SmallDiamond)
            else basic.showIcon(IconNames.Happy)
        }

        // If unsafe, recovery is handled by the global guard above
    }
    else {
        // Recover
        // Safety concern: stop dancing and return to stable pose
        robotPu.stand()

        // When safe again, go back to idle
        if (safe) {
            sm = DanceSM.Idle
        }
    }

    basic.pause(20)
})
```

---

## 5. Why the guards matter

### Safety concern (guard)

If the robot is already tilted, a “fun” gait transition can amplify the tilt and cause a fall.
The guard prevents switching or forces recovery.

### Cosmetic concern (guard)

If you switch too often:

- the dance looks jittery
- the robot never completes a movement

The cooldown and “no repeat” rule makes the dance look intentional.

---

## 6. Next steps

Try upgrading the example:
 
 - Replace `beatDetected()` with a better detector (moving average / EMA + dynamic threshold)
 - Use **custom events** (`control.raiseEvent`) instead of `beat` booleans
 - Add a `LostSignal` / `Stop` state (useful when controlling dance over radio)