// Initialize robot by ask it to greet
robotPu.greet()

// press button A to walk forward in circles
input.onButtonPressed(Button.A, function () {
    for (let index = 0; index < 400; index++) {
        robotPu.walk(3, -0.5)
    }
})
// logo up to sing
input.onGesture(Gesture.LogoUp, function () {
    robotPu.sing("E D G F B A C5 B ")
})
// tilt left to kick
input.onGesture(Gesture.TiltLeft, function () {
    robotPu.kick()
})
// face down to talk
input.onGesture(Gesture.ScreenDown, function () {
    robotPu.talk("Put me down")
})
// press button A+B to do autopilot
input.onButtonPressed(Button.AB, function () {
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
    for (let index = 0; index < 400; index++) {
        robotPu.walk(-1, -0.5)
    }
})
// tilt right to jump
input.onGesture(Gesture.TiltRight, function () {
    robotPu.jump()
})
// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
// logo down to rest
input.onGesture(Gesture.LogoDown, function () {
    robotPu.rest()
})
// press logo button to dance using set mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    robotPu.setMode(robotPu.Mode.Dance)
})
