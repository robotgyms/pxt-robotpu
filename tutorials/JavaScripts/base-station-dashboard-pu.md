# Base Station Dashboard (ROS-style visualization) for Robot PU

This tutorial builds a simple **base station** using a second micro:bit.

In ROS you might use `rqt_plot` or RViz. Here we’ll:

- receive telemetry over **radio**
- show key signals on the 5x5 LED matrix
- optionally beep on alarms

---

## Prerequisites

- `telemetry-logging-pu.md`
- A second micro:bit

---

## What you will build

- A receiver that parses `key,value` messages
- A compact visualization for:
  - sonar distance
  - heading
  - state id
  - safety alarms

---

## Base station program

Flash this to the base-station micro:bit.

```typescript
radio.setGroup(42)

let dCm = -1
let heading = -1
let stateId = -1

function clamp5(x: number): number {
    return Math.constrain(x, 0, 4)
}

radio.onReceivedString(function (msg) {
    const parts = msg.split(",")
    if (parts.length != 2) return

    const key = parts[0]
    const value = parseInt(parts[1])

    if (key == "d") dCm = value
    if (key == "h") heading = value
    if (key == "e") stateId = value

    // Render
    basic.clearScreen()

    // Distance as bar on bottom row
    if (dCm >= 0) {
        const bars = clamp5(Math.idiv(dCm, 10))
        for (let x = 0; x < bars; x++) led.plot(x, 4)
    }

    // Heading as a dot (0..360 mapped to x)
    if (heading >= 0) {
        const x = clamp5(Math.idiv(heading * 5, 360))
        led.plot(x, 2)
    }

    // State id as a dot (0..4 mapped to y)
    if (stateId >= 0) {
        const y = clamp5(stateId)
        led.plot(4, y)
    }

    // Alarm indicator
    if (dCm > 0 && dCm < 12) {
        led.plot(4, 0)
        music.playTone(988, 30)
    }
})
```

---

## Next steps

- Receive and display `(x,y)` from `odometry-pu.md`
- Display safety state from `safety-watchdog-pu.md`
- Expand to a “topic browser” using button presses
