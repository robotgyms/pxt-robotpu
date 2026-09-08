# ⚙️ Lesson: State Switch with `start` and `stop`

A **state** is the thing the robot is doing right now.
For Robot PU, examples of actions are:

- standing still — `Rest`
- exploring the room with autopilot — `Explore`
- dancing — `Dance`
- walking with the gamepad — `Walk`

In MakeCode, `robotPuPro.start(action, steps)` begins an action, and `robotPuPro.stop()` returns the robot to rest. If `steps` is `0` (or less), the action runs until you start another one or call `stop()`.

---

## 1. What is a state?

A state answers the question: *“What is the robot doing at this moment?”*

- In the `Rest` state, Robot PU balances and stays still.
- In the `Explore` state, it uses sonar to look around and walk toward open space.
- In the `Dance` state, it moves to the music.

The extension keeps the current action in a variable inside `robotpu.ts`. Each time the background loop runs, it runs the matching behavior.

This is the **fundamental building block of robotics**: separate *what the robot is doing* (the state) from *how it decides to switch* (the events and rules).

Without states, a robot program becomes one giant tangle of `if` statements. With states, the code stays predictable: the robot is always in *one* action, and events make it move to *another* action.

---

## 2. Where the actions live

In the Robot PU MakeCode extension, `main.ts` defines the `Action` enum and the `start` / `stop` blocks you use in MakeCode:

```typescript
// main.ts
export enum Action {
    //% block="rest"
    Rest = 0,
    //% block="explore"
    Explore = 1,
    //% block="jump"
    Jump = 2,
    //% block="dance"
    Dance = 3,
    //% block="kick"
    Kick = 4,
    //% block="walk"
    Walk = 10,
    //% block="walk backward"
    WalkBackward = 11,
    //% block="turn left"
    TurnLeft = 12,
    //% block="turn right"
    TurnRight = 13,
    //% block="sit"
    Sit = 14,
    //% block="stand"
    Stand = 15,
    //% block="laugh"
    Laugh = 16,
    //% block="cry"
    Cry = 17,
    //% block="scream"
    Scream = 18,
    //% block="funny"
    Funny = 19,
    //% block="blink"
    Blink = 20,
    //% block="greet"
    Greet = 21,
    //% block="drive"
    Drive = 5,
    //% block="calibrate"
    Calibrate = -4,
    //% block="duck"
    Duck = -5
}

/** Start a robot action and run it for the given number of steps (0 or less = forever). */
export function start(action: Action, steps: number): void {
    ensureRobot().startAction(action, steps);
}

/** Stop the current action and reset to rest. */
export function stop(): void {
    ensureRobot().stopAction();
}
```

So when you call:

```typescript
robotPuPro.start(robotPuPro.Action.Explore, 0)
```

the extension starts the `Explore` behavior and keeps it running until you switch again.

You can also ask whether a counted action has finished:

```typescript
let done = robotPuPro.isDone(robotPuPro.Action.Dance)
```

---

## 3. Linking states to events

An **event** is anything that happens in the world:

- a button is pressed: `input.buttonIsPressed(Button.A)`
- temperature rises: `input.temperature()`
- a loud sound is detected: `input.soundLevel()`
- a timer expires: `control.millis()`

A state switch uses an event to decide when to call `start(...)` or `stop()`.

### Example: switch with buttons

```typescript
basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        robotPuPro.stop()
    }
    if (input.buttonIsPressed(Button.B)) {
        robotPuPro.start(robotPuPro.Action.Explore, 0)
    }
    basic.pause(100)
})
```

**Important:** `start(...)` only needs to be called when you actually want to change. Calling it every loop is safe, but it is cleaner to keep a `currentAction` variable and switch only when the state really changes.

---

## 4. Showcase: environment-driven state switching

Let's build a robot that reacts to its environment:

- **Start** in `Explore` when the program starts.
- **Switch to `Rest`** when the temperature is too high (above 30 °C).
- **Go back to `Explore`** when it cools down (below 28 °C).
- **Switch to `Dance`** when a loud sound is detected (sound level above 180).
- Dance for a few seconds, then return to the environment-driven state.

Copy this into the **JavaScript** tab of MakeCode:

```typescript
const HOT_THRESHOLD = 30
const COOL_THRESHOLD = 28
const LOUD_THRESHOLD = 180
const DANCE_DURATION_MS = 3000

let currentAction = robotPuPro.Action.Explore
let danceUntil = 0

// Start exploring
robotPuPro.start(currentAction, 0)

basic.forever(function () {
    const now = control.millis()
    const temp = input.temperature()
    const sound = input.soundLevel()

    // 1. Safety first: if it is hot, rest
    if (temp > HOT_THRESHOLD) {
        if (currentAction != robotPuPro.Action.Rest) {
            robotPuPro.stop()
            currentAction = robotPuPro.Action.Rest
        }
    }
    // 2. Loud sound: dance for a few seconds (but not during a safety rest)
    else if (sound >= LOUD_THRESHOLD && now > danceUntil) {
        if (currentAction != robotPuPro.Action.Dance) {
            robotPuPro.start(robotPuPro.Action.Dance, 0)
            currentAction = robotPuPro.Action.Dance
            danceUntil = now + DANCE_DURATION_MS
        }
    }
    // 3. Dance timer finished: decide what to do next
    else if (currentAction == robotPuPro.Action.Dance && now >= danceUntil) {
        if (temp < COOL_THRESHOLD) {
            robotPuPro.start(robotPuPro.Action.Explore, 0)
            currentAction = robotPuPro.Action.Explore
        } else {
            robotPuPro.stop()
            currentAction = robotPuPro.Action.Rest
        }
    }
    // 4. Cooled down while resting: resume exploring
    else if (currentAction == robotPuPro.Action.Rest && temp < COOL_THRESHOLD) {
        robotPuPro.start(robotPuPro.Action.Explore, 0)
        currentAction = robotPuPro.Action.Explore
    }

    basic.pause(200)
})
```

### How it works

1. `robotPuPro.start(robotPuPro.Action.Explore, 0)` starts the robot exploring.
2. The `basic.forever` loop reads `input.temperature()` and `input.soundLevel()` every 200 ms.
3. **Too hot?** It calls `robotPuPro.stop()` to rest. This is a *safety guard*.
4. **Loud sound?** It starts `Dance` for 3 seconds. This is an *event-driven transition*.
5. **Cooled down?** It returns to `Explore`.
6. The `currentAction` variable stops `start(...)` from being called every loop; the robot only switches when something actually changes.

---

## 5. Exercises

- Add button A to force `Rest` and button B to force `Explore`.
- Change the sound threshold based on how noisy the room is.
- Add a “sleep timer”: if nothing interesting happens for 10 seconds, call `stop()`.
- Combine this with `robotPuPro.bodyRoll()` and `robotPuPro.bodyPitch()` to add a *fall guard*: if the robot tilts too far, call `stop()` until it is stable.

---

## 6. Summary

- A **state** is the current behavior of the robot.
- `robotPuPro.start(action, 0)` starts an action; `robotPuPro.stop()` returns to `Rest`.
- The background action runner keeps calling the behavior that matches the current action.
- **Events** (buttons, temperature, sound, timers) decide *when* to switch states.
- Robotics is all about safe, predictable state switching: never change behavior without a reason, and use guards (like temperature checks) to stay safe.
