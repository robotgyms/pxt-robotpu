# 🤖 Lesson: Robot PU Actions with Action Tokens

Robot PU has a simple **start → check → stop** API. Pick an action, tell the robot how many "steps" (completions) to do, then check `is done?` or `stop` it.

## New action blocks

Look for these blocks at the top of the Robot PU toolbox:

- `start %action for %steps steps`
- `is %action done?`
- `stop robot`

`start` runs in the background, so your program can keep doing other things.

### Action token dropdown

`start` accepts an **Action** token. The current tokens are:

| Token | What it does |
| --- | --- |
| `stop` | Cancels the current action and returns to the rest pose. |
| `walk` | Walks **forward**. |
| `walk backward` | Walks backward. |
| `turn left` | Walks forward while turning left. |
| `turn right` | Walks forward while turning right. |
| `explore` | Autonomously avoids obstacles using the sonar sensor. |
| `dance` | Dances to the beat detected by the microphone. |
| `rest` | Holds a balanced idle pose. |
| `kick` | Performs a kicking motion. |
| `jump` | Performs a jump sequence. |
| `laugh` | Plays a laughing sound effect (one-shot). |
| `cry` | Plays a crying sound effect (one-shot). |
| `scream` | Plays a screaming sound effect (one-shot). |
| `funny` | Plays a funny/silly sound effect (one-shot). |
| `blink` | Runs the eye blink animation using the robot's internal alert level. |
| `greet` | Speaks the robot's name and serial number (one-shot). |
| `stand` | Moves to a neutral standing pose. |

## Start an action for a number of steps

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 10)
```

This starts walking forward and stops after **10 completions**. A completion is a gait-state boundary, not always one physical step. If your gait has 2 states per step, 10 completions is about 5 steps. Adjust the number to match your robot.

`steps` tells `start` how many `0` returns (completion events) to wait for. `0` or a negative number means **run forever** until `stop()` is called.

> **Tip:** `walk` means walk **forward**.

> **Careful with `steps` on sound/animation tokens:** `laugh`, `cry`, `scream`, `funny`, `greet`, `blink`, and `stop` don't have a "gait cycle" — internally they always report "done" on every call. That means `steps` controls **how many times in a row** they repeat, not a gait boundary count. Use `steps = 1` to trigger them once:
> ```typescript
> robotPuPro.start(robotPuPro.Action.Laugh, 1)   // laughs once
> robotPuPro.start(robotPuPro.Action.Laugh, 3)   // laughs 3 times in a row
> ```
> For simple one-shot sounds it's usually easier to call the direct block instead, eg. `robotPuPro.laugh()` — see [Play sound effects](#play-sound-effects) below.

This example starts the explore action and stops after **8 completions**.

```typescript
robotPuPro.start(robotPuPro.Action.Explore, 8)
```
## Another action will stop the previous action

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 10)
robotPuPro.start(robotPuPro.Action.Explore, 8)
```
The explore action will stop the walk action and start the explore action.

## Wait until an action is done

Because `start` is non-blocking, you can poll `isDone(...)` in a loop. 

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 20)

while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    basic.pause(100)
}

basic.showIcon(IconNames.Yes)
```

```typescript
robotPuPro.start(robotPuPro.Action.Explore, 20)

while (!robotPuPro.isDone(robotPuPro.Action.Explore)) {
    basic.pause(100)
}

basic.showIcon(IconNames.Yes)
```

Inside the loop you also can:
- Call other **sound/sensor-only** functions for multitasking (eg. `laugh()`, `talk()`, reading sensors) — safe, as long as they don't touch the servos.
- Call `stop()` to cancel the action you are waiting for, eg. on a button press.

Avoid calling another **servo-driving** function (like `dance()`, `kick()`, or another `start(...)`) while waiting — it will fight the current action for control of the same servos.

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 20)

while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    // Do other things here
    robotPuPro.laugh() // Good: laugh() only plays sound, it never touches the servos.
    basic.pause(1000)
    robotPuPro.dance() // Bad: dance() drives the same servos as walk(), so they fight over servo controls.
    if (input.buttonIsPressed(Button.A)) { // Press button A to stop the walk action.
        robotPuPro.stop()
        break
    }
}

basic.showIcon(IconNames.Yes)
```

