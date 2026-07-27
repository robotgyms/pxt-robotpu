 
# Search for and track a face with the Smart Hat camera
 
This tutorial shows how to use the Robot PU Smart Hat camera to search for a face and keep it centered in the camera view.
 
The Smart Hat runs face detection on its ESP32 camera board. The micro:bit polls the camera over I2C, reads face detection packets, and moves the Robot PU head yaw and pitch servos to follow the face.
 
By the end of this tutorial, Robot PU will:

- **Enable Smart Hat services**: Image capture and face detection are enabled over I2C.
- **Read face packets**: Each packet reports object type, detection status, face position, bounding box size, yaw error, and pitch error.
- **Search for a face**: The head scans through a yaw/pitch pattern when no face is visible.
- **Track a face**: The head uses camera yaw and pitch errors to keep the face centered.
- **Hold lock briefly**: If the face disappears for a short time, the head continues in the last known direction before searching again.

---

## Hardware setup

- **Robot PU** with a micro:bit controller.
- **Smart Hat camera** connected through the I2C multiplexer.
- **A person or face image** in front of the camera.
- **Good lighting** so the face detector can see facial features clearly.

Place the robot on a stable surface before testing. The program moves only the head, but keeping the robot stable makes the camera output easier to debug.
 
---
 
## Key idea: Search then trace
 
The robot loops continuously and calls `pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)` to fetch the latest detection packet.
 
Then it parses the packet and chooses one behavior:
 
- **Trace**: If a face exists now, move the head toward it.
- **Hold lock briefly**: If the face disappeared only momentarily, keep following the last known error.
- **Search**: If the face has been lost for too long, scan the head through a search pattern.
 
---
 
## Smart Hat camera services
 
The Smart Hat camera board is controlled through I2C.
 
- **`MUX_ADDR = 112`**: I2C multiplexer address.
- **`ESP32_ADDR = 66`**: ESP32 camera board address.
- **`CMD_SERVICE_ENABLE = 8`**: Command used to enable or disable camera services.
- **`SERVICE_IMAGE_CAPTURE = 2`**: Enables camera capture.
- **`SERVICE_FACE_DETECTION = 3`**: Enables face detection.
 
Before reading camera packets, the program writes `15` to `MUX_ADDR`. This selects the Smart Hat path on the I2C multiplexer so the micro:bit can communicate with the ESP32 camera board.
 
When `DEBUG_FLAG` is `true`, Wi-Fi is enabled so you can inspect Smart Hat behavior if your firmware provides a web view.
 
---
 
## Detection packet format
 
Each camera packet is `18` bytes long.
 
- **Byte 0**: Object type. `1` means face.
- **Byte 1**: Packet version.
- **Byte 2**: Sequence number.
- **Byte 3**: Status flags such as `valid`, `stale`, `capture`, `web`, and `sleep`.
- **Byte 4**: Number of detected faces.
- **Byte 5**: Detection score.
- **Bytes 6-7**: Face `x` position in millimeters.
- **Bytes 8-9**: Face `y` position in millimeters.
- **Bytes 10-11**: Face `z` position in millimeters.
- **Bytes 12-13**: Bounding box width.
- **Bytes 14-15**: Bounding box height.
- **Byte 16**: Yaw error, signed 8-bit.
- **Byte 17**: Pitch error, signed 8-bit.
 
The simple face tracker mainly uses `count`, `yaw`, and `pitch`. The code still parses position and bounding box fields so you can print or use them later.
 
---
 
## Full program (Search then Trace)
 
