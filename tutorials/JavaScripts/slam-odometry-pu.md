# SLAM Odometry for Robot PU

This tutorial shows how to use Robot PU odometry for localization in SLAM.

Validated MakeCode:

```typescript
radio.onReceivedNumber(function (receivedNumber) {
    robotPu.runStringCommand("")
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
let location: number[] = []
robotPu.setChannel(166)
basic.forever(function () {
    location = robotPu.locationArray()
    serial.writeLine("x:" + location[0])
    serial.writeLine("y:" + location[1])
    serial.writeLine("theta:" + location[2])
    basic.pause(2000)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // allow gamepad to trim servos to improve balancing
    robotPu.toggleServoTrim()
    basic.pause(500)
})
```

Odometry estimates where the robot is by accumulating small motion updates.

Robot PU already includes odometry in `robotpu.ts`. The public MakeCode blocks use the internal `RobotPUOdometry` class, so this tutorial reads the built-in pose instead of calculating a separate dead-reckoning model in the tutorial code.

---

## What the MakeCode does

- **Receive number commands**: `radio.onReceivedNumber(...)` passes remote commands to `robotPu.runStringCommand("")`.
- **Receive key-value commands**: `radio.onReceivedValue(...)` passes remote control values to `robotPu.runKeyValueCommand(name, value)`.
- **Set the radio channel**: `robotPu.setChannel(166)` keeps the robot on channel `166`.
- **Read the pose**: `robotPu.locationArray()` returns `[x, y, theta]`.
- **Print telemetry**: `serial.writeLine(...)` sends pose values to the serial console.

The `x` and `y` values are in millimeters. The `theta` value is in degrees.

---

## How `RobotPUOdometry` works

In `robotpu.ts`, each `RobotPu` owns one odometry object:

```typescript
this.odom = new RobotPUOdometry(25.0)
```

`RobotPUOdometry` stores the robot pose as a 3x3 SE(2) transformation matrix. Each walking step updates that matrix:

- **Left support step**: `leftStep(yawAngleDeg)`
- **Right support step**: `rightStep(yawAngleDeg)`
- **General update**: `update(transformationMatrix)`
- **Read pose**: `getPosition()`
- **Reset pose**: `reset()`

`RobotPu.walk(speed, turn)` updates odometry when the gait reaches a left or right support step. It compares the current leg servo target with the previous leg target, then calls `this.odom.leftStep(...)` or `this.odom.rightStep(...)`.

---

## Transformation matrix model

Robot PU is a biped robot with two leg yaw axes about `50 mm` apart. The odometry model uses half of that distance:

```typescript
this.odom = new RobotPUOdometry(25.0)
```

So the support pivots are:

- **Left leg pivot**: `(-25, 0)` mm in the robot frame
- **Right leg pivot**: `(25, 0)` mm in the robot frame

The robot pose is stored as a 3x3 homogeneous transformation matrix:

```text
T_world_robot =
[ cos(theta)  -sin(theta)   x ]
[ sin(theta)   cos(theta)   y ]
[ 0            0            1 ]
```

The first two columns store the robot heading. The last column stores robot position. To read the pose:

```typescript
let xMm = T[0][2]
let yMm = T[1][2]
let thetaDeg = Math.atan2(T[1][0], T[0][0]) * 180 / Math.PI
```

This is exactly what `RobotPUOdometry.getPosition()` does before `robotPu.locationArray()` returns `[x, y, theta]`.

---

## Step update from a support pivot

Each completed walking step is modeled as a rotation around the support leg pivot. In `robotpu.ts`, the step transform is:

```text
T_step = Trans(pivot) * Rot(deltaTheta) * Trans(-pivot)
```

Then odometry accumulates the new step onto the current pose:

```text
T_next = T_current * T_step
```

For a left-support step:

```typescript
this.update(rotateAboutPivot(deg2rad(yawAngleDeg), [-this.axisHalfDistanceMm, 0.0]))
```

For a right-support step:

```typescript
this.update(rotateAboutPivot(deg2rad(yawAngleDeg), [this.axisHalfDistanceMm, 0.0]))
```

The helper functions in `robotpu.ts` implement the same math:

- **`rot2(thetaRad)`**: builds the 2D rotation matrix.
- **`se2(R, t)`**: embeds rotation and translation into a 3x3 pose matrix.
- **`trans2(tx, ty)`**: builds a pure translation matrix.
- **`rotateAboutPivot(deltaYawRad, pivotXYmm)`**: builds `T_step`.
- **`updateOdometry(TworldRobot, stepTransformationMatrix)`**: computes `T_next`.

---

## Example: one left-support step

Assume the robot starts at:

```text
x = 0 mm, y = 0 mm, theta = 0 degrees
```

If the left leg is the support pivot at `(-25, 0)` mm and the robot yaws by `30 degrees`, the update is:

```text
T_step = Trans(-25, 0) * Rot(30 degrees) * Trans(25, 0)
T_next = identity * T_step
```

The resulting pose is approximately:

- **x**: `-3.35 mm`
- **y**: `12.50 mm`
- **theta**: `30 degrees`

That position comes from rotating the robot body around the left leg pivot, not from simply adding a straight-line distance.

---

## Example: two alternating steps

Assume:

- **Step 1**: left support pivot at `(-25, 0)` mm, yaw `+45 degrees`
- **Step 2**: right support pivot at `(25, 0)` mm, yaw `-45 degrees`

The matrix updates are:

```text
T1 = T0 * T_left(+45 degrees)
T2 = T1 * T_right(-45 degrees)
```

Because the rotations cancel, the final heading returns to approximately `0 degrees`. The position still changes because each rotation happened around a different pivot:

- **After step 1**: `(x, y, theta) ≈ (-7.32, 17.68, 45°)`
- **After step 2**: `(x, y, theta) ≈ (-14.65, 35.36, 0°)`

This is why odometry needs the full transformation matrix. Tracking only heading would miss the translation caused by rotating around each support leg.

---

## MakeCode blocks used

- **`set channel to 166`**
- **`robot location array`**
- **`serial write line`**

The `robot location array` block returns:

- **Index 0**: `x` in millimeters
- **Index 1**: `y` in millimeters
- **Index 2**: `theta` in degrees

---

## Testing

- **Place the robot flat**: Start on a clear, flat surface.
- **Open serial output**: Watch `x`, `y`, and `theta`.
- **Move the robot**: Use radio remote commands or walking blocks so the gait steps complete.
- **Watch pose drift**: The pose should change as walking steps update odometry.
- **Reset odometry**: Use the `reset robot location` block when you want the pose to return to `(0, 0, 0)`.

---

## Notes

Odometry is not perfect. It will drift because small step errors accumulate over time. That drift is why SLAM and localization need landmarks, maps, sensors, or external corrections.

Use this tutorial as the robot pose source for later mapping lessons such as occupancy grids.