The robot walks for 20 completions (or until button A is pressed). When it is done, the program shows a checkmark.

## Stop the current action

Use `stop()` to cancel any action at any time. For `steps` of `0` or a negative value, the action will run forever until stopped. Calling `stop()` will stop the action immediately.

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 0) // 0 steps means run forever
basic.pause(1000)  // walk for about 1 second
robotPuPro.stop()
```

Or use `stop()` in a button event:

```typescript
input.onButtonPressed(Button.A, function () {
    robotPuPro.stop()
})
```

## Chain actions

To run actions one after another, wait for `isDone(...)` before starting the next.

```typescript
// Walk forward
robotPuPro.start(robotPuPro.Action.Walk, 10)
while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    basic.pause(500)
}

// Turn left
robotPuPro.start(robotPuPro.Action.TurnLeft, 8)
while (!robotPuPro.isDone(robotPuPro.Action.TurnLeft)) {
    basic.pause(500)
}

// Jump once
robotPuPro.start(robotPuPro.Action.Jump, 1)
while (!robotPuPro.isDone(robotPuPro.Action.Jump)) {
    basic.pause(500)
}

// Stand up straight
robotPuPro.start(robotPuPro.Action.Stand, 1)
while (!robotPuPro.isDone(robotPuPro.Action.Stand)) {
    basic.pause(500)
}
```
## Change Walking speed and direction

```typescript
robotPuPro.start(robotPuPro.Action.Walk, 10)

while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    // gradually slow down
    robotPuPro.setWalkSpeed(robotPuPro.walkSpeed() * 0.9)
    // gradually turn left (positive direction = left, negative = right)
    robotPuPro.setWalkDirection(robotPuPro.walkDirection() + 0.1)
    basic.pause(500)
}
```
You can use this method to do customized object avoidance or other behaviors, such as following a person or object, running through a maze, etc.

## Play sound effects
Use sound effects to show emotions or react to objects detected by sensors.

For example, when the microphone hears a loud noise, play a scream sound:
```typescript
if (input.soundLevel() > 200) {
    robotPuPro.scream()
}
```

When tilted left, play a funny sound:
```typescript
if (robotPuPro.bodyRoll() < -20) {
    robotPuPro.funny()
}
```

When tilted right, play a happy sound:
```typescript
if (robotPuPro.bodyRoll() > 20) {
    robotPuPro.laugh()
}
```

When upside down, play a sad sound:
```typescript
if (input.isGesture(Gesture.ScreenUp)) {
    robotPuPro.cry()
}
```

You can also trigger these as action tokens instead of calling the function directly, eg: `robotPuPro.start(robotPuPro.Action.Scream, 1)`.

## Switch actions on the fly

`start` automatically stops the previous action, so you can switch without calling `stop()` first.

```typescript
input.onButtonPressed(Button.A, function () {
    robotPuPro.start(robotPuPro.Action.Dance, 0)
})

