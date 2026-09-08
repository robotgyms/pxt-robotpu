---
title: Action Q-Table
---

This tutorial shows how to use an action Q-table to make Robot PU learn from experience and improve its performance over time.

Can the robot do something to make its owner turn on music? Different users are persuaded by different actions, so the robot needs to learn the best action (and sequence of actions) for each user.

In this tutorial the robot uses a small Q-table that records how good each action is after every previous action. It also listens through the microphone and uses the music library to detect music. Valid music has a BPM between 60 and 200 and a BPM variance of less than 10.

The robot can choose from these 8 actions:

- compose/sing a song
- jump
- dance
- explore
- move/turn randomly
- side step randomly
- rest
- say "Please play music"

## How it works

- The **state** is the last action the robot performed.
- The **Q-table** stores a value for every `(lastAction, nextAction)` pair. A higher value means that pair is more likely to lead to music.
- A rolling buffer keeps the last 360 `(state, action)` pairs. When music is detected, every recent pair gets discounted credit.
- Every 5 seconds the robot picks the next action, runs it, checks for music, and learns.

## Program

Copy this program into the MakeCode **JavaScript** editor.

```typescript
const ACTIONS = 8
const ACTION_MS = 5000
const HISTORY_SIZE = 360
const BPM_LO = 60
const BPM_HI = 200
const BPM_VARIANCE_MAX = 100
const ALPHA = 0.2
const GAMMA = 0.9
const EPSILON = 15

const ACTION_NAMES = [
    "sing",
    "jump",
    "dance",
    "explore",
    "walk",
    "side step",
    "rest",
    "say please"
]

// Q-table: Q[lastAction][nextAction]
let Q: number[][] = []
for (let i = 0; i < ACTIONS; i++) {
    Q.push([])
    for (let j = 0; j < ACTIONS; j++) {
        Q[i].push(0)
    }
}

// Rolling history of (state, action) pairs
let histS: number[] = []
let histA: number[] = []
let histPtr = 0
let histLen = 0
for (let i = 0; i < HISTORY_SIZE; i++) {
    histS.push(0)
    histA.push(0)
}

// Recent valid BPM values for variance check
let bpmBuf: number[] = []
const BPM_BUF_SIZE = 12

function pushHistory(s: number, a: number) {
    histS[histPtr] = s
    histA[histPtr] = a
    histPtr = (histPtr + 1) % HISTORY_SIZE
    if (histLen < HISTORY_SIZE) histLen++
}

function updateQDelayed(reward: number) {
    // Walk back through the most recent actions and give them discounted credit
    for (let i = 0; i < histLen; i++) {
        let idx = (histPtr - 1 - i + HISTORY_SIZE) % HISTORY_SIZE
        let s = histS[idx]
        let a = histA[idx]
        let r = reward * Math.pow(GAMMA, i)
        Q[s][a] = Q[s][a] + ALPHA * (r - Q[s][a])
    }
}

function chooseAction(state: number): number {
    if (randint(0, 100) < EPSILON) {
        return randint(0, ACTIONS - 1)
    }
    let bestA = 0
    let bestV = Q[state][0]
    for (let a = 1; a < ACTIONS; a++) {
        if (Q[state][a] > bestV) {
            bestV = Q[state][a]
            bestA = a
        }
    }
    return bestA
}

function runAction(a: number) {
    if (a == 0) {
        robotPuPro.sing(robotPuPro.composeSong(robotPuPro.SongStyle.Cute), 240)
        basic.pause(ACTION_MS)
    } else if (a == 7) {
        robotPuPro.talk("Please play music")
        basic.pause(ACTION_MS)
    } else {
        let start = control.millis()
        while (control.millis() - start < ACTION_MS) {
            if (a == 1) robotPuPro.jump()
            else if (a == 2) robotPuPro.dance()
            else if (a == 3) robotPuPro.explore()
            else if (a == 4) robotPuPro.walk(randint(-3, 3), randint(-1, 1))
            else if (a == 5) robotPuPro.sideStep(randint(-1, 1))
            else if (a == 6) robotPuPro.rest()
            basic.pause(20)
        }
    }
}

function isMusicOn(): boolean {
    let bpm = robotPuPro.musicTempo()
    if (bpm < BPM_LO || bpm > BPM_HI) return false

    bpmBuf.push(bpm)
    if (bpmBuf.length > BPM_BUF_SIZE) bpmBuf.shift()

    if (bpmBuf.length < BPM_BUF_SIZE) return false

    let mean = 0
    for (let v of bpmBuf) mean += v
    mean /= bpmBuf.length

    let varSum = 0
    for (let v of bpmBuf) varSum += (v - mean) * (v - mean)
    let variance = varSum / bpmBuf.length

    return variance < BPM_VARIANCE_MAX
}

function showBestAction(state: number) {
    let bestA = 0
    let bestV = Q[state][0]
    for (let a = 1; a < ACTIONS; a++) {
        if (Q[state][a] > bestV) {
            bestV = Q[state][a]
            bestA = a
        }
    }
    basic.showNumber(bestA)
}

robotPuPro.greet()
basic.pause(500)

let state = 0
basic.forever(function () {
    let action = chooseAction(state)
    pushHistory(state, action)

    runAction(action)

    if (isMusicOn()) {
        updateQDelayed(1)
        basic.showIcon(IconNames.Heart)
        showBestAction(state)
        // Reset for the next learning episode
        bpmBuf = []
        histLen = 0
        state = 0
    } else {
        // One-step Q update with the best future action
        let nextBest = Q[action][0]
        for (let a = 1; a < ACTIONS; a++) {
            if (Q[action][a] > nextBest) nextBest = Q[action][a]
        }
        Q[state][action] = Q[state][action] + ALPHA * (GAMMA * nextBest - Q[state][action])
        state = action
    }

    basic.pause(100)
})
```

## What happens

1. `greet()` calibrates and stands the robot up.
2. The first `basic.forever` loop picks an action using the Q-table, runs it, and listens for music.
3. If valid music is detected, every recent `(lastAction, action)` pair gets credit, the heart icon appears, and the learned best action is shown.
4. If no music is detected, the robot does a small one-step Q update and tries the next action.
5. Over many attempts the Q-table converges to the action sequence that is most likely to make the owner play music.

## Tuning the performance

| To change | Adjust |
|---|---|
| Learning speed | Change `ALPHA` (higher = faster but less stable) |
| Delayed reward reach | Change `GAMMA` (higher = credit reaches further back) |
| Exploration | Change `EPSILON` (percent chance of random action) |
| Music detection | Change `BPM_LO`, `BPM_HI`, `BPM_VARIANCE_MAX` |
| Action duration | Change `ACTION_MS` (default 5000 ms) |
| History size | Change `HISTORY_SIZE` (default 360 entries) |

## Troubleshooting

- **Robot never detects music** — make sure the micro:bit microphone is not blocked and the room is quiet enough for the beat detector to lock onto music.
- **Robot always picks the same action** — lower `EPSILON` only after the robot has tried many actions; too early and it gets stuck on the first reward.
- **Q-table stays flat** — the owner must actually play music at some point for the robot to receive positive rewards.
