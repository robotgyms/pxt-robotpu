// Compile-time smoke tests for RobotPU blocks
// These calls should type-check in the MakeCode environment
RobotPU.init("auto", "peu")

// press button A to walk forware in circles
input.onButtonPressed(Button.A, function () {
    for (let index = 0; index < 400; index++) {
        RobotPU.walk(3, -0.3)
    }
});

//press button B to walk forware in circles
input.onButtonPressed(Button.B, function () {
    for (let index = 0; index < 400; index++) {
        RobotPU.walk(-1, -0.3)
    }
});

//press button A+B to walk forware in circles
input.onButtonPressed(Button.AB, function () {
    for (let index = 0; index < 1000; index++) {
        RobotPU.explore()
    }
});

// press logo button to dance
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 1000; index++) {
        RobotPU.dance()
    }
})

// face down to talk
input.onGesture(Gesture.ScreenDown, function () {
    RobotPU.talk("PUt me down")
})

//
input.onGesture(Gesture.TiltLeft, function () {
    RobotPU.kick()
})

input.onGesture(Gesture.TiltRight, function () {
    RobotPU.jump()
})

input.onGesture(Gesture.LogoDown, function () {
    RobotPU.rest()
})

input.onGesture(Gesture.LogoDown, function () {
    //RobotPU.sing("#70REYY")
    RobotPU.talk("Help Me")
})

input.onGesture(Gesture.LogoUp, function () {
    RobotPU.sing("E D G F B A C5 B ")
})

// Register the event listener for incoming string messages
radio.onReceivedString(function (receivedString: string) {
    RobotPU.runStrCMD(receivedString)
});

// 2. Use it inside the Radio Event
radio.onReceivedValue(function (name: string, value: number) {
    RobotPU.runKeyValueCMD(name, value)
});

