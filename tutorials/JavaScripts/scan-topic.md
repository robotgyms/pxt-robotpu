# ROS /scan Topic on Robot PU

In ROS, `/scan` is a topic that carries sensor data from a LiDAR or sonar. It usually returns a set of distance readings.

Robot PU has a sonar sensor. This tutorial shows how to publish sonar data as a `/scan` topic.

---

## Prerequisites

- micro:bit + Robot PU
- Robot PU extension added in MakeCode
- Basic MakeCode JavaScript

---

## What you will build

A program that publishes the sonar distance as a `scan` topic. A base station can subscribe and show the distance on the LED matrix.

---

## /scan message format

Use a simple `scan,value` message, where `value` is the distance in centimeters.

For a single forward-facing sonar, one number is enough. If you add a servo to sweep the sensor, you can send multiple angles as `scan,angle,distance`.

---

## Example: publisher

```typescript
radio.setGroup(42)

basic.forever(function () {
    let d = robotPuPro.sonarDistanceCm()
    if (d >= 0) {
        radio.sendString("scan," + d)
    }
    basic.pause(100)
})
```

## Example: subscriber with obstacle alarm

```typescript
radio.setGroup(42)

let lastDistance = 100

radio.onReceivedString(function (msg) {
    let parts = msg.split(",")
    if (parts[0] == "scan") {
        lastDistance = parseInt(parts[1])
    }
})

basic.forever(function () {
    led.plotBarGraph(lastDistance, 100)
    if (lastDistance < 15) {
        basic.showIcon(IconNames.No)
    }
    basic.pause(100)
})
```

---

## How to test

1. Flash the publisher to Robot PU.
2. Flash the subscriber to a base station micro:bit.
3. Move your hand toward the sonar. The LED graph should shrink and the alarm icon should appear.

---

## Next steps

- **Read cmd-vel-topic.md**: Use the scan to stop the robot before a crash.
- **Read occupancy-grid-pu.md**: Build a simple map from scan data.
