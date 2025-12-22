// Example usage program for RobotPU
RobotPU.init("auto", "peu")

input.onButtonPressed(Button.A, function () {
    // Walk forward a bit when A is pressed
    RobotPU.walk(2, 0)
})

input.onButtonPressed(Button.B, function () {
    // Rest when B is pressed
    RobotPU.rest()
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // Dance when logo is pressed
    RobotPU.dance()
})

// Explore autonomously in the background
basic.forever(function () {
    RobotPU.explore()
})
