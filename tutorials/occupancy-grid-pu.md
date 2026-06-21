# Occupancy Grid (Tiny Mapping) for Robot PU

An occupancy grid is a 2D map where each cell is:

- unknown
- free
- occupied

In ROS this is `nav_msgs/OccupancyGrid`.

This tutorial builds a **tiny grid** (for example 9x9) and updates it using:

- heading
- sonar distance

---

## Prerequisites

- `odometry-pu.md` concepts (pose estimate)
- Robot PU extension

---

## Grid representation

We store integers:

- `0` unknown
- `1` free
- `2` occupied

---

## Example: build and display a tiny map

This example:

- keeps a robot cell `(cx, cy)` in a 9x9 grid
- uses sonar to mark a cell in front as occupied
- shows a 5x5 window on the LED matrix

```typescript
const W = 9
const H = 9

let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}

function setCell(x: number, y: number, v: number) {
    if (x < 0 || x >= W || y < 0 || y >= H) return
    grid[idx(x, y)] = v
}

let cx = 4
let cy = 4

const DANGER_CM = 20

basic.forever(function () {
    const d = robotPuPro.sonarDistanceCm()
    const heading = input.compassHeading()

    // Very rough "forward direction" into 4 bins
    let dx = 0
    let dy = 0
    if (heading < 45 || heading >= 315) { dx = 0; dy = -1 }
    else if (heading < 135) { dx = 1; dy = 0 }
    else if (heading < 225) { dx = 0; dy = 1 }
    else { dx = -1; dy = 0 }

    // Mark current cell as free
    setCell(cx, cy, 1)

    // Mark obstacle cell if close
    if (d > 0 && d < DANGER_CM) {
        setCell(cx + dx, cy + dy, 2)
        robotPuPro.back()
    } else {
        robotPuPro.walk()
    }

    // Render a 5x5 window centered on (cx,cy)
    basic.clearScreen()
    for (let yy = -2; yy <= 2; yy++) {
        for (let xx = -2; xx <= 2; xx++) {
            const gx = cx + xx
            const gy = cy + yy
            if (gx < 0 || gx >= W || gy < 0 || gy >= H) continue

            const v = grid[idx(gx, gy)]
            if (v == 2) led.plot(xx + 2, yy + 2)
        }
    }
    // Robot position
    led.plot(2, 2)

    basic.pause(50)
})
```

---

## Notes

This is intentionally simple:

- it bins heading into 4 directions
- it uses only one obstacle cell

---

## Next steps

- Expand to multi-cell ray marking (mark free cells until hit).
- Publish the grid over radio (`telemetry-logging-pu.md`).
- Plan paths on the grid (`path-planning-pu.md`).
