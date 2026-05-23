 
# 🎥 Robot PU: Polling Smart Camera (I2C) for Face Detection
 
This tutorial shows how to:
 
1. Poll a **smart camera / ESP32 vision module** over **I2C**.
2. Read **face detection packets** (including yaw/pitch offsets from the camera).
3. Implement a **Search → Trace** behavior:
   - **Search**: scan head yaw/pitch in a pattern until a face is found.
   - **Trace**: once a face is detected, keep the face centered by adjusting head yaw/pitch.
 
The code below is written for MakeCode JavaScript and assumes the camera is connected through an **I2C multiplexer** and an ESP32-based vision board.
 
---
 
## Key idea: Polling the camera via I2C
 
The robot loops continuously and calls:
 
- `pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)` to fetch the latest detection result packet.
 
Then it parses the packet and decides whether to:
 
- **Track** (if a face exists now)
- **Hold lock briefly** (if the face disappeared only momentarily)
- **Search** (if the face has been lost for too long)
 
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
let WAKE = 2
let VOICE = 3
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
// 搜索状态与步进常量定义
// 每次移动后静止等待的帧数（2帧约250ms，完美避开运动模糊）
let SCAN_WAIT_FRAMES = 25
// 当前扫描到了第几步
let search_gain = 1
// 新增：时间控制常量与变量
// 1分钟 = 60000毫秒
let LOST_TIMEOUT_MS = 6000

/**
 * 帧计数器
 */
let scanStepIndex = 0
let targetOffset = 0
let currentPitch = 0
let currentYaw = 0
let scanFrameCounter = 0
// Event Types
let IDLE = 0
let yaw = 0
let pitch = 0
let DEBUG_FLAG = true
// 记录最后一次看见人脸的系统时间戳（毫秒）
let lastFaceSeenTime = 0
let SEARCH_PATTERN = [
    { y: 15, p: 0 },
    // 向右看
    { y: -15, p: 0 },
    // 向左看
    { y: -15, p: -10 },
    // 向左看，抬头
    { y: 0, p: -10 },
    // 回正，抬头
    { y: 15, p: -10 },
    // 向右看，抬头
    { y: 15, p: 3 },
    // 向右看，微微低头
    { y: 0, p: 3 },
    // 回正，低头
    { y: -15, p: 3 },
    // 向左看，低头
    { y: -15, p: 0 },
    // 向左看，
    { y: 0, p: 0 }
]

function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}
robotPu.setServoTrim(
    -5,
    0,
    -5,
    0,
    -8,
    0
)

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
// 记录最后一次看见人脸的系统时间戳（毫秒）
function searchFace() {
    yaw *= 0.5
    pitch *= 0.5
    // 2. 状态机：判断当前是否正处于"移动后的静止观察期"
    if (scanFrameCounter > 0) {
        // 递减等待帧数，
        scanFrameCounter += -1
        // 4. 获取当前步骤的检索目标相对偏移量
        let targetOffset = SEARCH_PATTERN[scanStepIndex]
        if (DEBUG_FLAG) {
            serial.writeLine("" + (`yawSearch: ${targetOffset.y * search_gain}`))
            serial.writeLine("" + (`pitchSearch: ${targetOffset.p * search_gain}`))
        }
        robotPu.setModeVar(robotPu.Mode.API)
        robotPu.servoStep(robotPu.ServoJoint.HeadYaw, currentYaw + targetOffset.y * search_gain, 1)
        robotPu.servoStep(robotPu.ServoJoint.HeadPitch, currentPitch + targetOffset.p * search_gain, 1)
        robotPu.leftEyeBright(0.002)
        robotPu.rightEyeBright(0.002)
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
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

robotPu.setChannel(164)

function trackFace(p: Buffer) {
    // 1. 获取当前系统时间（MakeCode 环境通常使用 input.runningTime()）
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
                // serial.writeLine(`head yaw: ${robotPu.ServoTargets()[4]}`)
                serial.writeLine(`yawLock ${yaw}`)
                // serial.writeLine(`head pitch: ${robotPu.ServoTargets()[5]}`)
                serial.writeLine(`pitchLock: ${pitch}`)
            }
            robotPu.setModeVar(robotPu.Mode.API)
            robotPu.servoStep(robotPu.ServoJoint.HeadYaw, robotPu.ServoTargets()[4] + yaw * 0.08, 8)
            robotPu.servoStep(robotPu.ServoJoint.HeadPitch, robotPu.ServoTargets()[5] + pitch * 0.08, 8)
            robotPu.leftEyeBright(0.01)
            robotPu.rightEyeBright(0.01)
        } else if (currentTime - lastFaceSeenTime < LOST_TIMEOUT_MS) {
            // lock on face 
            yaw *= 0.7
            pitch *= 0.7
            robotPu.servoStep(robotPu.ServoJoint.HeadYaw, robotPu.ServoTargets()[4] + yaw * 0.2, 5)
            robotPu.servoStep(robotPu.ServoJoint.HeadPitch, robotPu.ServoTargets()[5] + pitch * 0.2, 5)
            // 3. 读取当前头部的绝对目标角度
            currentYaw = robotPu.ServoTargets()[4]
            currentPitch = robotPu.ServoTargets()[5]
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
// 3. 读取当前头部的绝对目标角度
currentYaw = robotPu.ServoTargets()[4]
currentPitch = robotPu.ServoTargets()[5]

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
- uses `robotPu.servoStep(...)` on head yaw/pitch to reduce the camera-provided `yaw` / `pitch` offsets

That’s the “trace” behavior.

### 4) Short lock mode (face briefly lost)

If `count == 0` but the face was seen recently (`currentTime - lastFaceSeenTime < LOST_TIMEOUT_MS`), the robot keeps turning in the last known direction a bit, to re-acquire the target.

### 5) Search mode (face lost)

If the face has been gone longer than `LOST_TIMEOUT_MS`, the robot runs `searchFace()`:

- it iterates through `SEARCH_PATTERN`
- moves head yaw/pitch to each waypoint
- waits `SCAN_WAIT_FRAMES` between steps (helps avoid motion blur)

This creates a repeatable scan pattern that expands over time using `search_gain`.


