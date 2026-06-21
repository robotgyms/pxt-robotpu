# Telemetry + Logging (ROS-style topics) for Robot PU

This tutorial shows how to add **telemetry** to your Robot PU programs so you can observe robot state in real time.

In ROS you would publish data on topics like `/odom`, `/scan`, and `/diagnostics`. In MakeCode we can do something similar using **radio messages**.

---

## Prerequisites

- micro:bit + Robot PU
- A second micro:bit (optional but recommended) as a **base station**
- Add Robot PU extension in MakeCode

---

## What you will build

- A small **telemetry protocol** (key/value messages)
- A **publisher loop** (rate-limited)
- Optional: a **receiver** that prints / displays values

---

## Recommended message format

Use short keys and simple numeric values.

- `t,ms` : timestamp
- `d,cm` : sonar distance
- `s,0..100` : sound level
- `e,id` : emotion/state id

Example payloads:

- `d,23`
- `s,41`
- `e,2`

---

## Example: Robot publishes telemetry

Copy/paste into MakeCode JavaScript.

```typescript
radio.setGroup(42)

function txKV(key: string, value: number) {
    radio.sendString(key + "," + value)
}

let lastTx = 0
const TX_PERIOD_MS = 200

basic.forever(function () {
    const now = control.millis()

    if (now - lastTx >= TX_PERIOD_MS) {
        lastTx = now

        // Basic signals
        txKV("t", now)
        txKV("d", robotPuPro.sonarDistanceCm())
        txKV("s", input.soundLevel())

        // Example "state" (replace with your own state machine)
        const stateId = 0
        txKV("e", stateId)
    }

    basic.pause(20)
})
```

---

## Example: Base station receives telemetry

Flash this to a second micro:bit.

```typescript
radio.setGroup(42)

let lastD = -1
let lastS = -1

radio.onReceivedString(function (msg) {
    const parts = msg.split(",")
    if (parts.length != 2) return

    const key = parts[0]
    const value = parseInt(parts[1])

    if (key == "d") lastD = value
    if (key == "s") lastS = value

    // Simple visualization
    basic.clearScreen()
    if (lastD >= 0) {
        const bars = Math.constrain(Math.idiv(lastD, 10), 0, 5)
        for (let x = 0; x < bars; x++) led.plot(x, 4)
    }
    if (lastS >= 0 && lastS > 60) {
        led.plot(4, 0)
    }
})
```

---

## Tuning

- `TX_PERIOD_MS`
  - 100–300ms is a good range
- Keep message keys short
- Don’t transmit too many values too fast (radio can drop packets)

---

## Next steps

- Add more keys: battery, gait id, heading, fall count
- Create a structured prefix: `odom,x`, `odom,y`, `odom,th`
- Combine this with:
  - `base-station-dashboard-pu.md`
  - `safety-watchdog-pu.md`
