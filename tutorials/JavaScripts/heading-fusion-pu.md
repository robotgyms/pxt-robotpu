# Heading Fusion (Complementary Filter) for Robot PU

Compass heading can be noisy; gyro integration drifts.

A **complementary filter** blends them:

- compass = good long-term reference (low frequency)
- gyro integration = smooth short-term motion (high frequency)

In ROS, this is part of IMU fusion.

---

## Prerequisites

- Comfort with `control.millis()` timing
- Optional: `signal-filters-pu.md`

---

## Example: fused heading

Note: micro:bit gyro access is board-dependent; this tutorial keeps the structure simple.

If you don’t have gyro, you can still use the filtering pattern by smoothing compass changes.

```typescript
let fusedDeg = input.compassHeading()
let lastMs = control.millis()

// Complementary blend weight
// Higher = trust compass more
const ALPHA = 0.05

basic.forever(function () {
    const now = control.millis()
    const dt = (now - lastMs) / 1000
    lastMs = now

    // Raw compass
    const compassDeg = input.compassHeading()

    // If gyro yaw rate is available, integrate here:
    // const yawRateDegS = input.rotation(Rotation.Roll) // placeholder; depends on board
    // fusedDeg = fusedDeg + yawRateDegS * dt

    // Without gyro: use fusedDeg as a smoothed heading estimate
    const err = angleDiffDeg(compassDeg, fusedDeg)
    fusedDeg = wrapDeg(fusedDeg + ALPHA * err)

    // Example usage
    basic.showNumber(Math.round(fusedDeg))
    basic.pause(50)
})

function wrapDeg(a: number): number {
    while (a < 0) a += 360
    while (a >= 360) a -= 360
    return a
}

function angleDiffDeg(target: number, current: number): number {
    let d = wrapDeg(target) - wrapDeg(current)
    if (d > 180) d -= 360
    if (d < -180) d += 360
    return d
}
```

---

## Next steps

- Use `fusedDeg` in `odometry-pu.md`
- Use fused heading to stabilize mapping (`occupancy-grid-pu.md`)