input.onButtonPressed(Button.B, function () {
    robotPuPro.start(robotPuPro.Action.Rest, 1)
})
```

## Why action tokens are great for AI: reinforcement learning with Q-tables

### The problem with continuous control

Many robot behaviors (like `walk(speed, turn)`) take continuous numbers. Reinforcement learning algorithms like **Q-learning** need a small, *discrete* set of actions to choose from — otherwise the table of possibilities is infinite. Robot PU's **Action tokens** (`Walk`, `TurnLeft`, `TurnRight`, `Rest`, ...) are already a finite, named list, so they map directly onto the "actions" a Q-learning agent picks from. You don't need to invent your own action set or discretize speed/turn values yourself.

### What a Q-table actually is

A **Q-table** is a 2D grid: one row per **state**, one column per **action**. Each cell holds a number (the *Q-value*) estimating "how good is it to take this action from this state?" The agent's job is to:

1. Look at the current state.
2. Pick the action with the highest Q-value in that state's row (**exploit**) — or occasionally pick a random action to keep learning (**explore**).
3. Run the action, observe a **reward** (and the new state).
4. Update the Q-value for `(state, action)` using the reward.
5. Repeat.

### Turning sensor readings into a small state space

micro:bit has very limited RAM, so keep the state space small — a handful of *bins*, not raw sensor floats. For example, bucket the front sonar distance into 3 states using the existing sensor block:

```typescript
function getState(): number {
    const d = robotPuPro.sonarDistanceCm()
    if (d < 15) return 0        // "close" — obstacle nearby
    if (d < 40) return 1        // "medium"
    return 2                    // "far" — clear path
}
```

### Building the table and choosing actions

Keep the action list small too — 3-4 tokens is plenty for micro:bit:

```typescript
let actions = [
    robotPuPro.Action.Walk,
    robotPuPro.Action.TurnLeft,
    robotPuPro.Action.TurnRight
]

const numStates = 3
const numActions = actions.length

// Q[state][action]
let Q: number[][] = []
for (let s = 0; s < numStates; s++) {
    Q.push([0, 0, 0])
}

const learningRate = 0.3
const discount = 0.8
let epsilon = 0.3   // chance of picking a random (exploring) action

function chooseAction(state: number): number {
    if (Math.random() < epsilon) {
        return Math.floor(Math.random() * numActions)   // explore
    }
    // exploit: pick the column with the highest Q-value in this state's row
    let best = 0
    for (let a = 1; a < numActions; a++) {
        if (Q[state][a] > Q[state][best]) best = a
    }
    return best
}
```

### Reward shaping and the update rule

A simple reward: positive for staying far from obstacles, negative for getting close.

```typescript
function getReward(state: number): number {
    if (state == 0) return -1   // close to an obstacle: bad
    if (state == 2) return 1    // far / clear path: good
    return 0                    // medium: neutral
}
```

The Q-learning update rule blends the old estimate with the new observed reward plus the best possible future value:

```
Q[s][a] = Q[s][a] + learningRate * (reward + discount * max(Q[nextState]) - Q[s][a])
```

### Putting it all together

```typescript
basic.forever(function () {
    let state = getState()
    let actionIndex = chooseAction(state)

    robotPuPro.start(actions[actionIndex], 1)
    while (!robotPuPro.isDone(actions[actionIndex])) {
        basic.pause(20)
    }

    let nextState = getState()
    let reward = getReward(nextState)

    // Find the best Q-value achievable from the next state
    let maxNext = Q[nextState][0]
    for (let a = 1; a < numActions; a++) {
        if (Q[nextState][a] > maxNext) maxNext = Q[nextState][a]
    }

    // Q-learning update
    Q[state][actionIndex] = Q[state][actionIndex] +
        learningRate * (reward + discount * maxNext - Q[state][actionIndex])

    // Slowly reduce exploration over time so the robot exploits what it learned
    epsilon = Math.max(0.05, epsilon * 0.995)
})
```

Because each `start(action, 1)` / `isDone(...)` pair behaves like a single, complete "step" in an RL episode — it starts, runs to a known completion boundary, and reports back cleanly — you get a natural training loop without needing to manage low-level timing yourself. This is the core reason discrete action tokens are convenient for reinforcement learning on a small embedded robot: the environment step function is just `start()` + `isDone()`, and the state comes straight from Robot PU's sensor blocks (`sonarDistanceCm()`, `bodyRoll()`, `bodyPitch()`, etc.).

## Things to remember

- `start(...)` is **non-blocking**. The robot runs the action in the background.
- `0` (or less) steps means **run forever** until `stop()` or another `start(...)`.
- `isDone(action)` is `true` when that action has finished **or was stopped**.
- The `steps` count counts **completion events** (`0` returns from the gait engine), which may be more or fewer than physical steps.
- `stop()` resets the robot to the `rest` pose.