```typescript
// Address
// 0x70
let MUX_ADDR = 112
// 0x42
let ESP32_ADDR = 66
let SIZE = 18
let FACE = 1
let SOCCER_BALL = 4
let SOCCER_GOAL = 5
let CMD_SERVICE_ENABLE = 8
let SERVICE_WIFI = 1
let SERVICE_IMAGE_CAPTURE = 2
let SERVICE_FACE_DETECTION = 3
let SERVICE_SOCCER_BALL_DETECTION = 4
let SERVICE_SOCCER_GOAL_DETECTION = 5
const VALID = 1 << 0
const STALE = 1 << 1
const CAPTURE = 1 << 2
const WEB = 1 << 3
const SLEEP = 1 << 4
// Search state and step constants
// Number of frames to wait after each head movement to reduce motion blur
let SCAN_WAIT_FRAMES = 25
// Current scan step
let search_gain = 1
// Timeout constants and variables
let LOST_TIMEOUT_MS = 6000

/**
 * Frame counter
 */
let scanStepIndex = 0
let currentPitch = 0
let currentYaw = 0
let scanFrameCounter = 0
let yaw = 0
let pitch = 0
let DEBUG_FLAG = true
// Last time a face was seen, in milliseconds
let lastFaceSeenTime = 0
let SEARCH_PATTERN = [
    { y: 15, p: 0 },
    // look right
    { y: -15, p: 0 },
    // look left
    { y: -15, p: -10 },
    // look left and up
    { y: 0, p: -10 },
    // look center and up
    { y: 15, p: -10 },
    // look right and up
    { y: 15, p: 3 },
    // look right and slightly down
    { y: 0, p: 3 },
    // look center and down
    { y: -15, p: 3 },
    // look left and down
    { y: -15, p: 0 },
    // look left
    { y: 0, p: 0 }
]

function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}
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
function searchFace() {
    yaw *= 0.5
    pitch *= 0.5
    // State machine: check whether the head is in the wait-after-move period
    if (scanFrameCounter > 0) {
        // Decrease the number of frames left to wait
        scanFrameCounter += -1
        // Get the relative target offset for the current search step
        let targetOffset = SEARCH_PATTERN[scanStepIndex]
        if (DEBUG_FLAG) {
            serial.writeLine("" + (`yawSearch: ${targetOffset.y * search_gain}`))
            serial.writeLine("" + (`pitchSearch: ${targetOffset.p * search_gain}`))
        }
        robotPuPro.setMode(robotPuPro.Mode.API)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, currentYaw + targetOffset.y * search_gain, 1)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, currentPitch + targetOffset.p * search_gain, 1)
        robotPuPro.leftEyeBright(0.002)
        robotPuPro.rightEyeBright(0.002)
    } else {
        scanFrameCounter = SCAN_WAIT_FRAMES
        scanStepIndex += 1
        if (scanStepIndex >= SEARCH_PATTERN.length) {
            scanStepIndex = 0
            search_gain *= 1.1
            search_gain = Math.min(4, search_gain)
        }
    }
}
radio.onReceivedString(function (receivedString) {
    robotPuPro.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPuPro.runKeyValueCommand(name, value)
})

robotPuPro.setChannel(164)

function trackFace(p: Buffer) {
    // Get the current system time
    let currentTime = input.runningTime();

    if (p.length != SIZE) {
        serial.writeLine("bad length: " + p.length)
        return
    }

    let type = p[0]
    let ver = p[1]
    let seq = p[2]
    let flags = p[3]
    let count = p[4]
    let score = p[5]
    
    if (type == FACE) {
        if (DEBUG_FLAG) {
            serial.writeLine(`type=${type} flag=${flagsText(flags)} objects=${count} score=${score}`)
        }
        if (count > 0) {
            lastFaceSeenTime = currentTime
            search_gain = 1.0
            let x_mm = i16(p, 6)
            let y_mm = i16(p, 8)
            let z_mm = i16(p, 10)
            let w = u16(p, 12)
            let h = u16(p, 14)
            yaw = i8(p[16])
            pitch = i8(p[17])
            if (DEBUG_FLAG) {
                // serial.writeLine(`head yaw: ${robotPuPro.servoTargets()[4]}`)
                serial.writeLine(`yawLock ${yaw}`)
                // serial.writeLine(`head pitch: ${robotPuPro.servoTargets()[5]}`)
                serial.writeLine(`pitchLock: ${pitch}`)
            }
            robotPuPro.setMode(robotPuPro.Mode.API)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, robotPuPro.servoTargets()[4] + yaw * 0.08, 8)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, robotPuPro.servoTargets()[5] + pitch * 0.08, 8)
            robotPuPro.leftEyeBright(0.01)
            robotPuPro.rightEyeBright(0.01)
        } else if (currentTime - lastFaceSeenTime < LOST_TIMEOUT_MS) {
            // lock on face 
            yaw *= 0.7
            pitch *= 0.7
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, robotPuPro.servoTargets()[4] + yaw * 0.2, 5)
            robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, robotPuPro.servoTargets()[5] + pitch * 0.2, 5)
            // Read the current absolute head target angles
            currentYaw = robotPuPro.servoTargets()[4]
            currentPitch = robotPuPro.servoTargets()[5]
        } else {
            // lost the face, search for face
            searchFace()
        }
    }
}
function setService(serviceId: number, enabled: boolean) {
    pins.i2cWriteBuffer(ESP32_ADDR, Buffer.fromArray([CMD_SERVICE_ENABLE, serviceId, enabled ? 1 : 0]), false)
}
function setSoccerDetection(enabled: boolean) {
    setService(SERVICE_SOCCER_BALL_DETECTION, enabled)
    basic.pause(10)
    setService(SERVICE_SOCCER_GOAL_DETECTION, enabled)
}

basic.showString("I")
pins.i2cWriteNumber(
    MUX_ADDR,
    15,
    NumberFormat.Int8LE,
    false
)
basic.pause(3000)
// Read the current absolute head target angles
currentYaw = robotPuPro.servoTargets()[4]
currentPitch = robotPuPro.servoTargets()[5]

basic.forever(function () {
    if (DEBUG_FLAG) {
        setService(SERVICE_WIFI, true)
    } else {
        setService(SERVICE_WIFI, false)
    }
    basic.pause(10)
    setService(SERVICE_IMAGE_CAPTURE, true)
    basic.pause(10)
    setService(SERVICE_FACE_DETECTION, true)
    basic.pause(10)
    setSoccerDetection(false)
    basic.pause(30000)
})

basic.forever(function () {
    let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)
    if (packet.length == SIZE) {
        trackFace(packet)
    } else {
        serial.writeLine("i2c read error")
        basic.showIcon(IconNames.No)
    }
    basic.pause(20)
})

```

