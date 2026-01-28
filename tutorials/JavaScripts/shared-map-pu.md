# Shared Mapping (Multi-robot occupancy grid) for Robot PU

This tutorial shares occupancy data across robots.

In ROS this resembles multi-robot mapping systems.

---

## Prerequisites

- `occupancy-grid-pu.md`
- `telemetry-logging-pu.md` radio patterns

---

## Message format

Transmit only small updates to save bandwidth:

- `m,x,y,v`
  - `x,y` cell location
  - `v` cell value (0 unknown, 1 free, 2 occupied)

Example: `m,4,6,2`

---

## Example: publish cell updates

```typescript
radio.setGroup(42)

function sendCell(x: number, y: number, v: number) {
    radio.sendString("m," + x + "," + y + "," + v)
}

// Call sendCell(...) whenever you update a cell locally.
```

---

## Example: receive and merge

```typescript
radio.setGroup(42)

const W = 9
const H = 9
let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}

radio.onReceivedString(function (msg) {
    const p = msg.split(",")
    if (p.length != 4) return
    if (p[0] != "m") return

    const x = parseInt(p[1])
    const y = parseInt(p[2])
    const v = parseInt(p[3])

    if (x < 0 || x >= W || y < 0 || y >= H) return

    // Merge rule: occupied wins over free, free wins over unknown
    const cur = grid[idx(x, y)]
    if (v > cur) grid[idx(x, y)] = v
})
```

---

## Next steps

- Add robot IDs to reduce conflicts: `m,id,x,y,v`
- Send a checksum/epoch to detect stale maps
