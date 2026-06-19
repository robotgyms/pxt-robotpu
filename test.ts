/**
 * Robot PU Extension Test Suite
 *
 * HOW TO TEST:
 *   Flash this file to a Robot PU micro:bit. Each button/gesture triggers one test group.
 *   Observe the robot behavior and/or the micro:bit LED display for results.
 *   Tests marked [SIMULATOR SAFE] do not require physical servos and will not throw errors in the simulator.
 *   Tests marked [HARDWARE] require a real Robot PU with servos connected.
 *
 * PASS CRITERIA:
 *   Each test prints a number on the LED display when it starts.
 *   The robot performs the expected motion or the expected value is returned.
 *   No runtime errors or crashes occur.
 */

// ── Setup ──────────────────────────────────────────────────────────────────

/**
 * TEST: Setup - channel, setChannel, changeChannel, mode, setModeVar
 * [SIMULATOR SAFE]
 * Expected: channel shows 166, then increments to 167, then decrements to 166.
 *           mode returns API after setModeVar(API).
 * Pass: LED shows 166, then 167, then 166, no crash.
 */
function testSetup() {
    robotPu.setChannel(166)
    basic.showNumber(robotPu.channel())    // expect 166
    basic.pause(500)
    robotPu.changeChannel(1)
    basic.showNumber(robotPu.channel())    // expect 167
    basic.pause(500)
    robotPu.changeChannel(-1)
    basic.showNumber(robotPu.channel())    // expect 166
    basic.pause(500)
    robotPu.setModeVar(robotPu.Mode.API)
    basic.showNumber(robotPu.mode())       // expect 6 (API)
    basic.pause(500)
    robotPu.setMode(robotPu.Mode.Rest)
    basic.showNumber(robotPu.mode())       // expect 0 (Rest)
    basic.pause(500)
}

/**
 * TEST: Setup - setServoTrim, saveServoTrimCalibration, readConfig, writeConfig
 * [HARDWARE] Robot should stand straight after trim is applied.
 * Expected: robot moves to calibration pose, trims saved, no crash on readConfig/writeConfig.
 * Pass: robot stands level, LED shows "T".
 */
function testTrimAndConfig() {
    robotPu.setServoTrim(0, 0, 0, 0, 0, 0)
    robotPu.toggleServoTrim()
    basic.pause(1000)
    robotPu.toggleServoTrim()
    robotPu.saveServoTrimCalibration()
    robotPu.writeConfig()
    robotPu.readConfig()
    basic.showString("T")
}

/**
 * TEST: Setup - eyeBrightness, setEyeBrightness
 * [HARDWARE] Eyes should dim then brighten.
 * Expected: eyes fade to 0.1 then back to 0.8.
 * Pass: visible eye brightness change, no crash.
 */
