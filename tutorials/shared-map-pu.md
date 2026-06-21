# Shared Mapping: Multi-Robot Occupancy Grid for Robot PU

In this tutorial, multiple Robot PU robots share small **occupancy-grid cell updates** over micro:bit radio. Each robot builds a local map from its own sensors, broadcasts the cells it has updated, and merges cells received from other robots.

In ROS, this idea is similar to multi-robot mapping systems that exchange map updates, poses, or landmarks. In MakeCode, we keep the idea simple and practical:

- **Each robot owns a tiny grid**.
- **Each cell stores a simple occupancy label**.
- **Robots send only changed cells**, not the entire map.
- **Received cells are merged** into the local copy of the map.

By the end, you will understand how to design a small radio protocol for shared mapping and how to combine map evidence from more than one robot.

---

## Prerequisites

- **Occupancy grid basics**: [`occupancy-grid-pu.md`](https://github.com/robotgyms/pxt-robotpu/blob/main/tutorials/occupancy-grid-pu.md)
- **Radio telemetry patterns**: [`telemetry-logging-pu.md`](https://github.com/robotgyms/pxt-robotpu/blob/main/tutorials/telemetry-logging-pu.md)
- **Optional radio event patterns**: [`event-pu.md`](https://github.com/robotgyms/pxt-robotpu/blob/main/tutorials/event-pu.md)

Hardware:

- **Two or more Robot PU robots**, or one Robot PU plus one base-station micro:bit.
- **All devices on the same radio group**.
- **A shared coordinate agreement**, explained below.

---

## Why share maps?

One robot only sees a small part of the world. A second robot may see a different obstacle, wall, or free path. Shared mapping lets the group combine partial observations.

Example:

- **Robot A** sees an obstacle at cell `(6, 4)`.
- **Robot B** confirms free space at cell `(2, 5)`.
- **Both robots** merge the updates and get a better map than either robot had alone.

This is useful for:

- **Multi-robot exploration**.
- **Shared obstacle avoidance**.
- **Base-station visualization**.
- **Team games**, where one robot can tell another where it saw a target or obstacle.

---

## Important assumption: shared grid frame

The examples in this tutorial assume every robot agrees on the same grid coordinates:

- **Same grid size**: `W = 9`, `H = 9`.
- **Same cell meaning**: `0` unknown, `1` free, `2` occupied.
- **Same origin and orientation**.

For a classroom demo, you can start with a simple shared frame:

- Put the robots on the same mat.
- Point them in the same starting direction.
- Treat grid cell `(4, 4)` as the starting area.

This is not full SLAM yet. Real multi-robot mapping also needs robot poses, coordinate transforms, and loop-closure logic. Here we focus on the core communication and merge idea.

---

## Grid representation

We use a flat array to store a `9 x 9` grid:

```typescript
const W = 9
const H = 9

let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}
```

Cell values:

- **`0`**: Unknown.
- **`1`**: Free.
- **`2`**: Occupied.

The flat index is:

```typescript
index = y * W + x
```

So cell `(4, 6)` is stored at:

```typescript
grid[6 * W + 4]
```

---

## Radio message design

Radio bandwidth is limited, so do not send the full grid every loop. Instead, send only cells that changed.

Basic message:

```text
m,x,y,v
```

Fields:

- **`m`**: Message type, short for map.
- **`x`**: Cell column.
- **`y`**: Cell row.
- **`v`**: Cell value.

Example:

```text
m,4,6,2
```

This means:

- Cell `(4, 6)` is now `2`.
- `2` means occupied.

---

## Better message design with robot ID

When several robots transmit, include a robot ID:

```text
m,id,x,y,v
```

Example:

```text
m,2,4,6,2
```

This means:

- Robot `2` reports cell `(4, 6)` as occupied.

Robot IDs help you:

- Ignore your own echo if needed.
- Debug which robot reported a cell.
- Add trust or priority rules later.

---

## Merge rules

When a robot receives a cell update, it must decide whether to overwrite the current value.

This tutorial uses a simple priority rule:

```text
occupied > free > unknown
```

In numeric form:

- `2` occupied wins over `1` free.
- `1` free wins over `0` unknown.
- `0` unknown does not erase stronger evidence.

This rule is simple and safe for obstacle avoidance because an obstacle report is treated as important.

However, it can be too conservative: if one robot reports an obstacle by mistake, the cell may stay occupied. Later extensions can use probabilities or timestamps to solve that.

---

## Example 1: publish cell updates

Use this helper on each robot. Call `sendCell(...)` when your local map updates a cell.

```typescript
radio.setGroup(42)

const ROBOT_ID = 1

function sendCell(x: number, y: number, v: number) {
    radio.sendString("m," + ROBOT_ID + "," + x + "," + y + "," + v)
}
```

Example usage:

```typescript
sendCell(4, 6, 2)
```

This broadcasts:

```text
m,1,4,6,2
```

---

## Example 2: receive and merge updates

This program receives shared-map updates and merges them into a local grid.

```typescript
radio.setGroup(42)

const MY_ID = 2
const W = 9
const H = 9

let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}

function inGrid(x: number, y: number): boolean {
    return x >= 0 && x < W && y >= 0 && y < H
}

function mergeCell(x: number, y: number, v: number) {
    if (!inGrid(x, y)) return
    if (v < 0 || v > 2) return

    const k = idx(x, y)
    const cur = grid[k]
    if (v > cur) grid[k] = v
}

radio.onReceivedString(function (msg) {
    const p = msg.split(",")
    if (p.length != 5) return
    if (p[0] != "m") return

    const senderId = parseInt(p[1])
    const x = parseInt(p[2])
    const y = parseInt(p[3])
    const v = parseInt(p[4])

    if (senderId == MY_ID) return
    mergeCell(x, y, v)
})
```

---

## Example 3: publish from a local occupancy update

This example combines a tiny sonar mapping pattern with shared map publishing. The robot marks its center cell as free. If sonar sees a close obstacle, it marks the cell in front as occupied and broadcasts both updates.

```typescript
radio.setGroup(42)

const ROBOT_ID = 1
const W = 9
const H = 9
const CX = 4
const CY = 4
const DANGER_CM = 20

let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}

function inGrid(x: number, y: number): boolean {
    return x >= 0 && x < W && y >= 0 && y < H
}

function sendCell(x: number, y: number, v: number) {
    radio.sendString("m," + ROBOT_ID + "," + x + "," + y + "," + v)
}

function setCellLocal(x: number, y: number, v: number) {
    if (!inGrid(x, y)) return
    const k = idx(x, y)
    if (grid[k] == v) return
    grid[k] = v
    sendCell(x, y, v)
}

basic.forever(function () {
    const d = robotPuPro.sonarDistanceCm()
    const heading = input.compassHeading()

    let dx = 0
    let dy = 0
    if (heading < 45 || heading >= 315) {
        dx = 0
        dy = -1
    } else if (heading < 135) {
        dx = 1
        dy = 0
    } else if (heading < 225) {
        dx = 0
        dy = 1
    } else {
        dx = -1
        dy = 0
    }

    setCellLocal(CX, CY, 1)

    if (d > 0 && d < DANGER_CM) {
        setCellLocal(CX + dx, CY + dy, 2)
        robotPuPro.back()
    } else {
        robotPuPro.walk()
    }

    basic.pause(100)
})
```

---

## Example 4: base-station viewer

Flash this to a second micro:bit. It receives map cells and displays a `5 x 5` window centered on the grid.

```typescript
radio.setGroup(42)

const W = 9
const H = 9
const VIEW = 5
const VIEW_CENTER_X = 4
const VIEW_CENTER_Y = 4

let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(0)

function idx(x: number, y: number): number {
    return y * W + x
}

function inGrid(x: number, y: number): boolean {
    return x >= 0 && x < W && y >= 0 && y < H
}

function drawMap() {
    basic.clearScreen()
    for (let yy = 0; yy < VIEW; yy++) {
        for (let xx = 0; xx < VIEW; xx++) {
            const gx = VIEW_CENTER_X + xx - 2
            const gy = VIEW_CENTER_Y + yy - 2
            if (!inGrid(gx, gy)) continue

            const v = grid[idx(gx, gy)]
            if (v == 1) led.plotBrightness(xx, yy, 40)
            if (v == 2) led.plotBrightness(xx, yy, 255)
        }
    }
}

radio.onReceivedString(function (msg) {
    const p = msg.split(",")
    if (p.length != 5) return
    if (p[0] != "m") return

    const x = parseInt(p[2])
    const y = parseInt(p[3])
    const v = parseInt(p[4])

    if (!inGrid(x, y)) return
    if (v < 0 || v > 2) return

    const k = idx(x, y)
    if (v > grid[k]) grid[k] = v
    drawMap()
})

drawMap()
```

Brightness meaning:

- **Off**: Unknown.
- **Dim**: Free.
- **Bright**: Occupied.

---

## Testing procedure

1. **Choose a radio group**
   - Use the same `radio.setGroup(...)` value on all devices.

2. **Assign unique robot IDs**
   - Robot A: `ROBOT_ID = 1`
   - Robot B: `ROBOT_ID = 2`
   - Base station does not need to publish map updates.

3. **Test one sender first**
   - Hard-code `sendCell(4, 4, 2)` and confirm the base station shows the cell.

4. **Test two senders**
   - Robot A sends one occupied cell.
   - Robot B sends a different occupied cell.
   - The base station should show both.

5. **Add sensor updates**
   - Connect the publishing helper to the occupancy-grid update.

6. **Slow down transmission**
   - If messages disappear, increase `basic.pause(...)` or send fewer cells.

---

## Common problems

- **Nothing receives**
  - Check that every micro:bit uses the same radio group.

- **Cells appear in the wrong place**
  - Confirm all robots agree on grid origin, orientation, and cell size.

- **Map flickers**
  - Send only changed cells, not the whole grid every loop.

- **Obstacle never clears**
  - The simple merge rule makes occupied cells win. Add decay, timestamps, or probabilities if you need clearing.

- **Robots overwrite each other**
  - Include robot IDs and timestamps in the message.

---

## Design extensions

- **Add timestamps**
  - Use `m,id,t,x,y,v` so old updates can be ignored.

- **Use probabilities**
  - Replace `0`, `1`, `2` with `0..100`, where higher means more occupied.

- **Add map decay**
  - Slowly move cells back toward unknown if they are not refreshed.

- **Send robot pose**
  - Publish `p,id,x,y,heading` so the base station can draw robot locations.

- **Use path planning**
  - Combine shared mapping with [`path-planning-pu.md`](https://github.com/robotgyms/pxt-robotpu/blob/main/tutorials/path-planning-pu.md).

- **Coordinate transforms**
  - If robots start in different places, transform each robot’s local cells into a shared global grid before merging.
