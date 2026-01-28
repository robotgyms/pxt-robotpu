# Task Allocation (Auction / Token Passing) for Robot PU

Multi-robot systems need a way to decide roles.

In ROS you might implement task allocation using a coordination framework. Here we implement a simple radio-based approach.

---

## Prerequisites

- Radio basics (`remote-control.md`, `event-pu.md`)

---

## Token passing (simplest)

- One robot holds a token => it is leader
- It can pass token to another robot

### Message format

- `token,<id>`

---

## Example: token leader election

```typescript
radio.setGroup(42)

const myId = control.deviceSerialNumber() % 100
let leaderId = -1
let lastTokenMs = 0

radio.onReceivedString(function (msg) {
    const p = msg.split(",")
    if (p.length != 2) return
    if (p[0] != "token") return

    leaderId = parseInt(p[1])
    lastTokenMs = control.millis()
})

function iAmLeader(): boolean {
    return leaderId == myId
}

basic.forever(function () {
    const now = control.millis()

    // If no leader seen, self-elect after a delay
    if (now - lastTokenMs > 4000 && leaderId == -1) {
        leaderId = myId
        radio.sendString("token," + myId)
        lastTokenMs = now
    }

    if (iAmLeader()) {
        robotPu.walk()
    } else {
        robotPu.rest()
    }

    basic.pause(100)
})
```

---

## Next steps

- Replace token with a bid auction: `bid,id,score`
- Use score signals (battery, distance to goal, sensor quality)
- Combine with formation (`formation-control-pu.md`)
