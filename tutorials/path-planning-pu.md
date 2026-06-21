# Path Planning on a Tiny Grid (BFS / A*)

This tutorial introduces global planning on an occupancy grid.

In ROS this corresponds to the **global planner** in the navigation stack.

Because micro:bit resources are limited, we’ll use:

- **BFS** (breadth-first search) on a small grid
- optional A* later (same structure, add heuristic)

---

## Prerequisites

- `occupancy-grid-pu.md` (grid + obstacles)

---

## Problem

Given:

- grid cells: unknown/free/occupied
- start cell `(sx, sy)`
- goal cell `(gx, gy)`

Find a path of neighbor steps.

---

## Example: BFS planner (4-neighbor)

This snippet builds a path as a list of directions.

```typescript
const W = 9
const H = 9

// 0 unknown, 1 free, 2 occupied
let grid: number[] = []
for (let i = 0; i < W * H; i++) grid.push(1)

function idx(x: number, y: number): number {
    return y * W + x
}

function isFree(x: number, y: number): boolean {
    if (x < 0 || x >= W || y < 0 || y >= H) return false
    return grid[idx(x, y)] != 2
}

function bfs(sx: number, sy: number, gx: number, gy: number): number[] {
    // parent direction stored per cell, -1 = unvisited
    let parentDir: number[] = []
    for (let i = 0; i < W * H; i++) parentDir.push(-1)

    let qx: number[] = []
    let qy: number[] = []

    qx.push(sx)
    qy.push(sy)
    parentDir[idx(sx, sy)] = 4

    const dx = [0, 1, 0, -1]
    const dy = [-1, 0, 1, 0]

    while (qx.length > 0) {
        const x = qx.shift()
        const y = qy.shift()
        if (x == gx && y == gy) break

        for (let dir = 0; dir < 4; dir++) {
            const nx = x + dx[dir]
            const ny = y + dy[dir]
            if (!isFree(nx, ny)) continue
            const ii = idx(nx, ny)
            if (parentDir[ii] != -1) continue
            parentDir[ii] = dir
            qx.push(nx)
            qy.push(ny)
        }
    }

    // Reconstruct directions by walking backwards
    let path: number[] = []
    let cx = gx
    let cy = gy
    if (parentDir[idx(cx, cy)] == -1) return path

    while (!(cx == sx && cy == sy)) {
        const dir = parentDir[idx(cx, cy)]
        path.unshift(dir)
        cx -= dx[dir]
        cy -= dy[dir]
    }

    return path
}

// Example usage
let path = bfs(1, 1, 7, 7)
basic.showNumber(path.length)
```

---

## Next steps

- Add A*: prioritize queue by `g + h`.
- Feed the path into motion (`path-following-pu.md`).
