# ⚙️ Lesson: State Switch with `setMode()`

A **state** is the thing the robot is doing right now.
For Robot PU, examples of states are:

- standing still — `Rest`
- exploring the room with autopilot — `Explore`
- dancing — `Dance`
- walking with the gamepad — `Walk`

In MakeCode, `robotPuPro.setMode(mode)` is the single block that changes the robot's current behavior state.

---

## 1. What is a state?

A state answers the question: *“What is the robot doing at this moment?”*

- In the `Rest` state, Robot PU balances and stays still.
- In the `Explore` state, it uses sonar to look around and walk toward open space.
- In the `Dance` state, it moves to the music.

The extension keeps the current state in a variable called `gst` (global state) inside `robotpu.ts`. Each time the background loop runs, `stateMachine()` looks at `gst` and runs the matching behavior.

This is the **fundamental building block of robotics**: separate *what the robot is doing* (the state) from *how it decides to switch* (the events and rules).

Without states, a robot program becomes one giant tangle of `if` statements. With states, the code stays predictable: the robot is always in *one* mode, and events make it move to *another* mode.

---

## 2. Where the modes live

In the Robot PU MakeCode extension, `main.ts` defines the `Mode` enum and the `setMode` block you use in MakeCode:

```typescript
// main.ts
export enum Mode {
    //% block="trim calibration"
    CalibrateServo = -4,
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
    //% block="walk (remote control)"
    Walk = 5,
    //% block="API (advanced programming)"
    API = 6
}

//% block="set mode %mode"
//% subcategory="Actions"
//% group="Actions"
export function setMode(mode: Mode): void {
    const r = ensureRobot();
    r.gst = mode as number;
}
```

So when you call:

```typescript
robotPuPro.setMode(robotPuPro.Mode.Explore)
```

the extension simply writes `1` into `gst`, switching the active state.

Inside `robotpu.ts`, the constructor builds a dictionary that maps each state number to the function that runs it:

```typescript
// robotpu.ts (inside RobotPu constructor)
this.stateFuncDict = {
    [0]: () => this.idle(),    // idle / Rest
    [1]: () => this.explore(), // Explore
    [2]: () => this.jump(),
    [3]: () => this.dance(),   // Dance
    [4]: () => this.kick(),
    [5]: () => this.joystick() // Walk / remote control
};
```

Then `stateMachine()` calls the right function over and over:

```typescript
// robotpu.ts
public stateMachine(): void {
    let behavior = this.stateFuncDict[this.gst];
    if (behavior) {
        behavior();
    }
}
```

You can also read the current mode:

```typescript
let current = robotPuPro.mode()
```

---

## 3. Linking states to events

An **event** is anything that happens in the world:

- a button is pressed: `input.buttonIsPressed(Button.A)`
- temperature rises: `input.temperature()`
- a loud sound is detected: `input.soundLevel()`
- a timer expires: `control.millis()`

A state switch uses an event to decide when to call `setMode(...)`.

### Example: switch with buttons

```typescript
basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        robotPuPro.setMode(robotPuPro.Mode.Rest)
    }
    if (input.buttonIsPressed(Button.B)) {
        robotPuPro.setMode(robotPuPro.Mode.Explore)
    }
    basic.pause(100)
})
```

**Important:** `setMode(...)` only needs to be called when you actually want to change. Calling it every loop is safe, but it is cleaner to keep a `currentMode` variable and switch only when the state really changes.

---

## 4. Showcase: environment-driven state switching

Let's build a robot that reacts to its environment:

- **Start** in `Explore` mode when the program starts.
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

let currentMode = robotPuPro.Mode.Explore
let danceUntil = 0

// Start exploring
robotPuPro.setMode(currentMode)

basic.forever(function () {
    const now = control.millis()
    const temp = input.temperature()
    const sound = input.soundLevel()

    // 1. Safety first: if it is hot, rest
    if (temp > HOT_THRESHOLD) {
        if (currentMode != robotPuPro.Mode.Rest) {
            robotPuPro.setMode(robotPuPro.Mode.Rest)
            currentMode = robotPuPro.Mode.Rest
        }
    }
    // 2. Loud sound: dance for a few seconds (but not during a safety rest)
    else if (sound >= LOUD_THRESHOLD && now > danceUntil) {
        if (currentMode != robotPuPro.Mode.Dance) {
            robotPuPro.setMode(robotPuPro.Mode.Dance)
            currentMode = robotPuPro.Mode.Dance
            danceUntil = now + DANCE_DURATION_MS
        }
    }
    // 3. Dance timer finished: decide what to do next
    else if (currentMode == robotPuPro.Mode.Dance && now >= danceUntil) {
        if (temp < COOL_THRESHOLD) {
            robotPuPro.setMode(robotPuPro.Mode.Explore)
            currentMode = robotPuPro.Mode.Explore
        } else {
            robotPuPro.setMode(robotPuPro.Mode.Rest)
            currentMode = robotPuPro.Mode.Rest
        }
    }
    // 4. Cooled down while resting: resume exploring
    else if (currentMode == robotPuPro.Mode.Rest && temp < COOL_THRESHOLD) {
        robotPuPro.setMode(robotPuPro.Mode.Explore)
        currentMode = robotPuPro.Mode.Explore
    }

    basic.pause(200)
})
```

### How it works

1. `robotPuPro.setMode(robotPuPro.Mode.Explore)` starts the robot exploring.
2. The `basic.forever` loop reads `input.temperature()` and `input.soundLevel()` every 200 ms.
3. **Too hot?** It switches to `Rest`. This is a *safety guard*.
4. **Loud sound?** It switches to `Dance` for 3 seconds. This is an *event-driven transition*.
5. **Cooled down?** It returns to `Explore`.
6. The `currentMode` variable stops `setMode(...)` from being called every loop; the robot only switches when something actually changes.

---

## 5. Exercises

- Add button A to force `Rest` and button B to force `Explore`.
- Change the sound threshold based on how noisy the room is.
- Add a “sleep timer”: if nothing interesting happens for 10 seconds, switch to `Rest`.
- Combine this with `robotPuPro.bodyRoll()` and `robotPuPro.bodyPitch()` to add a *fall guard*: if the robot tilts too far, switch to `Rest` until it is stable.

---

## 6. Summary

- A **state** is the current behavior of the robot.
- `robotPuPro.setMode(mode)` changes the state by writing to `gst` in `robotpu.ts`.
- `stateMachine()` in `robotpu.ts` keeps calling the behavior that matches `gst`.
- **Events** (buttons, temperature, sound, timers) decide *when* to switch states.
- Robotics is all about safe, predictable state switching: never change behavior without a reason, and use guards (like temperature checks) to stay safe.