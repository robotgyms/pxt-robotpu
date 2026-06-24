# Missions (ROS-style autonomy tasks) for Robot PU

This tutorial provides mission recipes built from:

- safety guard
- local planner / obstacle avoidance
- behavior tree or state machine
- telemetry

---

## Prerequisites

- `behavior-tree-pu.md` (recommended)
- `telemetry-logging-pu.md` (recommended)
- `safety-watchdog-pu.md`

---

## Mission ideas

### 1) Patrol with interrupt

- normally: walk/explore
- if clap: dance for 3 seconds
- if obstacle: back up

### 2) Help request

- if too many recoveries: stop, broadcast `help` over radio

### 3) Return-to-beacon (simple)

- listen to a periodic beacon
- turn until signal stronger (toy)

---

## Example: Patrol + clap dance interrupt

```typescript
let danceUntil = 0

basic.forever(function () {
    const now = control.millis()
    const d = robotPuPro.sonarDistanceCm()

    if (input.soundLevel() > 70) {
        danceUntil = now + 3000
    }

    if (now < danceUntil) {
        robotPuPro.dance()
        basic.pause(40)
        return
    }

    if (d > 0 && d < 12) {
        robotPuPro.walkDo(-2, 0)
    } else {
        robotPuPro.walkDo(2, 0)
    }

    basic.pause(40)
})
```

---

## Next steps

- Replace the ad-hoc logic with a behavior tree
- Add telemetry: publish `mission,state` and `mission,timer`
- Add multi-robot missions (`task-allocation-pu.md`)