function testEyeBrightness() {
    robotPu.setEyeBrightness(0.1)
    basic.pause(500)
    robotPu.setEyeBrightness(0.8)
    basic.pause(500)
    robotPu.setEyeBrightness(0.5)
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * TEST: Actions - greet, talk, sing
 * [HARDWARE] Billy voice synthesizer required.
 * Expected: robot speaks its name, says "Hello", sings a scale.
 * Pass: audible speech and melody, no crash.
 */
function testVoice() {
    robotPu.greet()
    basic.pause(1000)
    robotPu.talk("Hello!")
    basic.pause(1000)
    robotPu.sing("C D E F G ")
}

/**
 * TEST: Actions - stand, rest, calibrate
 * [HARDWARE]
 * Expected: robot moves to standing pose, then rests, then returns to calibration position.
 * Pass: visible pose transitions, no crash.
 */
function testStandRestCalibrate() {
    for (let i = 0; i < 100; i++) { robotPu.standDo() }
    basic.pause(500)
    for (let i = 0; i < 100; i++) { robotPu.restDo() }
    basic.pause(500)
    robotPu.calibrate()
}

/**
 * TEST: Actions - walk (forward, backward, turn)
 * [HARDWARE]
 * Expected: robot walks forward 2 seconds, backward 2 seconds, turns right 2 seconds.
 * Pass: visible walking motion in correct directions, no crash.
 */
function testWalk() {
    for (let i = 0; i < 200; i++) { robotPu.walkDo(2, 0) }
    basic.pause(200)
    for (let i = 0; i < 200; i++) { robotPu.walkDo(-2, 0) }
    basic.pause(200)
    for (let i = 0; i < 200; i++) { robotPu.walkDo(2, 1) }
}

/**
 * TEST: Actions - sideStep (left and right)
 * [HARDWARE]
 * Expected: robot steps left then right.
 * Pass: visible sideways motion, no crash.
 */
function testSideStep() {
    for (let i = 0; i < 100; i++) { robotPu.sideStepDo(-1) }
    basic.pause(200)
    for (let i = 0; i < 100; i++) { robotPu.sideStepDo(1) }
}

/**
 * TEST: Actions - jump, kick, dance
 * [HARDWARE]
 * Expected: robot jumps, kicks, then dances to ambient sound.
 * Pass: visible jump and kick motions, dance reacts to sound, no crash.
 */
function testJumpKickDance() {
    for (let i = 0; i < 50; i++) { robotPu.jumpDo() }
    basic.pause(200)
    for (let i = 0; i < 50; i++) { robotPu.kickDo() }
    basic.pause(200)
    for (let i = 0; i < 100; i++) { robotPu.danceDo() }
}

/**
 * TEST: Actions - explore (autonomous obstacle avoidance)
 * [HARDWARE] sonar sensor required.
 * Expected: robot navigates around obstacles for 3 seconds.
 * Pass: robot moves and avoids obstacles, no crash.
 */
function testExplore() {
    robotPu.setMode(robotPu.Mode.Explore)
    basic.pause(3000)
    robotPu.setMode(robotPu.Mode.API)
}

/**
 * TEST: Actions - walkByCompass (compass heading 0 = north)
 * [HARDWARE] compass calibration required.
 * Expected: robot walks toward north heading for 2 seconds.
 * Pass: robot walks, no crash.
 */
function testWalkByCompass() {
    for (let i = 0; i < 200; i++) {
        robotPu.walkByCompass(0)
        basic.pause(10)
    }
}

/**
 * TEST: Actions - walkByCompassPID
 * [HARDWARE] compass calibration required.
 * Expected: robot walks toward north heading using PID control for 2 seconds.
 * Pass: robot walks with heading correction, no crash.
 */
function testWalkByCompassPID() {
    for (let i = 0; i < 200; i++) {
        robotPu.walkByCompassPID(0, 0.02, 0.0005, 0)
        basic.pause(10)
    }
}

/**
 * TEST: Actions - playToneSequenceMs
 * [SIMULATOR SAFE]
 * Expected: plays a three-note sequence: A4, C5, E5, each 200ms. Rest in between.
 * Pass: audible three-note melody, no crash.
 */
function testPlayTones() {
    robotPu.playToneSequenceMs([440, 0, 523, 0, 659], [200, 100, 200, 100, 200])
}

// ── Actuators ──────────────────────────────────────────────────────────────

/**
 * TEST: Actuators - servo (direct angle control)
 * [HARDWARE]
 * Expected: head yaw servo moves to 60 degrees, pauses, then returns to 90 degrees.
 * Pass: visible head turn, no crash.
 */
function testServo() {
    robotPu.servo(robotPu.ServoJoint.HeadYaw, 60)
    basic.pause(500)
    robotPu.servo(robotPu.ServoJoint.HeadYaw, 90)
}

/**
 * TEST: Actuators - servoStep and servoStepStatus
 * [HARDWARE]
 * Expected: head pitch servo smoothly steps to 120 degrees, then back to 90.
 * Pass: smooth head pitch motion, servoStepStatus returns 1 while moving and 0 when arrived, no crash.
 */
function testServoStep() {
    robotPu.setModeVar(robotPu.Mode.API)
    for (let i = 0; i < 60; i++) {
        robotPu.servoStep(robotPu.ServoJoint.HeadPitch, 120, 2)
        basic.pause(20)
    }
    let status = 1
    while (status != 0) {
        status = robotPu.servoStepStatus(robotPu.ServoJoint.HeadPitch, 90, 2)
        basic.pause(20)
    }
}

/**
 * TEST: Actuators - moveServos (multi-servo pose)
 * [HARDWARE]
 * Expected: robot moves to a spread-arms pose over 2 seconds using synchronized leg and async arm/head control.
 * Pass: smooth pose transition, no crash.
 */
function testMoveServos() {
    robotPu.setModeVar(robotPu.Mode.API)
    const pose = [90, 90, 90, 90, 120, 105, 90, 90, 0, 180]
    const speed = [2, 2, 2, 2, 5, 5, 6, 6, 6, 6]
    for (let i = 0; i < 100; i++) {
        robotPu.moveServos(pose, speed, [0, 1, 2, 3], 1, [4, 5, 6, 7, 8, 9], 1)
        basic.pause(20)
    }
}

/**
 * TEST: Actuators - setCt and incrCt (control offsets)
 * [HARDWARE]
 * Expected: applies a +10 degree offset to head yaw, then increments by -5.
 *           Head should visibly shift. Offsets reset to 0 after test.
 * Pass: visible head shift, no crash.
 */
function testControlOffsets() {
    robotPu.setCt([4], [10])
    basic.pause(500)
    robotPu.incrCt([4], [-5], 1)
    basic.pause(500)
    robotPu.setCt([4], [0])
}

/**
 * TEST: Actuators - leftEyeBright and rightEyeBright
 * [HARDWARE]
 * Expected: left eye dims to 0.05, right eye brightens to 0.9, then both set to 0.5.
 * Pass: visible eye brightness change per eye, no crash.
 */
function testEyes() {
    robotPu.leftEyeBright(0.05)
    robotPu.rightEyeBright(0.9)
    basic.pause(500)
    robotPu.leftEyeBright(0.5)
    robotPu.rightEyeBright(0.5)
}

// ── Sensors ────────────────────────────────────────────────────────────────

/**
 * TEST: Sensors - sonarDistanceCm, sonarScan
 * [HARDWARE] sonar sensor required.
 * Expected: sonarScan updates the reading. sonarDistanceCm returns a value > 0.
 *           LED shows the distance in cm (capped display).
 * Pass: non-zero distance displayed, no crash.
 */
function testSonar() {
    robotPu.sonarScan()
    const dist = robotPu.sonarDistanceCm()
    basic.showNumber(Math.min(dist, 99))
}

/**
 * TEST: Sensors - bodyRoll, bodyPitch
 * [HARDWARE] accelerometer required (works in simulator too).
 * Expected: displays roll then pitch. Tilt the robot to see values change.
 * Pass: non-zero values when tilted, no crash.
 */
function testBodyTilt() {
    basic.showNumber(Math.round(robotPu.bodyRoll()))
    basic.pause(500)
    basic.showNumber(Math.round(robotPu.bodyPitch()))
}

/**
 * TEST: Sensors - musicTempo
 * [SIMULATOR SAFE]
 * Expected: returns a number (may be 0 in silence). No crash.
 * Pass: function returns without error, LED shows value.
 */
function testMusicTempo() {
    basic.showNumber(robotPu.musicTempo())
}

/**
 * TEST: Sensors - servoTargets, servoControls, servoTrims
 * [SIMULATOR SAFE]
 * Expected: each returns an array of 10 numbers. LED shows first item of each array.
 * Pass: arrays have 10 items, first item is a valid angle, no crash.
 */
function testServoArrays() {
    const targets = robotPu.servoTargets()
    const controls = robotPu.servoControls()
    const trims = robotPu.servoTrims()
    basic.showNumber(targets.length)    // expect 10
    basic.pause(300)
    basic.showNumber(controls.length)   // expect 10
    basic.pause(300)
    basic.showNumber(trims.length)      // expect 10
}

/**
 * TEST: Sensors - frontDistanceArray
 * [HARDWARE] sonar required.
 * Expected: returns a 5-element array. LED shows first element (left distance in cm).
 * Pass: array has 5 items, values > 0 in open space, no crash.
 */
function testFrontDistanceArray() {
    robotPu.sonarScan()
    const d = robotPu.frontDistanceArray()
    basic.showNumber(d.length)          // expect 5
    basic.pause(300)
    basic.showNumber(Math.min(d[2], 99))   // front distance
}

/**
 * TEST: Sensors - resetOdom, locationArray
 * [SIMULATOR SAFE]
 * Expected: after resetOdom, locationArray returns [0, 0, 0].
 *           After walking forward, x or y should change.
 * Pass: initial location is [0,0,0], no crash.
 */
function testOdometry() {
    robotPu.resetOdom()
    const loc = robotPu.locationArray()
    basic.showNumber(Math.round(loc[0]))   // expect 0
    basic.pause(300)
    basic.showNumber(Math.round(loc[1]))   // expect 0
    basic.pause(300)
    basic.showNumber(Math.round(loc[2]))   // expect 0
}

// ── Remote Control ─────────────────────────────────────────────────────────

/**
 * TEST: Remote Control - runStringCommand
 * [HARDWARE] Billy voice required.
 * Expected: robot speaks "Hi", then sings "C D E".
 * Pass: audible speech and melody, no crash.
 */
function testRunStringCommand() {
    robotPu.runStringCommand("#putHi")
    basic.pause(1000)
    robotPu.runStringCommand("#pusC D E ")
}

/**
 * TEST: Remote Control - runKeyValueCommand (speed, turn, head)
 * [HARDWARE]
 * Expected: robot walks forward, turns right, tilts head.
 * Pass: visible motion, no crash.
 */
function testRunKeyValueCommand() {
    robotPu.setModeVar(robotPu.Mode.Walk)
    robotPu.runKeyValueCommand("#puspeed", 1)
    basic.pause(500)
    robotPu.runKeyValueCommand("#puturn", 1)
    basic.pause(500)
    robotPu.runKeyValueCommand("#puroll", 30)
    basic.pause(500)
    robotPu.runKeyValueCommand("#pupitch", 20)
    basic.pause(500)
    robotPu.runKeyValueCommand("#puspeed", 0)
    robotPu.setModeVar(robotPu.Mode.API)
}

// ── Radio listeners (always active) ────────────────────────────────────────

radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

// ── Button/gesture test triggers ───────────────────────────────────────────

/**
 * Button A: walk forward then backward.
 * [HARDWARE] Expected: robot walks forward then backward.
 */
input.onButtonPressed(Button.A, function () {
    basic.showNumber(1)
    testWalk()
})

/**
 * Button B: side step left then right.
 * [HARDWARE] Expected: robot steps sideways.
 */
input.onButtonPressed(Button.B, function () {
    basic.showNumber(2)
    testSideStep()
})

/**
 * Button A+B: explore autopilot for 3 seconds.
 * [HARDWARE] Expected: robot avoids obstacles autonomously.
 */
input.onButtonPressed(Button.AB, function () {
    basic.showNumber(3)
    testExplore()
})

/**
 * Logo press: run jump, kick, dance sequence.
 * [HARDWARE] Expected: jump, kick, then dance.
 */
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    basic.showNumber(4)
    testJumpKickDance()
})

