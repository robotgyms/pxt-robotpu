
 # 🦿 Robot PU: Servo Trim Calibration (Make Walking More Stable)
 
 Servo trim calibration is the fastest way to make Robot PU:
 
 - stand more level
 - walk straighter
 - wobble less
 - put **less stress** on the balancing algorithm (and on the servos)
 
 Robot PU’s walking is self-balancing using IMU feedback (roll/pitch). If the legs/feet are mechanically biased (slightly off-center), the controller must constantly correct even when you want a neutral pose. Calibrating trims reduces that baseline bias.
 
 ---
 
 ## What is “servo trim”?
 
 A **servo trim** is a small angle offset (in degrees) that is added to a servo target.
 
 - If you command a joint to `90°`, but the horn is mounted a little off, the joint might not be truly centered.
 - A trim like `-5` or `+3` compensates so that the robot’s pose becomes centered.
 
 Trims are especially important for legs/feet because even a few degrees of error can make the robot lean, twist, scrape a foot, or drift while walking.
 
 ---
 
 ## Why trim improves walking + reduces balance “stress”
 
 The balance logic is designed to correct *disturbances* (bumps, momentum), not permanent mechanical bias.
 
 When trims are wrong:
 
 - the robot starts each step already tilted
 - corrective offsets become larger and more frequent
 - gait timing becomes asymmetric
 
 When trims are correct:
 
 - the neutral stand pose is closer to true neutral
 - the controller applies smaller corrections
 - walking becomes smoother and more repeatable
 
 ---
 
 ## Servo calibration / trim mode (detailed steps)
 
 Robot PU includes a built-in servo calibration / trim mode. Use it to align the feet, legs, head yaw, and head pitch into a neutral standing position.
 
 1. **Enter trim mode**
    - Press the micro:bit **logo button on Robot PU’s head** (not the gamepad).
    - PU moves into a calibration stand pose so the foot heels can be aligned.
 2. **Select which servo to trim**
    - Press gamepad `B2` to decrease the servo index.
    - Press gamepad `B3` to increase the servo index.
    - The selected servo index is shown on the micro:bit display.
 3. **Adjust the selected trim**
    - Press gamepad `B1` to move the selected servo one trim step in one direction.
    - Press gamepad `B4` to move the selected servo one trim step in the other direction.
    - Keep adjusting until the stance looks neutral.
 4. **Save and exit**
    - Press the **logo button on Robot PU’s head** again.
    - The current servo trims are saved.
    - The current radio channel is also saved.
 
 The servo index order is:
 
 1. Left foot
 2. Left leg
 3. Right foot
 4. Right leg
 5. Head yaw
 6. Head pitch
 
 ---
 
 ## Practical checklist (what “neutral” should look like)
 
 - Feet sit flat on the ground (not rocking on toe/heel).
 - Legs look symmetric (no obvious twist).
 - In a stand pose, PU doesn’t look like he’s constantly correcting left/right.
 - When walking forward slowly, PU doesn’t consistently drift in one direction.
 
 ---
 
 ## Calibration helper program (tested)
 
 This program:
 
 - Forwards radio commands to Robot PU (`runStringCommand` / `runKeyValueCommand`).
 - Pressing the micro:bit **logo button on Robot PU’s head** (not the gamepad) toggles trim mode (`robotPuPro.toggleServoTrim()`).
 - Prints the trim array over serial so you can record your final numbers.
 
 ```javascript
 radio.onReceivedString(function (receivedString) {
     robotPuPro.runStringCommand(receivedString)
 })
 radio.onReceivedValue(function (name, value) {
     robotPuPro.runKeyValueCommand(name, value)
 })
 input.onLogoEvent(TouchButtonEvent.Pressed, function () {
     robotPuPro.toggleServoTrim()
 })
 robotPuPro.setChannel(166)
 basic.forever(function () {
     serial.writeLine("Servo Trim = " + robotPuPro.ServoTrims().join(", "))
     basic.pause(500)
 })
 ```
 The program will print the servo trim values to the serial monitor. 
 
 It can be downloaded from https://makecode.microbit.org/_fJpff9K92emh.

 ---
 
 ## Tuning tips
 
 - Adjust trims in small steps (1–2 degrees), then re-check.
 - Calibrate feet/legs first; head trims don’t affect walking stability much.
 - After saving, do a slow walk test (lower speed is easier to diagnose).
 - If the robot still yaws/drifts, re-check that both feet are flat and both legs are symmetric.
```