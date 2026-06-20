# Behavior Trees (ROS Nav2-style mission structure) for Robot PU

Behavior trees are a structured way to build missions.

In ROS (Nav2), a behavior tree can coordinate planning, control, recovery, and safety.

This tutorial implements a tiny behavior tree runner:

- **Sequence**: run children in order, stop on failure
- **Selector**: try children until one succeeds
- **Leaf**: condition or action

---

## Prerequisites

- State machine familiarity (`state-machine-pu.md`)

---

## Status codes

- `0` = fail
- `1` = running
- `2` = success

---

## Minimal behavior tree framework

```typescript
enum BTStatus { Fail = 0, Running = 1, Success = 2 }

type BTNode = () => BTStatus

function sequence(nodes: BTNode[]): BTNode {
    let i = 0
    return function () {
        while (i < nodes.length) {
            const s = nodes[i]()
            if (s == BTStatus.Running) return s
            if (s == BTStatus.Fail) { i = 0; return s }
            i++
        }
        i = 0
        return BTStatus.Success
    }
}

function selector(nodes: BTNode[]): BTNode {
    let i = 0
    return function () {
        while (i < nodes.length) {
            const s = nodes[i]()
            if (s == BTStatus.Running) return s
            if (s == BTStatus.Success) { i = 0; return s }
            i++
        }
        i = 0
        return BTStatus.Fail
    }
}

function cond(fn: () => boolean): BTNode {
    return function () {
        return fn() ? BTStatus.Success : BTStatus.Fail
    }
}

function act(fn: () => void, ms: number): BTNode {
    let start = 0
    return function () {
        const now = control.millis()
        if (start == 0) start = now
        fn()
        if (now - start >= ms) { start = 0; return BTStatus.Success }
        return BTStatus.Running
    }
}
```

---

## Example mission

- If obstacle close: back up
- Else: walk

```typescript
const DANGER_CM = 12

const obstacleClose = cond(function () {
    const d = robotPuPro.sonarDistanceCm()
    return d > 0 && d < DANGER_CM
})

const backUp = act(function () { robotPuPro.back() }, 400)
const walk = act(function () { robotPuPro.walk() }, 200)

const root = selector([
    sequence([obstacleClose, backUp]),
    walk
])

basic.forever(function () {
    root()
    basic.pause(20)
})
```

---

## Next steps

- Add recovery subtree (from `fault-recovery-pu.md`)
- Add goal-directed navigation subtree (planner + follower)
- Add safety guards (`safety-watchdog-pu.md`) around all actions