/**
 * Shake: run setup tests (channel, mode, eye brightness).
 * [SIMULATOR SAFE] Expected: LED shows channel and mode values.
 */
input.onGesture(Gesture.Shake, function () {
    basic.showNumber(5)
    testSetup()
    testEyeBrightness()
})

/**
 * Tilt left: run sensor tests (sonar, tilt, servo arrays, odometry).
 * [HARDWARE/SIMULATOR] Expected: values shown on LED display.
 */
input.onGesture(Gesture.TiltLeft, function () {
    basic.showNumber(6)
    testSonar()
    testBodyTilt()
    testMusicTempo()
    testServoArrays()
    testFrontDistanceArray()
    testOdometry()
})

/**
 * Tilt right: run actuator tests (servo, eyes, control offsets).
 * [HARDWARE] Expected: visible servo and eye changes.
 */
input.onGesture(Gesture.TiltRight, function () {
    basic.showNumber(7)
    testServo()
    testServoStep()
    testEyes()
    testControlOffsets()
})

/**
 * Logo up: run voice and tone tests.
 * [HARDWARE] Expected: audible speech and melody.
 */
input.onGesture(Gesture.LogoUp, function () {
    basic.showNumber(8)
    testVoice()
    testPlayTones()
})

/**
 * Screen down: run remote control command tests.
 * [HARDWARE] Expected: robot responds to commands as if from radio.
 */
input.onGesture(Gesture.ScreenDown, function () {
    basic.showNumber(9)
    testRunStringCommand()
    testRunKeyValueCommand()
})

// ── Initialization ─────────────────────────────────────────────────────────

function initSound() {
    music.setVolume(255)
    music.play(music.createSoundExpression(WaveShape.Square, 400, 600, 255, 0, 200, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
}

input.setSoundThreshold(SoundThreshold.Loud, 184)
initSound()
robotPu.setChannel(166)
robotPu.greet()
robotPu.standDo()
robotPu.sing("C5 B G - E F E G ")
