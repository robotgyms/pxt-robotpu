// press button A to walk forward in circles
input.onButtonPressed(Button.A, function () {
    robotPu.talk("Move forward!")
    for (let index = 0; index < 400; index++) {
        robotPu.walk(3, -0.5)
    }
})
function init_sound () {
    music.setVolume(255)
    music.play(music.createSoundExpression(
        WaveShape.Square,
        400,
        600,
        255,
        0,
        200,
        SoundExpressionEffect.Warble,
        InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
        WaveShape.Square,
        400,
        600,
        255,
        0,
        200,
        SoundExpressionEffect.Warble,
        InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
        WaveShape.Square,
        400,
        600,
        255,
        0,
        200,
        SoundExpressionEffect.Warble,
        InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
        WaveShape.Square,
        400,
        600,
        255,
        0,
        150,
        SoundExpressionEffect.Warble,
        InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
    music.play(music.createSoundExpression(
        WaveShape.Noise,
        54,
        54,
        255,
        0,
        500,
        SoundExpressionEffect.None,
        InterpolationCurve.Linear
    ), music.PlaybackMode.InBackground)
}
function scare () {
    robotPu.talk("What is it?")
    music.play(music.createSoundExpression(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    for (let index = 0; index < 50; index++) {
        robotPu.jumpDo()
    }
    basic.pause(5000)
}
// press button A+B to do autopilot
input.onButtonPressed(Button.AB, function () {
    robotPu.talk("Autopilot")
    for (let index = 0; index < 4000; index++) {
        robotPu.explore()
    }
})
// Register the event listener for incoming string messages
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
// press button B to walk backward in circles
input.onButtonPressed(Button.B, function () {
    robotPu.talk("Move backward!")
    for (let index = 0; index < 400; index++) {
        robotPu.walk(-1, -0.5)
    }
})
input.onGesture(Gesture.Shake, function () {
    robotPu.talk("I am here")
    if (randint(0, 1) == 0) {
        music.play(music.createSoundExpression(
            WaveShape.Square,
            400,
            600,
            255,
            0,
            100,
            SoundExpressionEffect.Warble,
            InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
    } else {
        music.play(music.createSoundExpression(
            WaveShape.Sine,
            200,
            600,
            255,
            0,
            150,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
    }
})
// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
// press logo button to dance using set mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    robotPu.talk("Dance!")
    robotPu.setMode(robotPu.Mode.Dance)
})
input.setSoundThreshold(SoundThreshold.Loud, 184)
init_sound()
// Initialize robot by ask it to greet
robotPu.greet()
robotPu.standDo()
robotPu.setChannel(166)
robotPu.sing("C5 B G - E F E G ")
