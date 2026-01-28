# Odometry-lite (Pose Estimation) for Robot PU

Odometry is how a robot estimates its motion over time.

In ROS this is usually `/odom`. On Robot PU we can build a simple version suitable for teaching:

- maintain `(x, y)` in centimeters
- maintain `headingDeg`
- update pose using **commanded motion** (dead reckoning)

This will drift, and that’s the point: you learn why mapping/localization exist.

---

## Prerequisites

- Robot PU extension
- Optional: telemetry receiver from `telemetry-logging-pu.md`

---

## Model

We assume:

- when you call `robotPu.walk()` repeatedly, the robot moves roughly forward
- you choose a forward speed estimate `V_CM_S`
- heading comes from the compass (simple) or a fused estimate (advanced)

---

## Example: dead-reckoning pose

```typescript
radio.setGroup(42)

let xCm = 0
let yCm = 0

let lastMs = control.millis()

const V_CM_S = 6

function txKV(key: string, value: number) {
    radio.sendString(key + "," + value)
}

basic.forever(function () {
    const now = control.millis()
    const dtMs = now - lastMs
    lastMs = now

    // Simple heading from compass
    const headingDeg = input.compassHeading()
    const headingRad = headingDeg * Math.PI / 180

    const dt = dtMs / 1000

    // Dead-reckoning: move forward at constant estimated speed
    xCm += V_CM_S * dt * Math.cos(headingRad)
    yCm += V_CM_S * dt * Math.sin(headingRad)

    // Drive the robot
    robotPu.walk()

    // Telemetry (optional)
    txKV("x", Math.round(xCm))
    txKV("y", Math.round(yCm))
    txKV("h", Math.round(headingDeg))

    basic.pause(50)
})
```

---

## Testing

- Put the robot on a flat surface.
- Let it walk forward for 2–3 seconds.
- Turn it 90 degrees, walk again.
- Watch `(x,y)` drift.

---

## Next steps

- Use `heading-fusion-pu.md` to stabilize heading.
- Use `occupancy-grid-pu.md` to map cells as you move.
