# Fault Recovery (ROS-style recovery behaviors) for Robot PU

Recovery behaviors handle situations like:

- stuck against a wall
- repeated near-collisions
- too many safety stops

In ROS navigation stacks, recovery behaviors are common.

---

## Prerequisites

- `safety-watchdog-pu.md`

---

## What you will build

- A simple “stuck detector”
- A recovery routine:
  - back up
  - turn a random direction
  - retry

---

## Example: collision counter + recovery

```typescript
let nearCount = 0
let lastRecover = 0

const DANGER_CM = 12
const NEAR_CM = 20
const RECOVER_COOLDOWN_MS = 4000

function recover() {
    robotPuPro.walkDo(-2, 0)
    basic.pause(400)

    const dir = Math.randomRange(0, 1)
    if (dir == 0) robotPuPro.sideStepDo(-1)
    else robotPuPro.sideStepDo(1)
    basic.pause(350)
}

basic.forever(function () {
    const now = control.millis()
    const d = robotPuPro.sonarDistanceCm()

    if (d > 0 && d < DANGER_CM) {
        nearCount += 2
    } else if (d > 0 && d < NEAR_CM) {
        nearCount += 1
    } else {
        nearCount = Math.max(0, nearCount - 1)
    }

    if (nearCount >= 8 && now - lastRecover > RECOVER_COOLDOWN_MS) {
        lastRecover = now
        nearCount = 0
        recover()
    } else {
        robotPuPro.walkDo(2, 0)
    }

    basic.pause(50)
})
```

---

## Next steps

- Publish fault counters over radio (`telemetry-logging-pu.md`)
- Combine with a planner (`local-planner-pu.md`) so recovery becomes less necessary
