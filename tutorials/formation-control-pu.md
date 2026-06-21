# Formation Control (Follow-the-leader 2.0) for Robot PU

This tutorial builds a simple formation behavior.

In ROS you might have each robot run a controller that tries to maintain a desired relative position.

Here we simplify:

- leader broadcasts a speed/turn command
- followers apply it with local safety overrides

---

## Prerequisites

- `decision-engine-pu.md` patterns
- `safety-watchdog-pu.md` (recommended)

---

## Leader: broadcast commands

```typescript
radio.setGroup(42)

basic.forever(function () {
    // Toy command: walk forward
    radio.sendString("cmd,walk")
    robotPuPro.walk()
    basic.pause(150)
})
```

---

## Follower: receive + apply with safety

```typescript
radio.setGroup(42)

let cmd = ""

radio.onReceivedString(function (msg) {
    const p = msg.split(",")
    if (p.length != 2) return
    if (p[0] != "cmd") return
    cmd = p[1]
})

basic.forever(function () {
    const d = robotPuPro.sonarDistanceCm()

    // Local safety override
    if (d > 0 && d < 12) {
        robotPuPro.back()
        basic.pause(120)
        return
    }

    if (cmd == "walk") robotPuPro.walk()
    else if (cmd == "left") robotPuPro.left()
    else if (cmd == "right") robotPuPro.right()
    else robotPuPro.rest()

    basic.pause(40)
})
```

---

## Next steps

- Send numeric commands: speed + turn rate
- Add heartbeat timeout (stop if leader is silent)
- Add role assignment using `task-allocation-pu.md`
