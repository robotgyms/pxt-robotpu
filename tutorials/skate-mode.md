 
 # 🛼 Robot PU: Skate Mode
 
 Skate mode swaps Robot PU's walking gait for a skating gait — feet stay closer to the ground and PU glides along like it's on roller blades.
 
 You can use skate mode three ways:
 
 - drive with the **gamepad** (`set walking mode to Skate`)
 - run it as a **counted action** (`start (Action.Skate)`)
 - call **`skate(speed, turn)`** directly in a loop
 
 ---
 
 ## What is "walking mode"?
 
 In drive (joystick) mode, PU picks a gait from the walking-mode table each tick. The default is **walk**. `robotPuPro.setWalkMode(...)` switches the table entry to **skate**, so the same joystick controls make PU skate instead of walk.
 
 ```typescript
 // Drive mode now skates instead of walks.
 robotPuPro.setWalkMode(robotPuPro.WalkMode.Skate)
 // Switch back any time.
 robotPuPro.setWalkMode(robotPuPro.WalkMode.Walk)
 ```
 
 ### Why does PU need a "mode" at all?
 
 Because walking and skating are completely different gaits — not just the same motion at a different speed:
 
 - **Different servo angles.** Each gait is a loop of poses: walking steps through gait states 2–7, skating steps through states 27–30. Every pose stores a different target angle for all 10 servos.
 - **Different timing.** Each pose also maps to a different per-servo speed vector — which joints move fast and which move slow changes between gaits.
 - **Different posture.** Skating keeps the feet low and glides; walking lifts and plants each foot. The balance corrections the IMU applies are tuned per gait.
 
 The joystick only says *how fast* and *which way* to go. Without a mode, PU couldn't know *how* to move — `set walking mode` tells it which gait table to run.
 
 New walking modes can be added to `WalkMode` later — this tutorial only covers skate.
 
 ---
 
 ## 1. Skate with the gamepad
 
 Flash this program to the micro:bit in Robot PU's head. It forwards gamepad commands and puts drive mode into the skate gait. The gamepad micro:bit needs its controller program too — see [gamepad.md](gamepad.md).
 
 ```typescript
 // Forward name/value commands (gamepad buttons, speed, turn, etc.).
 radio.onReceivedValue(function (name, value) {
     robotPuPro.runKeyValueCommand(name, value)
 })
 // Logo button on Robot PU's head: enter or exit trim mode.
 input.onLogoEvent(TouchButtonEvent.Pressed, function () {
     robotPuPro.toggleServoTrim()
 })
 // Robot and gamepad must use the same radio channel.
 robotPuPro.setChannel(166)
 // Drive mode now skates instead of walks.
 robotPuPro.setWalkMode(robotPuPro.WalkMode.Skate)
 ```
 
 The logo button on PU's head toggles servo trim mode — see [servo-trim-calibration.md](servo-trim-calibration.md).
 
 Then drive as usual:
 
 - Push the joystick forward — PU skates forward.
 - Pull back — PU skates backward.
 - Push left/right — PU turns while skating.
 
 Tip: you can add the serial trim printout loop from [servo-trim-calibration.md](servo-trim-calibration.md) to this program too — handy for fixing a wobbly skate on the spot.
 
 ---
 
 ## 2. Skate as an action
 
 ```typescript
 // Skate for 20 steps, then stop.
 robotPuPro.start(robotPuPro.Action.Skate, 20)
 ```
 
 `Action.Skate` is a counted action just like `Action.Walk`:
 
 - `steps = 0` (or less) skates forever until you call `robotPuPro.stop()`.
 - `stepsDone`, `stepsRemaining`, `isDone`, and `stop()` all work with it.
 - Each completed skate step also bumps the pedometer.
 
 ---
 
 ## 3. Direct skate control in a loop
 
 The `skate` block performs one gait step per call — put it in `forever` to keep skating.
 
 ```typescript
 basic.forever(function () {
     robotPuPro.skate(2, 0)
 })
 ```
 
 - `speed`: -5 (full backward) to 5 (full forward)
 - `turn`: -1 (full right) to 1 (full left), 0 is straight
 
 ---
 
 ## Bonus: toggle walk/skate at runtime
 
 You can switch modes from any event — for example, micro:bit button A skates, button B walks:
 
 ```typescript
 input.onButtonPressed(Button.A, function () {
     robotPuPro.setWalkMode(robotPuPro.WalkMode.Skate)
 })
 input.onButtonPressed(Button.B, function () {
     robotPuPro.setWalkMode(robotPuPro.WalkMode.Walk)
 })
 ```
 
 Or use the gamepad **joystick press** to switch gaits:
 
 - single press: set to walking mode
 - double press (within 400 ms): set to skating mode
 
 ```typescript
 // The joystick press arrives as a "#puB" value — adjust the 1 to match
 // your gamepad. It is intercepted BEFORE runKeyValueCommand so it
 // doesn't also trigger the normal B1 action (explore).
 let lastPressMs = 0
 radio.onReceivedValue(function (name, value) {
     if (name == "#puB" && value == 1) {
         if (control.millis() - lastPressMs < 400) {
             // double press: skate mode
             robotPuPro.setWalkMode(robotPuPro.WalkMode.Skate)
             lastPressMs = 0
         } else {
             // single press: walk mode
             robotPuPro.setWalkMode(robotPuPro.WalkMode.Walk)
             lastPressMs = control.millis()
         }
         return
     }
     robotPuPro.runKeyValueCommand(name, value)
 })
 // Logo button on Robot PU's head: enter or exit trim mode.
 input.onLogoEvent(TouchButtonEvent.Pressed, function () {
     robotPuPro.toggleServoTrim()
 })
 // Robot and gamepad must use the same radio channel.
 robotPuPro.setChannel(166)
 ```
 
 How it works: the handler timestamps each press. If the previous press was less than 400 ms ago it's a double press (and `lastPressMs` resets so the next press starts fresh); otherwise it's a single press.
 
 Notes:
 
 - Intercepting `#puB` value `1` before `runKeyValueCommand` means that value no longer triggers its built-in action (explore).
 - The interception applies in trim mode too — if your joystick press shares value `1` with B1, trim mode loses B1's −1° adjustment (B4 still adjusts +1°).
 - If your joystick press sends a different value, change `value == 1`. Values 0–4 are mapped to the pin buttons; 5 and above are unused, so prefer one of those to keep all button actions working.
 
 ---
 
 ## Tuning tips
 
 - Skating works best on smooth, flat floors; carpet adds a lot of friction.
 - Start slow (`speed` 1–2) — the balance controller needs a moment to settle.
 - If PU scrapes a foot, leans, or drifts, run servo trim calibration first — see [servo-trim-calibration.md](servo-trim-calibration.md).
 - The speed sign picks the direction automatically: negative speed uses the backward skate states.
 - Falling more than walking? That's normal — the skate gait is less stable. Check out [learn-skate.md](learn-skate.md) to see how PU can *learn* better skate parameters with reinforcement learning.
 
 ---
 
 ## How it works under the hood
 
 - `set walking mode` stores a `WalkMode` value on the robot.
 - `joystick()` — the drive-mode handler — looks that value up in the gait table every tick and calls `walk()` or `skate()`.
 - `skate()` reuses the same balance engine as `walk()` (`moveBalance()` with IMU feedback), but steps through the skate poses (gait states 27–30) instead of the walking poses (gait states 2–7).
 - Each gait state maps to a row in `stateTargets` (the servo angles) and a row in `speedCandidates` (per-servo speed) via `stateSpeedIndices` — that's why the two gaits look and feel so different even though they share one balance loop.
