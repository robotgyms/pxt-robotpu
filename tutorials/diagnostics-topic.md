# ROS /diagnostics Topic on Robot PU

In ROS, `/diagnostics` reports the health of the robot: battery, sensors, motors, and software state.

This tutorial shows how to publish a simple `/diagnostics` topic from Robot PU so a base station can watch for problems.

---

## Prerequisites

- micro:bit + Robot PU
- Robot PU extension added in MakeCode
- Basic MakeCode JavaScript

---

## What you will build

A diagnostics publisher that sends:

- Heartbeat counter
- Sonar status
- Compass heading
- Motor command that is currently running

A base station subscriber that shows alarms if something is wrong.

---

## /diagnostics message format

Use a short key/value format:

- `diag,ok` — everything is fine
- `diag,warn,sonar` — sonar reading is bad
- `diag,err,compass` — compass failed

You can also publish periodic numeric diagnostics:

- `diag,hb,123` — heartbeat count
- `diag,sonar,42` — sonar distance
- `diag,heading,180` — compass heading

---

## Example: diagnostics publisher

```typescript
radio.setGroup(42)

let heartbeat = 0

basic.forever(function () {
    let d = robotPuPro.sonarDistanceCm()
    let h = input.compassHeading()

    if (d < 0) {
        radio.sendString("diag,err,sonar")
    } else if (d < 10) {
        radio.sendString("diag,warn,sonar")
    } else {
        radio.sendString("diag,ok")
    }

    radio.sendString("diag,hb," + heartbeat)
    radio.sendString("diag,sonar," + d)
    radio.sendString("diag,heading," + h)

    heartbeat += 1
    basic.pause(500)
})
```

## Example: base station health monitor

```typescript
radio.setGroup(42)

let lastHeartbeat = 0
let lastUpdate = input.runningTime()

radio.onReceivedString(function (msg) {
    let parts = msg.split(",")
    if (parts[0] == "diag") {
        if (parts[1] == "hb") {
            lastHeartbeat = parseInt(parts[2])
            lastUpdate = input.runningTime()
        }
        if (parts[1] == "ok") {
            basic.showIcon(IconNames.Yes)
        } else if (parts[1] == "warn") {
            basic.showIcon(IconNames.Surprised)
        } else if (parts[1] == "err") {
            basic.showIcon(IconNames.No)
        }
    }
})

basic.forever(function () {
    if (input.runningTime() - lastUpdate > 2000) {
        basic.showIcon(IconNames.No)
    }
    basic.pause(500)
})
```

---

## How to test

1. Flash the publisher to Robot PU.
2. Flash the subscriber to a base station micro:bit.
3. Cover the sonar or tilt the robot. The icon should change from Yes to Surprised or No.

---

## Next steps

- **Read telemetry-logging-pu.md**: Learn more general telemetry patterns.
- **Read safety-watchdog-pu.md**: Combine diagnostics with an emergency stop.
