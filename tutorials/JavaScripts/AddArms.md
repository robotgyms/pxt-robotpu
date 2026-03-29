# Add Arms (4-Servo Upgrade)

## Goal

Add simple **up/down arms** to Robot PU using **4 servos**:

- 2 servos on the Robot PU servo controller (**I2C bus**) using **5V** (strong)
- 2 servos connected directly to the micro:bit on **P14** and **P15** using **3.3V** (weaker)

If your expansion board provides a separate **5V servo power source**, you can optionally re-wire the P14/P15 servos to use 5V (recommended for stronger arms).

## Example project

This tutorial is based on:

https://makecode.microbit.org/_8Pef1oJxcL8M

## Hardware / wiring

### I2C servos (Reserve joints)

Use the Robot PU servo controller outputs:

- `robotPu.ServoJoint.Reserve1`
- `robotPu.ServoJoint.Reserve2`

These are powered by the board’s servo supply (typically 5V).

### Pin servos (micro:bit)

Connect the other two servos to:

- Signal: `P14` and `P15`
- Power: micro:bit 3.3V (works but weaker)
- Ground: common ground with the robot

## Code

Paste this into JavaScript in MakeCode.

```javascript
function ArmUp () {
    robotPu.servo(robotPu.ServoJoint.Reserve1, 0)
    robotPu.servo(robotPu.ServoJoint.Reserve2, 180)
    pins.servoWritePin(AnalogPin.P14, 135)
    pins.servoWritePin(AnalogPin.P15, 45)
    robotPu.talk("Up Up Up!")
}

function ArmDown () {
    robotPu.servo(robotPu.ServoJoint.Reserve1, 180)
    robotPu.servo(robotPu.ServoJoint.Reserve2, 0)
    pins.servoWritePin(AnalogPin.P14, 45)
    pins.servoWritePin(AnalogPin.P15, 135)
    robotPu.talk("Done Done Done!")
}

function RestArm () {
    robotPu.servo(robotPu.ServoJoint.Reserve1, 90)
    robotPu.servo(robotPu.ServoJoint.Reserve2, 90)
    pins.servoWritePin(AnalogPin.P14, 0)
    pins.servoWritePin(AnalogPin.P15, 180)
}

radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})

radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

robotPu.setServoTrim(
    0,
    0,
    0,
    0,
    0,
    0
)

RestArm()
music.setVolume(255)
basic.pause(2000)

basic.forever(function () {
    ArmDown()
    basic.pause(1000)
    ArmUp()
    basic.pause(1000)
})
```

## Test

- Flash the program.
- The arms should alternate down/up every second.
- If the pin-driven servos are too weak, use a 5V servo supply (with a shared ground) if your hardware supports it.
