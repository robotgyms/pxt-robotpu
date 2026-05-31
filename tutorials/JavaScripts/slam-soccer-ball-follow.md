# Follow a soccer ball with the Smart Hat camera

This tutorial shows how to use the Robot PU Smart Hat camera to detect, track, and follow a soccer ball.

The Smart Hat runs the vision model on its ESP32 camera board. The micro:bit reads detection packets over I2C, turns the robot head toward the ball, and walks forward while correcting its heading.

The demo program can be downloaded from https://makecode.microbit.org/S55741-05105-61572-94579

---

## What you will build

By the end of this tutorial, Robot PU will:

- **Enable the Smart Hat camera services**: Image capture and soccer ball detection are turned on over I2C.
- **Read ball detections**: Each packet reports object type, detection status, ball position, box size, yaw error, and pitch error.
- **Move the head toward the ball**: The head yaw and pitch servos use the camera error to keep the ball centered.
- **Walk toward the ball**: The robot walks forward based on ball distance and turns based on camera yaw error.
- **Search when the ball is lost**: The head scans a small pattern until the camera sees the ball again.

---

## Hardware setup

- **Robot PU** with a micro:bit controller.
- **Smart Hat camera** connected to the I2C multiplexer.
- **Soccer ball** or an object that the Smart Hat soccer-ball model can recognize.
- **Clear floor area** so the robot can walk safely.

Place the ball in front of the robot before starting. Good lighting helps the camera detect the ball more reliably.

---

## How the Smart Hat camera is used

The Smart Hat camera board is controlled through I2C.

- **`MUX_ADDR = 112`**: Selects the I2C multiplexer channel for the Smart Hat.
- **`ESP32_ADDR = 66`**: I2C address of the ESP32 camera board.
- **`CMD_SERVICE_ENABLE = 8`**: Command used to turn camera services on or off.
- **`SERVICE_IMAGE_CAPTURE = 2`**: Enables image capture.
- **`SERVICE_SOCCER_BALL_DETECTION = 4`**: Enables the soccer-ball detector.
- **`SERVICE_SOCCER_GOAL_DETECTION = 5`**: Enables the soccer-goal detector for later soccer behaviors.

The tutorial starts image capture with `setService(SERVICE_IMAGE_CAPTURE, true)`. It also refreshes soccer detection periodically with `setSoccerDetection(true)` and disables face detection so soccer packets are prioritized. When `DEBUG_FLAG` is `true`, Wi-Fi is enabled so you can inspect camera behavior if your Smart Hat firmware provides a web view. Button A enables Wi-Fi manually, and Button B disables it.

Before reading camera packets, the program writes `15` to `MUX_ADDR`. This selects the Smart Hat path on the I2C multiplexer so the micro:bit can communicate with the ESP32 camera board.

---

## Detection packet format

Each camera packet is `18` bytes long.

- **Byte 0**: Object type. `4` means soccer ball, `5` means soccer goal.
- **Byte 1**: Packet version.
- **Byte 2**: Sequence number.
- **Byte 3**: Status flags such as `valid`, `stale`, `capture`, `web`, and `sleep`.
- **Byte 4**: Number of detected objects.
- **Byte 5**: Detection score.
- **Bytes 6-7**: Ball `x` position in millimeters.
- **Bytes 8-9**: Ball `y` position in millimeters.
- **Bytes 10-11**: Ball `z` position in millimeters.
- **Bytes 12-13**: Bounding box width.
- **Bytes 14-15**: Bounding box height.
- **Byte 16**: Yaw error, signed 8-bit.
- **Byte 17**: Pitch error, signed 8-bit.

The helper functions `i16`, `u16`, and `i8` convert packet bytes into signed or unsigned numbers.

In this tutorial, `x_mm` is treated as the left/right offset of the ball and `y_mm` is treated as the forward distance to the ball. The simple follower uses `x_mm`, `y_mm`, `yaw`, and `pitch`; the packet also contains `z_mm`, bounding box width, and bounding box height for debugging or future behaviors.

---

## Ball tracking behavior

The main loop reads one packet from the Smart Hat every `20 ms` with `pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)`.

If the packet contains a soccer ball and `count > 0`, `trackBall` does three things.

