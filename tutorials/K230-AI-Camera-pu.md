# Lesson: K230 AI Camera (HUSKYLENS 2) — Make Robot PU Interactive with Humans

This lesson shows how to use an external AI vision sensor (DFRobot **HUSKYLENS 2**, based on the **K230**) to give Robot PU “human-aware” behaviors like:

- greet a person when they appear
- turn to face a person
- follow a person at a safe distance
- react to simple gestures / poses (if you enable those models)

Product page:

- https://www.dfrobot.com/product-2995.html

Official docs (recommended):

- https://wiki.dfrobot.com/_SKU_SEN0638_Gravity_HUSKYLENS_2_AI_Camera_Vision_Sensor

---

## Prerequisites

- Robot PU + micro:bit
- HUSKYLENS 2 (K230 AI Camera)
- A way to mount the camera so it faces forward (tape / bracket)

---

## 1) How HUSKYLENS 2 connects to micro:bit

HUSKYLENS 2 supports **UART** and **I2C** for controller communication (per the product documentation).

On micro:bit, the simplest integration patterns are:

- **UART**: camera sends detection results as data; micro:bit reads via serial
- **I2C**: micro:bit reads structured result packets from the camera

Important:

- Always follow the HUSKYLENS 2 wiki for **exact wiring** and **exact protocol**.
- Robot PU already uses the micro:bit edge connector heavily; plan your wiring so you don’t conflict with Robot PU hardware.

---

## 2) Pick one “human interaction” model to start

HUSKYLENS 2 ships with many built-in models. For “make Robot PU more interactive with humans”, start with one of:

- **Person detection / tracking** (best first step)
- **Face recognition** (greet known people)
- **Pose estimation / gesture** (react to actions)

Your goal in code is always the same:

- Convert camera output into a few high-level signals:
  - `humanSeen: boolean`
  - `humanX: number` (left/right position in image)
  - `humanSize: number` (proxy for distance)
  - `humanId: number` (optional)

---

## 3) A simple control strategy that works well on micro:bit

Avoid heavy vision logic on the micro:bit. Let the camera do vision; micro:bit only does:

- state
- thresholds
- motion commands

### 3.1) Convert image position into turning

If you have a horizontal position `x` in the image:

- `x < center - deadband` → turn left
- `x > center + deadband` → turn right
- otherwise → go straight

### 3.2) Convert target size into forward speed

If you have a size estimate `s` (bounding box width/height/area):

- big `s` → person is close → slow down / stop / back up
- small `s` → person is far → move forward

Use clamping and small speed limits; humans are unpredictable.

---

## 4) Example behavior: “Turn to face a person, then greet”

This example is written as a MakeCode pattern. **The parsing part depends on the output format you configure** (UART text vs I2C packets). Use it as a template.

### 4.1) Data model

```typescript
let humanSeen = false
let humanX = 0      // normalized -1..+1 (left..right)
let humanSize = 0   // arbitrary units (bigger == closer)

let greeted = false
```

### 4.2) Behavior loop

```typescript
const TURN_GAIN = 0.7
const MAX_TURN = 0.9
const DEAD_BAND = 0.15

function clamp(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

function updateInteraction(): void {
    if (!humanSeen) {
        greeted = false
        robotPuPro.explore()
        return
    }

    // Turn to face the person (walk()'s turn is positive=left, negative=right,
    // so we negate humanX: person to the right (humanX>0) needs a right turn)
    let turn = 0
    if (humanX > DEAD_BAND) turn = clamp(-humanX * TURN_GAIN, -MAX_TURN, 0)
    else if (humanX < -DEAD_BAND) turn = clamp(-humanX * TURN_GAIN, 0, MAX_TURN)

    // A conservative “approach” speed; adjust for your robot / space
    let speed = 0
    if (humanSize < 0.4) speed = 1.2
    else if (humanSize < 0.7) speed = 0.6
    else speed = 0

    robotPuPro.walk(speed, turn)

    // If we are roughly centered and close enough, greet once
    if (!greeted && Math.abs(humanX) < 0.2 && humanSize > 0.6) {
        robotPuPro.greet()
        greeted = true
    }
}

basic.forever(function () {
    // 1) Read camera results and update: humanSeen, humanX, humanSize
    // 2) Use the behavior
    updateInteraction()
    basic.pause(20)
})
```

---

## 5) Getting camera results into `humanSeen/humanX/humanSize`

There are two common approaches.

### A) UART “text line” approach (simple debugging)

If you configure your camera / controller firmware so that the camera sends a single line per update, you can parse it using:

- `serial.readString()`
- `serial.onDataReceived(...)`

The exact line format is camera/firmware dependent. A typical pattern is:

- read a line
- split on commas
- update fields

### B) I2C approach (more structured)

I2C is often more structured and less fragile than text, but you must follow the camera’s official protocol and register map.

In MakeCode, I2C integration usually looks like:

```typescript
// Pseudocode shape only. Use the official HUSKYLENS 2 protocol.
// pins.i2cWriteBuffer(addr, cmd)
// let rx = pins.i2cReadBuffer(addr, n)
// decode rx
```

---

## 6) Make it feel “alive”: human-aware interactions

Ideas that work well on Robot PU:

- **Turn-to-face**: always turn toward the detected human (small turn gain)
- **Approach-with-personal-space**: move forward until `humanSize` crosses a “comfortable” limit
- **Recognize-and-greet**: if the model provides IDs, greet differently per ID
- **Attention idle**: if no person is seen for N seconds, switch to `robotPuPro.explore()`

---

## 7) Safety notes

- Keep speeds low when interacting with humans.
- Always keep an “escape” rule (if sonar is too close, stop or turn away).
- Mount the camera securely; avoid dangling wires that can catch on moving parts.

---

## 8) References

- Product page: https://www.dfrobot.com/product-2995.html
- Wiki: https://wiki.dfrobot.com/_SKU_SEN0638_Gravity_HUSKYLENS_2_AI_Camera_Vision_Sensor
- GitHub community/library: https://github.com/DFRobot/DFRobot_HuskylensV2