# Body roll / pitch equation

You are trying to convert the IMU angles measured in the **head sensor frame** into the robot **body frame**, using the current head yaw and head pitch.

Current code is approximately:

```ts
this.bodyRoll = bd_p * Math.sin(servo_yaw) + this.rl * Math.cos(servo_yaw);
this.bodyPitch = bd_p * Math.cos(servo_yaw) - this.rl * Math.sin(servo_yaw);
```

This is a **2D rotation around yaw only**. It assumes the IMU pitch/roll vector can be rotated by head yaw:

```text
[bodyPitch]   [ cos(yaw)  -sin(yaw) ] [headPitch]
[bodyRoll ] = [ sin(yaw)   cos(yaw) ] [headRoll ]
```

So:

```text
bodyPitch = headPitch * cos(yaw) - headRoll * sin(yaw)
bodyRoll  = headPitch * sin(yaw) + headRoll * cos(yaw)
```

That matches your current line 905 / 908 if:

```ts
headPitch = bd_p
headRoll = this.rl
```

## But with head pitch, full 3D transform is better

If the IMU is inside the head, and the head has both:

- **Yaw**: `servo_yaw`
- **Pitch**: `servo_pitch`

then the more correct way is to transform the measured gravity vector using rotation matrices.

## Coordinate assumption

Assume:

- `X`: robot right
- `Y`: robot forward
- `Z`: robot up
- [roll](cci:1://file:///home/front/Documents/pxt-robotpu/robotpu.ts:1572:4-1572:79): rotation around `Y` or `forward axis`? Actually this depends on your convention.
- [pitch](cci:1://file:///home/front/Documents/pxt-robotpu/robotpu.ts:1573:4-1573:89): rotation around `X` or side axis.
- `yaw`: rotation around `Z`.

For common robotics convention:

- [roll](cci:1://file:///home/front/Documents/pxt-robotpu/robotpu.ts:1572:4-1572:79): rotation about body `X`
- [pitch](cci:1://file:///home/front/Documents/pxt-robotpu/robotpu.ts:1573:4-1573:89): rotation about body `Y`
- `yaw`: rotation about body `Z`

But micro:bit `Dimension.X/Y/Z` and your current equations appear to use a custom convention, so signs may need testing.

## Matrix form

If the head orientation relative to body is:

```text
R = Rz(yaw) * Ry(pitch)
```

then the gravity vector measured in head frame should be transformed back into body frame by:

```text
g_body = R * g_head
```

or depending on convention:

```text
g_body = Rᵀ * g_head
```

The correct direction depends on whether `R` maps **body to head** or **head to body**.

## Practical equation using gravity vector

Instead of rotating the angles directly, reconstruct the gravity vector from measured head roll/pitch:

```ts
let hp = this.pth * Math.PI / 180;
let hr = this.rl * Math.PI / 180;

let gx = Math.sin(hr);
let gy = Math.sin(hp) * Math.cos(hr);
let gz = Math.cos(hp) * Math.cos(hr);
```

Then rotate by head yaw and pitch.

For head-to-body with yaw then pitch:

```ts
let cy = Math.cos(servo_yaw);
let sy = Math.sin(servo_yaw);
let cp = Math.cos(servo_pitch);
let sp = Math.sin(servo_pitch);

// Rz(yaw) * Ry(pitch)
let bx = cy * cp * gx - sy * gy + cy * sp * gz;
let by = sy * cp * gx + cy * gy + sy * sp * gz;
let bz = -sp * gx + cp * gz;
```

Then recover body roll and pitch:

```ts
let bodyRoll = Math.asin(bx) * 180 / Math.PI;
let bodyPitch = Math.atan2(by, bz) * 180 / Math.PI;
```

Depending on your sign convention, you may need:

```ts
bodyPitch = -Math.atan2(by, bz) * 180 / Math.PI;
```

or use transpose/inverse rotation.

## Simpler small-angle approximation

For small head pitch and small body tilt, the approximate matrix-expanded relationship is:

```text
bodyRoll  ≈ headRoll * cos(yaw) + headPitch * sin(yaw)
bodyPitch ≈ headPitch * cos(yaw) - headRoll * sin(yaw) - servoPitch
```

So a better approximation than current code might be:

```ts
this.bodyRoll =
    bd_p * Math.sin(servo_yaw) +
    this.rl * Math.cos(servo_yaw);

this.bodyPitch =
    bd_p * Math.cos(servo_yaw) -
    this.rl * Math.sin(servo_yaw) -
    servo_pitch * 180 / Math.PI;
```

But note: your `bd_p` already partially compensates pitch using:

```ts
let bd_p = this.pth + (
    this.pr.stateTargets[0][5] +
    this.pr.servoTrim[5] -
    this.pr.servoTarget[5]
);
```

That means pitch compensation is already happening in degrees before the yaw rotation.

## Recommendation

For your current codebase, the existing equation is a valid **2D yaw compensation**:

```ts
bodyRoll  = headPitch * sin(yaw) + headRoll * cos(yaw)
bodyPitch = headPitch * cos(yaw) - headRoll * sin(yaw)
```

If you want full transform-matrix correctness, use the gravity-vector method:

```ts
g_body = Rz(yaw) * Ry(pitch) * g_head
```

then recover:

```ts
bodyRoll = asin(g_body.x)
bodyPitch = atan2(g_body.y, g_body.z)
```

The important thing is to decide whether your `servo_yaw` / `servo_pitch` matrix maps **head to body** or **body to head**. If the signs look reversed on the robot, use the inverse matrix:

```ts
g_body = Ry(-pitch) * Rz(-yaw) * g_head
```


# Short answer

**Yes, your current code is correct for the simplified model it is using.**

This code:

```ts
let bd_p = this.pth + (this.pr.stateTargets[0][5] + this.pr.servoTrim[5] - this.pr.servoTarget[5]);
let servo_yaw = (this.pr.servoTarget[4] - this.pr.stateTargets[0][4] - this.pr.servoTrim[4]) * (Math.PI / 180);

this.bodyRoll = bd_p * Math.sin(servo_yaw) + this.rl * Math.cos(servo_yaw);
this.bodyPitch = bd_p * Math.cos(servo_yaw) - this.rl * Math.sin(servo_yaw);
```

is a valid **yaw-rotation transform** from head-frame pitch/roll into body-frame pitch/roll.

## Why it is correct

You are treating:

```ts
bd_p
```

as the head pitch already corrected for head pitch servo angle.

Then you rotate the pair:

```text
[headPitchCorrected, headRoll]
```

by the head yaw angle.

The matrix is:

```text
bodyRoll  = headPitch * sin(yaw) + headRoll * cos(yaw)
bodyPitch = headPitch * cos(yaw) - headRoll * sin(yaw)
```

Your code matches that.

## About `servo_pitch`

Since you already include pitch compensation here:

```ts
let bd_p = this.pth + (
    this.pr.stateTargets[0][5] +
    this.pr.servoTrim[5] -
    this.pr.servoTarget[5]
);
```

you do **not** need `servo_pitch` separately in the current 2D yaw-rotation approach.

So commenting this out is fine:

```ts
// let servo_pitch = ...
```

## Important limitation

This is correct as a **small-angle / practical robot-control approximation**.

It is not a full 3D gravity-vector transform. But for balance correction on a small robot, this approach is reasonable and likely easier to tune.

## Summary

- **Current code:** correct for yaw-compensated pitch/roll transform.
- **Pitch servo compensation:** already included in `bd_p`.
- **Commenting out `servo_pitch`:** okay.
- **Full matrix transform:** only needed if you want more exact 3D orientation math.