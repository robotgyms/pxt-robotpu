# Local Planner (Cost-based motion selection) for Robot PU

A local planner chooses the next action based on immediate sensor input.

In ROS navigation stacks, this is where obstacle avoidance and smooth motion happens.

This tutorial uses a simple **scoring function** over a small set of candidate actions.

---

## Prerequisites

- Basic sensor usage (`robotPuPro.sonarDistanceCm()` or `robotPuPro.frontDistanceArray()`)

---

## Candidate actions

We’ll consider:

- forward
- turn left
- turn right
- back

Each gets a score:

- higher score = better

---

## Example: score-based local planner

```typescript
const DANGER_CM = 12

function scoreForward(d: number): number {
    if (d > 0 && d < DANGER_CM) return -999
    return d
}

function scoreTurn(d: number): number {
    // Turning is always safe-ish but not preferred
    return 10
}

basic.forever(function () {
    const d = robotPuPro.sonarDistanceCm()

    const sF = scoreForward(d)
    const sL = scoreTurn(d)
    const sR = scoreTurn(d)
    const sB = 0

    let best = sF
    let action = 0

    if (sL > best) { best = sL; action = 1 }
    if (sR > best) { best = sR; action = 2 }
    if (sB > best) { best = sB; action = 3 }

    if (action == 0) robotPuPro.walkDo(2, 0)
    else if (action == 1) robotPuPro.sideStepDo(-1)
    else if (action == 2) robotPuPro.sideStepDo(1)
    else robotPuPro.walkDo(-2, 0)

    basic.pause(80)
})
```

---

## Next steps

- Add goal direction (desired heading) to bias left vs right
- Use distance array bins for better obstacle shape handling
- Combine with global planning by following waypoints but locally avoiding hazards
