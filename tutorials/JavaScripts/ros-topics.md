# ROS Topics on micro:bit Robot PU

In ROS, a **topic** is a named data bus. Nodes can publish data to a topic, and other nodes can subscribe to it.

On Robot PU, the micro:bit **radio** is the closest thing to a topic bus. This tutorial shows how to use radio messages to imitate ROS topics.

---

## Prerequisites

- micro:bit + Robot PU
- Robot PU extension added in MakeCode
- Basic MakeCode JavaScript

---

## What you will build

A simple topic system with three roles:

- **Publisher** — sends data to a topic
- **Topic** — the radio channel + message format
- **Subscriber** — receives data and reacts

---

## ROS topic names on Robot PU

ROS uses names like `/scan`, `/odom`, and `/cmd_vel`. We can map them to radio message prefixes.

| ROS topic | Robot PU message | Data |
|-----------|------------------|------|
| `/scan` | `scan,cm` | sonar distance |
| `/odom` | `odom,deg` | compass heading |
| `/cmd_vel` | `cmd,forward` | motion command |
| `/diagnostics` | `diag,ok` | health status |

---

## Example: publish /scan

Flash this to the robot.

```typescript
radio.setGroup(42)

basic.forever(function () {
    let d = robotPuPro.sonarDistanceCm()
    radio.sendString("scan," + d)
    basic.pause(200)
})
```

## Example: subscribe to /scan

Flash this to a second micro:bit as a base station.

```typescript
radio.setGroup(42)

let distance = -1

radio.onReceivedString(function (msg) {
    let parts = msg.split(",")
    if (parts[0] == "scan") {
        distance = parseInt(parts[1])
        led.plotBarGraph(distance, 100)
    }
})
```

---

## Topic naming tips

- Keep topic names short to save radio bytes.
- Use one prefix per topic, for example `scan`, `odom`, `cmd`, `diag`.
- Use `key,value` format for numeric data.

---

## How to test

1. Flash the publisher to Robot PU.
2. Flash the subscriber to a base-station micro:bit.
3. Move your hand in front of the robot. The base station LED graph should change.

---

## Next steps

- **Read cmd-vel-topic.md**: Learn the command velocity topic.
- **Read diagnostics-topic.md**: Learn robot health reporting.
- **Read telemetry-logging-pu.md**: Learn a rate-limited telemetry protocol.
