# Path Following (Grid Waypoints → Motion) for Robot PU

Planning produces a path; following executes it.

In ROS this is comparable to the controller that turns a global plan into motion.

---

## Prerequisites

- `path-planning-pu.md`
- Basic heading usage (`input.compassHeading()` or fused heading)

---

## Strategy

- Each grid step is a direction (N/E/S/W)
- Turn until heading matches desired direction
- Walk forward for a fixed time (one cell)

---

## Example: follow a direction list

```typescript
// 0=N, 1=E, 2=S, 3=W
let path: number[] = [1, 1, 2, 2, 2, 1]

const CELL_MS = 600

function turnToDir(dir: number) {
    // Map desired dir to target heading bins
    const targets = [0, 90, 180, 270]
    const target = targets[dir]

    for (let i = 0; i < 30; i++) {
        const h = input.compassHeading()
        const err = angleDiffDeg(target, h)
        if (Math.abs(err) < 15) return

        if (err > 0) robotPu.right()
        else robotPu.left()
        basic.pause(80)
    }
}

basic.forever(function () {
    for (let i = 0; i < path.length; i++) {
        turnToDir(path[i])
        robotPu.walk()
        basic.pause(CELL_MS)
        robotPu.rest()
        basic.pause(80)
    }

    robotPu.rest()
    basic.pause(1000)
})

function angleDiffDeg(target: number, current: number): number {
    let d = target - current
    while (d > 180) d -= 360
    while (d < -180) d += 360
    return d
}
```

---

## Next steps

- Replace fixed `CELL_MS` with “walk until distance traveled estimate says 1 cell”
- Add obstacle replan if sonar detects a new obstacle
