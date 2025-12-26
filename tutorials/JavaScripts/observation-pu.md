
 # 👀 Lesson: Robot PU Sensors (Observation)
 
 Robot PU “senses” the world using a mix of:
 
 - micro:bit built-in sensors (IMU, buttons, microphone)
 - Robot PU add-on sensors (ultrasonic sonar)
 
 This lesson shows which sensor APIs you can use and how to build simple observation behaviors.
 
 ---
 
 ## 1. What sensors are available?
 
 ### A. micro:bit motion (IMU)
 
 The micro:bit has an accelerometer (and magnetometer depending on board/runtime). In MakeCode you can read motion using:
 
 - `input.isGesture(Gesture.FreeFall)`
 - `input.isGesture(Gesture.Shake)`
 - `input.rotation(Rotation.Roll)` / `input.rotation(Rotation.Pitch)`
 
 Robot PU internally uses **FreeFall** detection as part of its safety behavior (see the `updateStates()` logic in the extension).
 
 ### B. micro:bit buttons
 
 - `input.onButtonPressed(Button.A, ...)`
 - `input.onButtonPressed(Button.B, ...)`
 - `input.onButtonPressed(Button.AB, ...)`
 
 Buttons are useful for manual control / testing.
 
 ### C. micro:bit microphone (sound level)
 
 - `input.soundLevel()` returns 0–255
 
 Robot PU uses sound level in some behaviors (for example, some dance/rest behaviors react to audio).
 
 ### D. Ultrasonic sonar (distance)
 
 Robot PU includes an HCSR04 ultrasonic sensor interface.
 
 In this extension, you can read it using:
 
 - `robotPu.sonarDistanceCm()`
 
 Wiring note (default pins used by the extension):
 
 - Trigger: `P2`
 - Echo: `P8`
 
 ---
 
 ## 2. Example: show sonar distance on the LED display
 
 ```typescript
 basic.forever(function () {
     const cm = robotPu.sonarDistanceCm()
     basic.showNumber(Math.round(cm))
     basic.pause(200)
 })
 ```
 
 ---
 
 ## 3. Example: obstacle stop / backup (sonar)
 
 This is a simple reactive behavior:
 
 - If something is too close, stop and back up / turn
 - Otherwise, keep walking forward
 
 ```typescript
 basic.forever(function () {
     const cm = robotPu.sonarDistanceCm()
 
     if (cm > 0 && cm < 20) {
         // Too close: turn away
         for (let i = 0; i < 200; i++) {
             robotPu.walk(-2, 0)
         }
         for (let i = 0; i < 200; i++) {
             robotPu.walk(2, 0.8)
         }
     } else {
         // Clear: walk forward
         robotPu.walk(2, 0)
     }
 })
 ```
 
 Notes:
 
 - `robotPu.walk(...)` is an action that advances when you call it repeatedly.
 - Sonar readings can be noisy; consider averaging if you see jitter.
 
 ---
 
 ## 4. Example: fall / free-fall safety response (IMU)
 
 The micro:bit can detect a free-fall gesture.
 
 You can use this to stop movement and return to a safe pose:
 
 ```typescript
 basic.forever(function () {
     if (input.isGesture(Gesture.FreeFall)) {
         // Try to stop motion and recover pose
         for (let i = 0; i < 200; i++) {
             robotPu.stand()
         }
     } else {
         robotPu.walk(2, 0)
     }
 })
 ```
 
 ---
 
 ## 5. Example: clap to jump (microphone)
 
 ```typescript
 basic.forever(function () {
     const s = input.soundLevel()
     if (s > 140) {
         // One jump (call repeatedly until you see completion boundaries)
         for (let i = 0; i < 200; i++) {
             robotPu.jump()
         }
     }
 })
 ```
 
 ---
 
 ## 6. Summary
 
 - Use `robotPu.sonarDistanceCm()` to measure distance in cm.
 - Use `input.isGesture(...)` and `input.rotation(...)` for motion sensing.
 - Use `input.soundLevel()` for sound-reactive behaviors.
 - Use buttons for simple manual triggers during testing.