- **Remember the last detection time**: `lastBallSeenTime` is updated so the robot knows the ball was recently visible.
- **Center the camera**: The head yaw and pitch targets are adjusted from the camera yaw and pitch errors.
- **Walk toward the ball**: The robot walks forward using the measured ball distance and turns using the yaw error.

The walking command is `robotPu.walk(Math.max(-3, Math.min(3, (y_mm - 100) * 0.015)), Math.max(-1, Math.min(1, yaw * -0.05)))`. Here, `y_mm` is the forward distance to the ball. The `-100` offset keeps the robot from trying to drive all the way into the ball. The `Math.max` and `Math.min` calls clamp forward speed and turn speed to safe ranges. The yaw term turns the robot left or right so the ball stays near the center of the camera view.

---

## Head control

The camera gives yaw and pitch errors, not absolute servo angles. The code adds a small correction to the current head target with `robotPu.servoStep`.

The gain `0.08` controls how aggressively the head moves toward the ball.

- **If the head moves too slowly**: Increase the gain slightly.
- **If the head shakes or overshoots**: Decrease the gain.
- **If the camera loses the ball often**: Slow the walking speed or improve lighting.

---

## Lost-ball recovery

The robot handles missing detections in two stages.

- **Recent loss**: If the ball was seen recently, yaw and pitch errors decay with `yaw *= 0.7` and `pitch *= 0.7`, and the head keeps moving in the last known direction.
- **Long loss**: If the ball has been missing for more than `LOST_TIMEOUT_MS`, the robot calls `searchBall(SEARCH_PATTERN)`.

The search pattern moves the head through several yaw and pitch offsets. Each time the full pattern completes, `search_gain` grows up to `4`, making the search wider.

---

## Soccer goal packets

The code enables both soccer-ball and soccer-goal detection. This tutorial only follows the ball, so goal packets are ignored by `trackBall`.

For a kicking behavior, use goal packets together with ball packets to plan where the robot should stand behind the ball before kicking.

---

## Testing steps

- **Start safely**: Put Robot PU on a flat floor with space in front of it.
- **Place the ball**: Put the ball within the Smart Hat camera view.
- **Download the program**: Flash the MakeCode project to the micro:bit.
- **Watch initialization**: The micro:bit displays `I` while the camera services start.
- **Open serial output**: Confirm ball `x` and `y` messages are printing when `DEBUG_FLAG` is `true`.
- **Move the ball slowly**: The head should turn to keep the ball centered.
- **Let the robot walk**: The robot should move toward the ball and turn when the ball is off-center.
- **Hide the ball**: The head should continue briefly, then begin the search pattern.

---

## Tuning guide

- **Forward speed**: Tune `(y_mm - 100) * 0.015` if the robot walks too fast or too slowly.
- **Turn speed**: Tune `yaw * -0.05` if the robot turns too sharply, not enough, or in the wrong direction.
- **Head tracking gain**: Tune `yaw * 0.08` and `pitch * 0.08`.
- **Search timing**: Tune `SCAN_WAIT_FRAMES` to make each search position shorter or longer.
- **Lost timeout**: Tune `LOST_TIMEOUT_MS` to choose how long the robot keeps following the last known ball direction.
- **Debug output**: Set `DEBUG_FLAG` to `false` after tuning to reduce serial traffic.

---

## Troubleshooting

- **No I2C packets**: Check Smart Hat power, I2C wiring, the multiplexer address, and the `pins.i2cWriteNumber(MUX_ADDR, 15, ...)` setup call.
- **Ball is not detected**: Improve lighting, move the ball into the camera view, and use a ball that matches the trained soccer-ball model.
- **Head oscillates**: Reduce the head tracking gain from `0.08` to a smaller value.
- **Robot turns too sharply**: Reduce the turn gain in `yaw * -0.05`.
- **Robot walks too fast**: Reduce the forward gain in `(y_mm - 100) * 0.015`.
- **Robot loses the ball while walking**: Slow the robot down, increase `LOST_TIMEOUT_MS`, or make the search pattern wider.

---

## Next steps

After the robot can follow the ball reliably, extend this tutorial by using soccer-goal detections. With both ball and goal positions, the robot can plan a kick point behind the ball and approach it from the correct direction.