---

## How it works (what to focus on)

### 1) Enabling camera services

The camera/ESP32 module supports multiple “services” (WiFi, capture, face detection, etc.). The helper:

- `setService(serviceId, enabled)`

sends an I2C command to toggle each service.

### 2) Packet format and parsing

Each I2C read returns a fixed-size packet (`SIZE = 18`). For face packets (`type == FACE`), the code reads:

- `count`: number of faces detected
- `yaw` / `pitch`: signed offsets that indicate how far the face is from the center

The helpers `i16`, `u16`, and `i8` decode signed/unsigned values from the raw `Buffer`.

### 3) Trace mode (face detected)

When `count > 0`, the code:

- records `lastFaceSeenTime`
- uses `robotPuPro.servoStep(...)` on head yaw/pitch to reduce the camera-provided `yaw` / `pitch` offsets

That’s the “trace” behavior.

### 4) Short lock mode (face briefly lost)

If `count == 0` but the face was seen recently (`currentTime - lastFaceSeenTime < LOST_TIMEOUT_MS`), the robot keeps turning in the last known direction a bit, to re-acquire the target.

### 5) Search mode (face lost)

If the face has been gone longer than `LOST_TIMEOUT_MS`, the robot runs `searchFace()`:

- it iterates through `SEARCH_PATTERN`
- moves head yaw/pitch to each waypoint
- waits `SCAN_WAIT_FRAMES` between steps (helps avoid motion blur)

This creates a repeatable scan pattern that expands over time using `search_gain`.

---

## Testing steps

- **Start safely**: Put Robot PU on a stable surface.
- **Download the program**: Flash the MakeCode project to the micro:bit.
- **Watch initialization**: The micro:bit displays `I` while the Smart Hat path is selected.
- **Open serial output**: Confirm that packet status, `yawLock`, and `pitchLock` messages appear when `DEBUG_FLAG` is `true`.
- **Stand in front of the camera**: The head should turn until your face is centered.
- **Move slowly left and right**: The head yaw should follow your face.
- **Move slightly up and down**: The head pitch should follow your face.
- **Step out of view**: The robot should hold the last direction briefly, then begin the search pattern.

---

## Tuning guide

- **Head tracking gain**: Tune `yaw * 0.08` and `pitch * 0.08` if the head moves too slowly or overshoots.
- **Short-lock gain**: Tune `yaw * 0.2` and `pitch * 0.2` if the head moves too much after briefly losing the face.
- **Search timing**: Tune `SCAN_WAIT_FRAMES` to make each search position shorter or longer.
- **Lost timeout**: Tune `LOST_TIMEOUT_MS` to choose how long the robot keeps following the last known face direction before searching.
- **Search width**: Tune the `SEARCH_PATTERN` offsets or the maximum `search_gain` value if the scan is too narrow or too wide.
- **Debug output**: Set `DEBUG_FLAG` to `false` after tuning to reduce serial traffic.

---

## Troubleshooting

- **No I2C packets**: Check Smart Hat power, I2C wiring, the multiplexer address, and the `pins.i2cWriteNumber(MUX_ADDR, 15, ...)` setup call.
- **Face is not detected**: Improve lighting, face the camera directly, and move closer to the Smart Hat.
- **Head moves the wrong way**: Reverse the sign of the yaw or pitch correction if your camera firmware reports the opposite direction.
- **Head oscillates**: Reduce the tracking gain from `0.08` to a smaller value.
- **Search pattern is too slow**: Decrease `SCAN_WAIT_FRAMES`.
- **Search pattern is too fast or blurry**: Increase `SCAN_WAIT_FRAMES`.
- **Serial output is noisy**: Turn off debug mode by setting `DEBUG_FLAG` to `false`.


