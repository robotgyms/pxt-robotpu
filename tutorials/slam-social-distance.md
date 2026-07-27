# Keep a 1 meter social distance with CogniCap

Robot PU can use the **CogniCap Smart Hat** to detect a human face, keep the face centered, and maintain a comfortable distance. In this tutorial, PU aims to keep approximately **1 meter (1000 mm)** from the person:

- When the face is **too far away**, PU turns toward it and walks forward.
- When the face is **too close**, PU walks backward.
- When the face is within the comfort zone, PU stops.
- When no face is visible, PU stops and scans with its head.
- With **pxt-billy**, PU says short status messages such as “I am coming closer” and “Please give me some space.”

> **Safety first:** Test on an open, level floor. Keep hands, feet, stairs, edges, and obstacles away from the robot. Hold or lift Robot PU before flashing or stopping a program. This project uses the camera distance estimate; it is not a safety sensor and cannot replace supervision.

---

## What you need

- Robot PU with a **micro:bit V2**.
- CogniCap / Smart Hat camera connected through the I2C multiplexer.
- The Robot PU MakeCode extension.
- The [`pxt-billy`](https://github.com/adamish/pxt-billy) extension for synthesized speech.
- Good lighting and one person standing in front of the camera.

### Add the extensions

1. Open [MakeCode for micro:bit](https://makecode.microbit.org/).
2. Add the Robot PU extension: `robotgyms/pxt-robotpu`.
3. Add the Billy speech extension using: `https://github.com/adamish/pxt-billy`.
4. Open the **JavaScript** editor and paste the program below.

---

## How it works

CogniCap sends an 18-byte face-detection packet over I2C. The program uses:

- `count` to determine whether a face is detected.
- `y_mm` as the camera's forward face-range estimate in millimeters.
- `yaw` to turn PU and move its head so the face stays centered.
- `STALE` to ignore an old detection result.

The target distance is `1000` mm. A `150` mm tolerance creates a comfortable stop zone from **850 mm to 1150 mm**, so the robot does not constantly switch between forward and backward movement.

---

## Complete program

```typescript
const MUX_ADDR = 112
const COGNICAP_ADDR = 66
const PACKET_SIZE = 18

const FACE = 1
const CMD_SERVICE_ENABLE = 8
const SERVICE_IMAGE_CAPTURE = 2
const SERVICE_FACE_DETECTION = 3
const STALE = 1 << 1

const TARGET_DISTANCE_MM = 1000
const DISTANCE_TOLERANCE_MM = 150
const FACE_LOST_TIMEOUT_MS = 1000
const SPEECH_COOLDOWN_MS = 3000

let faceDistanceMm = 0
let faceYaw = 0
let lastFaceSeenMs = 0
let behavior = "searching"
let lastSpokenBehavior = ""
let lastSpokenMs = 0

function i8(value: number): number {
    return value >= 128 ? value - 256 : value
}

function i16(packet: Buffer, offset: number): number {
    let value = packet[offset] | (packet[offset + 1] << 8)
    return value >= 32768 ? value - 65536 : value
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value))
}

function setService(serviceId: number, enabled: boolean) {
    pins.i2cWriteBuffer(
        COGNICAP_ADDR,
        Buffer.fromArray([CMD_SERVICE_ENABLE, serviceId, enabled ? 1 : 0]),
        false
    )
}

function sayBehavior(nextBehavior: string) {
    let now = input.runningTime()
    if (nextBehavior == lastSpokenBehavior && now - lastSpokenMs < SPEECH_COOLDOWN_MS) {
        return
    }

    lastSpokenBehavior = nextBehavior
    lastSpokenMs = now

    if (nextBehavior == "approaching") {
        billy.say("I am coming closer")
    } else if (nextBehavior == "backing up") {
        billy.say("Please give me some space")
    } else if (nextBehavior == "comfortable") {
        billy.say("This distance is good")
    } else if (nextBehavior == "searching") {
        billy.say("Where are you")
    }
}

function readFacePacket() {
    let packet = pins.i2cReadBuffer(COGNICAP_ADDR, PACKET_SIZE, false)
    if (packet.length != PACKET_SIZE) {
        return
    }

    let type = packet[0]
    let flags = packet[3]
    let count = packet[4]

    if (type == FACE && count > 0 && !(flags & STALE)) {
        faceDistanceMm = i16(packet, 8)
        faceYaw = i8(packet[16])
        lastFaceSeenMs = input.runningTime()

        robotPuPro.setMode(robotPuPro.Mode.API)
        robotPuPro.servoStep(
            robotPuPro.ServoJoint.HeadYaw,
            robotPuPro.servoTargets()[4] + faceYaw * 0.08,
            6
        )
    }
}

function updateMotion() {
    let faceIsRecent = input.runningTime() - lastFaceSeenMs < FACE_LOST_TIMEOUT_MS
    let speed = 0
    let turn = 0

    if (!faceIsRecent) {
        behavior = "searching"
        robotPuPro.setMode(robotPuPro.Mode.API)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, 75, 2)
        robotPuPro.leftEyeBright(0.002)
        robotPuPro.rightEyeBright(0.002)
    } else {
        turn = clamp(-faceYaw * 0.04, -0.6, 0.6)
        robotPuPro.leftEyeBright(0.02)
        robotPuPro.rightEyeBright(0.02)

        if (faceDistanceMm > TARGET_DISTANCE_MM + DISTANCE_TOLERANCE_MM) {
            behavior = "approaching"
            speed = clamp((faceDistanceMm - TARGET_DISTANCE_MM) / 200, 1, 3)
        } else if (faceDistanceMm < TARGET_DISTANCE_MM - DISTANCE_TOLERANCE_MM) {
            behavior = "backing up"
            speed = clamp((faceDistanceMm - TARGET_DISTANCE_MM) / 200, -3, -1)
        } else {
            behavior = "comfortable"
        }
    }

    robotPuPro.walk(speed, turn)
    sayBehavior(behavior)
}

billy.voicePreset(BillyVoicePreset.Robot)
billy.say("I will keep one meter away from you")

pins.i2cWriteNumber(MUX_ADDR, 15, NumberFormat.Int8LE, false)
basic.pause(2000)
setService(SERVICE_IMAGE_CAPTURE, true)
basic.pause(20)
setService(SERVICE_FACE_DETECTION, true)

basic.forever(function () {
    readFacePacket()
    basic.pause(20)
})

basic.forever(function () {
    updateMotion()
    basic.pause(20)
})
```

---

## Test the robot

1. **Start safely.** Place PU on an open floor, with the camera pointing forward.
2. **Flash the project.** The robot says that it will keep one meter away.
3. **Stand about 1 meter away.** PU should face you and stop after announcing that the distance is good.
4. **Move farther away.** Beyond about 1.15 m, PU should turn toward your face and walk forward.
5. **Move closer.** Inside about 0.85 m, PU should walk backward and ask for space.
6. **Leave the camera view.** Within one second, PU should stop and slowly return its head toward center to search.

---

## Tuning the social-distance behavior

| Setting | Default | Change it when |
| --- | ---: | --- |
| `TARGET_DISTANCE_MM` | `1000` | You want a different target distance. |
| `DISTANCE_TOLERANCE_MM` | `150` | PU changes direction too often; increase it for a larger stop zone. |
| `FACE_LOST_TIMEOUT_MS` | `1000` | PU stops too quickly or continues moving too long after losing a face. |
| Forward/backward speed limits | `1` to `3` | PU moves too slowly or too quickly. Keep speeds low while testing. |
| `faceYaw * 0.04` | `0.04` | PU turns too weakly or turns too sharply. |

CogniCap's face range is an estimate. Compare its behavior to a tape-measure distance and adjust `TARGET_DISTANCE_MM` if the measured 1 m position does not fall inside PU's stop zone.

---

## Troubleshooting

- **PU never detects a face:** Confirm that the Smart Hat has power, I2C is connected, the camera faces forward, and lighting is adequate.
- **PU moves in the wrong direction:** Confirm that `faceDistanceMm = i16(packet, 8)` is the forward range for your CogniCap firmware. If your firmware provides range in a different packet field, update that line.
- **PU turns away from the face:** Reverse the turn expression by changing `-faceYaw * 0.04` to `faceYaw * 0.04`.
- **PU talks too often:** Increase `SPEECH_COOLDOWN_MS`.
- **PU does not stop when a face disappears:** Reduce `FACE_LOST_TIMEOUT_MS`; also test with a clear path and stay ready to lift the robot.
- **Billy does not speak:** Check that `pxt-billy` is installed and that you are using a micro:bit V2 with audio enabled.

---

## Next steps

- Add an ultrasonic-sensor safety stop before calling `robotPuPro.walk(...)`.
- Use `robotPuPro.talk(...)` instead of Billy for RoboVoice-style musical speech.
- Add a search pattern that pans the head left and right after the face has been lost.
- Send face range and behavior state to the serial console for graphing and calibration.
