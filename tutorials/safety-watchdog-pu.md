# Safety Watchdog + E-Stop (ROS-style safety layer)

Robots should always have a **safety layer** that overrides normal behavior.

In ROS this might be a dedicated node that monitors timeouts and emergency conditions. In MakeCode we can do the same with:

- timeouts (`control.millis()`)
- simple hazard signals (sonar distance, free-fall)
- an explicit **E-stop** command over radio

---

## Prerequisites

- Robot PU extension
- Optional: second micro:bit as controller (radio E-stop)

---

## What you will build

- A watchdog that stops motion if:
  - **no command** received recently
  - **obstacle too close**
  - **free fall** detected
  - **E-stop** active

---

## Robot-side safety layer

```typescript
radio.setGroup(42)

let lastCmdMs = 0
let estop = false

// Example controller messages:
//   "go"  -> allow movement
//   "stop"-> E-stop
radio.onReceivedString(function (msg) {
    if (msg == "stop") {
        estop = true
    } else if (msg == "go") {
        estop = false
        lastCmdMs = control.millis()
    }
})

function safetyStop(reasonId: number) {
    robotPuPro.rest()
    robotPuPro.leftEyeBright(0)
    robotPuPro.rightEyeBright(0)
}

const CMD_TIMEOUT_MS = 1500
const DANGER_CM = 12

basic.forever(function () {
    const now = control.millis()
    const d = robotPuPro.sonarDistanceCm()

    const cmdTimedOut = now - lastCmdMs > CMD_TIMEOUT_MS
    const tooClose = d > 0 && d < DANGER_CM
    const falling = input.isGesture(Gesture.FreeFall)

    if (estop || cmdTimedOut || tooClose || falling) {
        safetyStop(0)
        basic.pause(50)
        return
    }

    // Normal behavior goes here
    robotPuPro.walkDo(2, 0)
    basic.pause(20)
})
```

---

## Controller-side E-stop (optional)

```typescript
radio.setGroup(42)

input.onButtonPressed(Button.A, function () {
    radio.sendString("go")
})

input.onButtonPressed(Button.B, function () {
    radio.sendString("stop")
})

basic.forever(function () {
    // Keep-alive: optional
    basic.pause(200)
})
```

---

## Tuning

- `CMD_TIMEOUT_MS`
  - shorter is safer, longer is more tolerant of packet loss
- `DANGER_CM`
  - increase if the robot doesn’t stop in time

---

## Next steps

- Add a buzzer / sound alert on E-stop
- Publish safety state using `telemetry-logging-pu.md`
- Add recovery actions (back up, turn) in `fault-recovery-pu.md`
