# Make robot PU do Kungfu

```typescript
// set servo trims
robotPu.setServoTrim(-5, -2, -5, 7, -8, 0)

// allow gamepad remote control
radio.onReceivedValue(function(name: string, value: number) {
    robotPu.runKeyValueCommand(name,value)
})

// allow robots to exchange information for group activities
radio.onReceivedString(function(receivedString: string) {
    robotPu.runStringCommand(receivedString)
})
// trigger servo calibration by gamepad 
input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    robotPu.toggleServoTrim()
})

// increase radio channel
input.onButtonPressed(Button.A, function() {
    robotPu.changeChannel(1)
})
// decrease radio channel 
input.onButtonPressed(Button.B, function () {
    robotPu.changeChannel(-1)
})

// set robot to API mode to avoid autonouse actions and AI Actions
robotPu.setModeVar(robotPu.Mode.API)

// set Kungfu Speed 
let kungfuSpeed = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [2, 1, 2, 1, 3, 3, 4, 4, 4, 4]]

// set Kungfu Gaits
let kungfuGaits = [[90,90,90,90,90,90,90,90,90,90],
                    [120, 90, 60, 90, 60, 60, 0, 180, 90, 90],
                    [90,  90, 90, 90, 120, 105, 90, 90, 0, 180]]

// set default gait selection                  
let currentGait = kungfuGaits[0]
let currentSpeed = kungfuSpeed[0]

// action engine
basic.forever(function () {
    robotPu.moveServos(currentGait, currentSpeed, [0, 1, 2, 3], 1, [4, 5, 6, 7, 8, 9], 1)
    basic.pause(10)
})

// useer selection of kungfu routines
basic.forever(function () {
    currentGait = kungfuGaits[0]
    currentSpeed = kungfuSpeed[0]
    basic.pause(1000)
    currentGait = kungfuGaits[1]
    currentSpeed = kungfuSpeed[1]
    basic.pause(1000)
    currentGait = kungfuGaits[2]
    currentSpeed = kungfuSpeed[1]
    basic.pause(1000)
})

```