---

## Validated MakeCode

```typescript

/**
 * RobotPU soccer: follow ball
 * Turn off face detection. Turn on soccer ball detection and goal detection.
 * Use I2C to communicate with ESP32, poll detection results.
 * If ball is detected, follow it. if not detected, search for ball.
 */
// Parse Unsigned Char
function i8(v: number) {
    return v >= 128 ? v - 256 : v
}
// Event status to string
function flagsText(f: number) {
    let s = ""
    if (f & VALID) {
        s = "" + s + " valid"
    }
    if (f & STALE) {
        s = "" + s + " stale"
    }
    if (f & CAPTURE) {
        s = "" + s + " capture"
    }
    if (f & WEB) {
        s = "" + s + " web"
    }
    if (f & SLEEP) {
        s = "" + s + " sleep"
    }
    return s.length > 0 ? s.trim() : "none"
}
function setService(serviceId: number, enabled: boolean) {
    pins.i2cWriteBuffer(ESP32_ADDR, Buffer.fromArray([CMD_SERVICE_ENABLE, serviceId, enabled ? 1 : 0]), false)
}

function setSoccerDetection(enabled: boolean) {
    setService(SERVICE_SOCCER_BALL_DETECTION, enabled)
    basic.pause(10)
    setService(SERVICE_SOCCER_GOAL_DETECTION, enabled)
}

function searchBall(searchPattern: { y: number, p: number }[]) {
    yaw *= 0.5
    pitch *= 0.5

    if (scanFrameCounter > 0) {
        scanFrameCounter += -1
        const targetOffset = searchPattern[scanStepIndex]
        // if (DEBUG_FLAG) {
        //     serial.writeLine("" + (`yawSearch: ${targetOffset.y * search_gain}`))
        //     serial.writeLine("" + (`pitchSearch: ${targetOffset.p * search_gain}`))
        // }
        robotPu.setModeVar(robotPu.Mode.API)
        robotPu.servoStep(robotPu.ServoJoint.HeadYaw, currentYaw + targetOffset.y * search_gain, 1)
        robotPu.servoStep(robotPu.ServoJoint.HeadPitch, currentPitch + targetOffset.p * search_gain, 1)
        robotPu.leftEyeBright(0.002)
        robotPu.rightEyeBright(0.002)
        return
    }

    scanFrameCounter = SCAN_WAIT_FRAMES
    scanStepIndex += 1
    if (scanStepIndex >= SEARCH_PATTERN.length) {
        scanStepIndex = 0
        search_gain = Math.min(4, search_gain * 1.1)
    }
}

const MUX_ADDR = 112 // 0x70
const ESP32_ADDR = 66 // 0x42
const SIZE = 18

const SOCCER_BALL = 4
const CMD_SERVICE_ENABLE = 8
const SERVICE_WIFI = 1
const SERVICE_IMAGE_CAPTURE = 2
const SERVICE_FACE_DETECTION = 3
const SERVICE_SOCCER_BALL_DETECTION = 4
const SERVICE_SOCCER_GOAL_DETECTION = 5

const VALID = 1 << 0
const STALE = 1 << 1
const CAPTURE = 1 << 2
const WEB = 1 << 3
const SLEEP = 1 << 4

const SCAN_WAIT_FRAMES = 25
const LOST_TIMEOUT_MS = 6000
const DEBUG_FLAG = true

let scanStepIndex = 0
let scanFrameCounter = 0

let currentPitch = 0
let currentYaw = 0

let yaw = 0
let pitch = 0
let lastBallSeenTime = 0
let search_gain = 1

const SEARCH_PATTERN: { y: number, p: number }[] = [
    { y: 15, p: 0 },
    { y: -15, p: 0 },
    { y: -15, p: -10 },
    { y: 0, p: -10 },
    { y: 15, p: -10 },
    { y: 15, p: 3 },
    { y: 0, p: 3 },
    { y: -15, p: 3 },
    { y: -15, p: 0 },
    { y: 0, p: 0 }
]

robotPu.setChannel(166)
// set servo trim to help robot balancing
robotPu.setServoTrim(-7, 0, -7, 0, -9, 0)
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

input.onButtonPressed(Button.A, function () {
    setService(SERVICE_WIFI, true)
})
input.onButtonPressed(Button.B, function () {
    setService(SERVICE_WIFI, false)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // allow gamepad to trim servos to improve balancing
    robotPu.toggleServoTrim()
    basic.pause(500)
})
function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}

function trackBall(p: Buffer) {
    const currentTime = input.runningTime()

    if (p.length != SIZE) {
        serial.writeLine("bad length: " + p.length)
        return
    }

    let type = p[0]
    let count = p[4]

    if (type == SOCCER_BALL) {
        if (count > 0) {
            lastBallSeenTime = currentTime
            search_gain = 1.0
            let x_mm = i16(p, 6)
            let y_mm = i16(p, 8)
            // let z_mm = i16(p, 10)
            // let w = u16(p, 12)
            // let h = u16(p, 14)
            yaw = i8(p[16])
            pitch = i8(p[17])
            if (DEBUG_FLAG) {
                // serial.writeLine(`head yaw: ${robotPu.ServoTargets()[4]}`)
                //serial.writeLine(`yawLock ${yaw}`)
                // serial.writeLine(`head pitch: ${robotPu.ServoTargets()[5]}`)
                //serial.writeLine(`pitchLock: ${pitch}`)
                serial.writeLine(`ball x: ${x_mm}`)
                serial.writeLine(`ball y: ${y_mm}`)
            }
            // move head to look at the ball
            robotPu.setModeVar(robotPu.Mode.API)
            robotPu.servoStep(robotPu.ServoJoint.HeadYaw, robotPu.ServoTargets()[4] + yaw * 0.08, 8)
            robotPu.servoStep(robotPu.ServoJoint.HeadPitch, robotPu.ServoTargets()[5] + pitch * 0.08, 8)
            robotPu.leftEyeBright(0.01)
            robotPu.rightEyeBright(0.01)
            // walk toward the ball (simple demo: forward based on range, turn based on yaw)
            // Note: tune these gains for your field and camera.
            // to do: map y_mm to walk speed, map yaw to turn speed (clamp to -1, 1)
            // stop at 100mm away from the ball
            robotPu.walk(Math.max(-3, Math.min(3, (y_mm - 100) * 0.015)), Math.max(-1, Math.min(1, yaw * -0.05)))
            // cache head pitch/yaw
            currentYaw = robotPu.ServoTargets()[4]
            currentPitch = robotPu.ServoTargets()[5]
        } else if (currentTime - lastBallSeenTime < LOST_TIMEOUT_MS) {
            // follow through (decay)for a short moment if lost the ball in the view  
            yaw *= 0.7
            pitch *= 0.7
            robotPu.servoStep(robotPu.ServoJoint.HeadYaw, robotPu.ServoTargets()[4] + yaw * 0.2, 5)
            robotPu.servoStep(robotPu.ServoJoint.HeadPitch, robotPu.ServoTargets()[5] + pitch * 0.2, 5)
            // cache head pitch/yaw
            currentYaw = robotPu.ServoTargets()[4]
            currentPitch = robotPu.ServoTargets()[5]
        } else {
            // lost the ball, search for ball
            searchBall(SEARCH_PATTERN)
        }
    }
}
basic.showString("I")
pins.i2cWriteNumber(
    MUX_ADDR,
    15,
    NumberFormat.Int8LE,
    false
)
setService(SERVICE_IMAGE_CAPTURE, true)
basic.pause(10)

basic.forever(function () {
    setSoccerDetection(true)
    basic.pause(10)
    // turn off face detection
    setService(SERVICE_FACE_DETECTION, false)
    basic.pause(60000)
})

basic.pause(5000)

currentYaw = robotPu.ServoTargets()[4]
currentPitch = robotPu.ServoTargets()[5]

if (DEBUG_FLAG) {
    setService(SERVICE_WIFI, true)
} else {
    setService(SERVICE_WIFI, false)
}

basic.forever(function () {
    let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)
    if (packet.length == SIZE) {
        trackBall(packet)
    } else {
        serial.writeLine("i2c read error")
        basic.showIcon(IconNames.No)
    }
    basic.pause(20)
})
```