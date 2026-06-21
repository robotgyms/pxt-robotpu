# ROS Nodes on micro:bit Robot PU

In full ROS, a **node** is a separate program that runs one part of the robot stack, such as sensing, planning, or safety. A micro:bit cannot run a real Linux process for every node, but the **node idea is still useful** as a way to think about roles.

This tutorial shows how to split a Robot PU program into clear **node roles** that match the ROS pattern.

---

## Prerequisites

- micro:bit + Robot PU
- Robot PU extension added in MakeCode
- Basic MakeCode JavaScript (`basic.forever`, `radio`, events)

---

## What you will build

One program that contains four logical node roles:

- **Perception node** — reads sonar and camera data
- **Planner node** — decides the next goal
- **Controller node** — sends motor commands
- **Safety node** — watches for crashes and stops the robot

Because these are roles, they live in the same MakeCode project, but each role has its own variables and loop.

---

## ROS-style node diagram

```text
Robot PU program
├── Perception node  →  reads /scan, /odom
├── Planner node     →  publishes /goal
├── Controller node  →  publishes /cmd_vel
└── Safety node      →  publishes /estop
```

On a real robot, each box could be a separate process. On micro:bit we keep them in one program and use **radio messages** like ROS topics.

---

## Example: four node roles in one program

```typescript
radio.setGroup(42)

// --- shared data ---
let obstacleDistance = 100
let heading = 0
let goalDistance = 0
let isStopped = false

// --- Perception node ---
basic.forever(function () {
    obstacleDistance = robotPuPro.sonarDistanceCm()
    heading = robotPuPro.compassHeading()
    radio.sendString("scan," + obstacleDistance)
    radio.sendString("odom," + heading)
    basic.pause(200)
})

// --- Planner node ---
basic.forever(function () {
    if (obstacleDistance < 20) {
        goalDistance = 0
    } else {
        goalDistance = 30
    }
    radio.sendString("goal," + goalDistance)
    basic.pause(200)
})

// --- Controller node ---
basic.forever(function () {
    if (isStopped) {
        robotPuPro.stopAllMotors()
    } else if (goalDistance > 0) {
        robotPuPro.moveStraight(50)
    } else {
        robotPuPro.stopAllMotors()
    }
    radio.sendString("cmd,straight")
    basic.pause(100)
})

// --- Safety node ---
basic.forever(function () {
    if (obstacleDistance < 10) {
        isStopped = true
        robotPuPro.stopAllMotors()
        radio.sendString("estop,1")
    } else {
        isStopped = false
    }
    basic.pause(50)
})
```

---

## How to test

1. Flash the program to Robot PU.
2. Open a second micro:bit as a base station with the same radio group.
3. Watch the radio messages. You should see `scan`, `odom`, `goal`, `cmd`, and possibly `estop`.
4. Move your hand close to the sonar. The robot should stop and send `estop,1`.

---

## Next steps

- **Split into separate programs**: Make each node role a standalone program and run them on different micro:bits.
- **Add topic filtering**: Use a `topic` prefix so each listener only reacts to its own messages.
- **Read telemetry-logging-pu.md**: Learn a more robust key/value message format.
