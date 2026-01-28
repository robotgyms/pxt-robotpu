# OOP + event handlers: a clean smart-follower for Robot PU

This tutorial shows how to structure a Robot PU **swarm follower** using:

- Object‑Oriented Programming (OOP)
- The event handler pattern
- The micro:bit event system: `control.raiseEvent()` + `control.onEvent()`

The goal is code that’s easier to understand, extend, and debug than a single “giant” `basic.forever()`.

## What you will build

A follower robot that:

- receives leader `heading` + `speed` over radio
- computes a steering command (forward + turn)
- overrides the leader command when obstacles are close
- stops safely if the leader signal disappears

## Prerequisites

- Robot PU extension available (you will use `robotPu.walk()` and `robotPu.frontDistanceArray()`)
- All robots use the same `radio` group
- Compass calibrated (leader and followers)

## Design overview

We split responsibilities into small classes:

- `RadioFollower`
  - parses incoming `heading` + `speed` messages
  - raises events for the follower to react to

- `NavigationController`
  - computes a steering command (forward + turn) based on leader `heading`

- `ObstacleAvoidance`
  - monitors sonar and raises events for obstacles

- `SmartFollower`
  - reacts to events and drives the robot

## Event IDs

We use the micro:bit event system.

```typescript
const EVT_FOLLOWER = 7001
const EVT_UPDATE = 1
const EVT_AVOID = 2
const EVT_EMERGENCY = 3
const EVT_TIMEOUT = 4
```

## RadioFollower Class

Responsible for receiving and parsing `heading` + `speed` messages.

```typescript
class RadioFollower {
    heading: number = 0
    speed: number = 0
    lastRxMs: number = 0

    constructor() {
        radio.onReceivedString(msg => {
            let parts = msg.split(",")
            if (parts.length == 2) {
                this.heading = parseInt(parts[0])
                this.speed = parseInt(parts[1])
                this.lastRxMs = control.millis()
                control.raiseEvent(EVT_FOLLOWER, EVT_UPDATE)
            }
        })
    }
}
```

## NavigationController Class

Computes a steering command (forward + turn) based on leader `heading`.

```typescript
class NavigationController {

    computeTurn(targetHeading: number): number {
        let myHeading = input.compassHeading()
        let err = targetHeading - myHeading

        if (err > 180) err -= 360
        if (err < -180) err += 360

        let turn = err / 90
        if (turn > 1) turn = 1
        if (turn < -1) turn = -1

        return turn
    }

    computeSpeed(targetSpeed: number): number {
        return targetSpeed / 50
    }
}
```

## ObstacleAvoidance Class

Monitors sonar and raises events for obstacles.

```typescript
class ObstacleAvoidance {
    EMERGENCY = 10
    AVOID = 20
    private mode: number = 0

    constructor() {
        basic.forever(() => {
            let d = robotPu.frontDistanceArray()[2]

            let nextMode = 0
            if (d > 0 && d < this.EMERGENCY) nextMode = EVT_EMERGENCY
            else if (d > 0 && d < this.AVOID) nextMode = EVT_AVOID

            // Only raise when state changes to avoid spamming events.
            if (nextMode != this.mode) {
                this.mode = nextMode
                if (this.mode != 0) control.raiseEvent(EVT_FOLLOWER, this.mode)
                else control.raiseEvent(EVT_FOLLOWER, EVT_UPDATE)
            }

            basic.pause(50)
        })
    }
}
```

## SmartFollower Class (Main Robot)

Reacts to events and drives the robot.

```typescript
class SmartFollower {
    radio: RadioFollower
    nav: NavigationController
    private lastCmdMs: number = 0
    private TIMEOUT_MS = 800

    constructor(r: RadioFollower, n: NavigationController) {
        this.radio = r
        this.nav = n

        control.onEvent(EVT_FOLLOWER, EVT_UPDATE, () => this.followLeader())
        control.onEvent(EVT_FOLLOWER, EVT_AVOID, () => this.avoidObstacle())
        control.onEvent(EVT_FOLLOWER, EVT_EMERGENCY, () => this.emergencyStop())

        basic.forever(() => {
            // Stop safely if we haven't heard from the leader recently.
            if (control.millis() - this.radio.lastRxMs > this.TIMEOUT_MS) {
                this.timeoutStop()
            }
            basic.pause(50)
        })
    }

    followLeader() {
        this.lastCmdMs = control.millis()
        let fwd = this.nav.computeSpeed(this.radio.speed)
        let turn = this.nav.computeTurn(this.radio.heading)
        robotPu.walk(fwd, turn)
    }

    avoidObstacle() {
        robotPu.walk(1.0, 0.9)
    }

    emergencyStop() {
        robotPu.walk(0, 0)
        basic.showIcon(IconNames.No)
    }

    timeoutStop() {
        robotPu.walk(0, 0)
    }
}
```

## Putting It All Together

```typescript
radio.setGroup(42)

let radioFollower = new RadioFollower()
let nav = new NavigationController()
let avoid = new ObstacleAvoidance()
let follower = new SmartFollower(radioFollower, nav)
```

## Leader broadcaster (for testing)

Use this on the leader Robot PU (or a dedicated controller micro:bit). It broadcasts `heading,speed`.

```typescript
radio.setGroup(42)

basic.forever(function () {
    let heading = input.compassHeading()
    let speed = robotPu.joystickY()
    radio.sendString(heading + "," + speed)
    basic.pause(80)
})
```

## Tuning and pitfalls

- **Event spam**
  - If you raise events every loop, you can starve the system.
  - This tutorial uses `mode` changes + `basic.pause(50)` to keep it stable.

- **Compass stability**
  - Calibrate and avoid magnets/metal.
  - If the follower oscillates, reduce the gain in `computeTurn()` (change `err / 90` to `err / 110`).

- **Radio timeout**
  - If you want the follower to stop sooner/later when the leader disappears, adjust `TIMEOUT_MS`.

That’s it — the follower now runs cleanly, modularly, and event‑driven.

## What You Just Built

You now have a professional‑grade swarm follower:

- Object‑oriented
  Each responsibility is isolated in its own class.

- Event‑driven
  No giant forever() loop doing everything.

- Clean separation of concerns
  Radio parsing
  Navigation math
  Obstacle avoidance
  Robot movement

- Easy to extend
  You can add:

  - formation control
  - spacing rules
  - smoother avoidance
  - filtering
  - logging
  …without touching the core logic.