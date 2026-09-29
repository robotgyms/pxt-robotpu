 
 # 🦿 Robot PU: Servo Trim Calibration (Make Walking More Stable)
 
 Servo trim calibration is the fastest way to make Robot PU:
 
 - stand more level
 - walk straighter
 - wobble less
 - put **less stress** on the balancing algorithm (and on the servos)
 
 Robot PU’s walking is self-balancing using IMU feedback (roll/pitch). If the legs/feet are mechanically biased (slightly off-center), the controller must constantly correct even when you want a neutral pose. Calibrating trims reduces that baseline bias.
 
 Refer to YouTube https://youtu.be/nAJljRopqxY for more details.
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
 
 ## Calibration helper program
 
 By adding this code section to every program that uses Robot PU, you can calibrate the servos at any time. The logo button enters and exits trim mode, and the radio forwarding lets the gamepad buttons (`B1`–`B4`) reach the robot.
 
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
 ```
 
 For example, in this barebone program:
 
 - Forwards gamepad commands to Robot PU (`runKeyValueCommand`).
 - Pressing the micro:bit **logo button on Robot PU’s head** (not the gamepad) toggles trim mode (`robotPuPro.toggleServoTrim()`).
 - Prints the trim array over serial so you can record your final numbers.
 
 ```typescript
  // Robot and gamepad must use the same radio channel.
 robotPuPro.setChannel(166)
 // Forward name/value commands (gamepad buttons, speed, turn, etc.).
 radio.onReceivedValue(function (name, value) {
     robotPuPro.runKeyValueCommand(name, value)
 })
 // Logo button on Robot PU's head: enter or exit trim mode.
 input.onLogoEvent(TouchButtonEvent.Pressed, function () {
     robotPuPro.toggleServoTrim()
 })
 // Print the trim values to serial every 500 ms so you can record them.
 basic.forever(function () {
     serial.writeLine("Servo Trim = " + robotPuPro.servoTrims().join(", "))
     basic.pause(500)
 })
 ```
 The program will print the servo trim values to the serial monitor.
 
 It can be downloaded from https://makecode.microbit.org/_fJpff9K92emh.
 
 Upload this program to the micro:bit in Robot PU's head, and try it out. The gamepad micro:bit needs its controller program too — see [gamepad.md](gamepad.md).
 
 ---
 
 ## Servo calibration / trim mode (detailed steps)
 
 Robot PU includes a built-in servo calibration / trim mode. Use it to align any of the 10 servos (feet, legs, head, shoulders, arms) into a neutral standing position.
 
 1. **Enter trim mode**
    - Press the micro:bit **logo button on Robot PU’s head** (not the gamepad).
    - PU moves into a calibration stand pose so the foot heels can be aligned.
    - While in trim mode, normal actions pause until you exit — PU won’t walk or dance.
 2. **Select which servo to trim**
    - Press gamepad `B2` to move to the next servo.
    - Press gamepad `B3` to move to the previous servo.
    - The selected servo number (1–10) is shown on the micro:bit display.
 3. **Adjust the selected trim**
    - Press gamepad `B1` to decrease the selected trim by 1°.
    - Press gamepad `B4` to increase the selected trim by 1°.
    - Each press re-applies the calibration pose so you see the servo move, and prints the new `trims:` line over serial.
    - Keep adjusting until the stance looks neutral.
 4. **Save and exit**
    - Press the **logo button on Robot PU’s head** again.
    - The current servo trims, radio channel, and serial number are saved to flash, and PU returns to rest.
    - To exit **without** saving, press the gamepad **stop** button (the one that sends `#puB` value `0`) or just power PU off.
 
 > Note: wait about 1 second between logo presses — the toggle pauses briefly to avoid double-toggling.
 
 The number shown on the display and the servo it selects:
 
 | Displayed | Servo index | Joint          |
 | --------- | ----------- | -------------- |
 | 1         | 0           | Left foot      |
 | 2         | 1           | Left leg       |
 | 3         | 2           | Right foot     |
 | 4         | 3           | Right leg      |
 | 5         | 4           | Head yaw       |
 | 6         | 5           | Head pitch     |
 | 7         | 6           | Left shoulder  |
 | 8         | 7           | Right shoulder |
 | 9         | 8           | Left arm       |
 | 10        | 9           | Right arm      |
 
 ---
 
 ## Practical checklist (what “neutral” should look like)
 
 - Feet sit flat on the ground (not rocking on toe/heel).
 - Legs look symmetric (no obvious twist).
 - In a stand pose, PU doesn’t look like he’s constantly correcting left/right.
 - When walking forward slowly, PU doesn’t consistently drift in one direction.
 
 ---
 
 ## Tuning tips
 
 - Adjust trims in small steps (each gamepad press is exactly 1°), then re-check.
 - Calibrate feet/legs first; head trims don’t affect walking stability much.
 - After saving, do a slow walk test (lower speed is easier to diagnose).
 - If the robot still yaws/drifts, re-check that both feet are flat and both legs are symmetric.
 - Trims are added to every servo target in every gait — good trims also improve dancing, skating, and kicking, not just walking.
 - There is no “reset trims” block: to start over, set all trims to `0` with `setServoTrim()` and save again.
 
 ---
 
 ## Setting and saving trims by code
 
 Instead of using the gamepad trim mode, you can also set the trim offsets directly in your program. This is useful when you already know the values for your robot (for example, from the serial output of the calibration helper above).
 
 ```typescript
 // Set the trim values for the leg and head joints (servo indices 0–5).
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.LeftFoot, 4)
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.LeftLeg, 0)
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.RightFoot, 4)
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.RightLeg, 0)
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.HeadYaw, -8)
 robotPuPro.setServoTrim(robotPuPro.ServoJoint.HeadPitch, 0)
 
 // Save the in-memory trims to MakeCode flash storage.
 // Next time the robot boots, these values are loaded automatically.
 robotPuPro.saveServoTrimCalibration()
 ```
 
 `robotPuPro.setServoTrim(joint, value)` overwrites the trim for one joint in memory. `robotPuPro.saveServoTrimCalibration()` writes all current trims to flash so they are restored on the next boot.
 
 Saved values live in MakeCode flash settings under `robotpu.trim.0` … `robotpu.trim.9`, alongside `robotpu.group` (radio channel) and `robotpu.sn` (serial/name). They are loaded automatically by `readConfig()` at boot.