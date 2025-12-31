 # 🎮 Lesson: Gamepad control for Robot PU (micro:bit radio controller)
 
 ## Introduction
 
 This lesson shows how to use a **second micro:bit as a “gamepad”** to control Robot PU over **radio**.
 
 The controller sends:
 
 - continuous **turn** and **speed** values (like joystick axes)
 - button-like commands (A / B / AB / Logo and external buttons on pins)
 - optional text phrases chosen by tilting the micro:bit
 
 The Robot PU side listens for these radio messages and translates them into motion or actions.
 
 ## Problem definition
 
 When Robot PU is moving, it’s inconvenient to reflash code for every behavior change.
 
 We want:
 
 - a handheld controller that can steer Robot PU in real time
 - a simple, reliable message format
 - a way to select a radio channel (group) so multiple robots can be controlled independently
 
 ## Basic idea of solutions
 
 - **Radio as the control link**
   - the controller sends `radio.sendValue(key, value)` and `radio.sendString(text)`.
 - **Two analog axes** from external analog inputs
   - P1 and P2 are read repeatedly and mapped into normalized values.
 - **Discrete buttons** from:
   - micro:bit buttons A/B/AB
   - external buttons wired to P8/P13/P14/P15/P16 using `pins.onPulsed(...)`
 
## Implementation
 
Flash this program to the **controller micro:bit** (not Robot PU).

```typescript
pins.onPulsed(DigitalPin.P16, PulseValue.High, function () {
    radio.sendValue("#puB", 4)
})
pins.onPulsed(DigitalPin.P13, PulseValue.High, function () {
    radio.sendValue("#puB", 1)
})
function add_content () {
    sentences = [
    [
    "Thank you!",
    "Nice to meet you!",
    "please",
    "your are welcomed"
    ],
    [
    "yes!",
    "possible",
    "I am not sure.",
    "no!"
    ],
    [
    "How are you?",
    "What is your name",
    "My name is Pe you",
    "Good Bye"
    ],
    [
    "Good Morning",
    "Good afternoon",
    "Good night",
    "Happy Birthday!"
    ]
    ]
}
pins.onPulsed(DigitalPin.P14, PulseValue.High, function () {
    radio.sendValue("#puB", 2)
})
input.onButtonPressed(Button.A, function () {
    radio.sendValue("#puA", 1)
    channel += 1
    if (channel > 255) {
        channel = 0
    }
    radio.setGroup(channel)
    basic.showNumber(channel - hidden)
})
pins.onPulsed(DigitalPin.P15, PulseValue.High, function () {
    radio.sendValue("#puB", 3)
})
input.onButtonPressed(Button.AB, function () {
    basic.showNumber(channel)
    radio.sendValue("#puAB", 1)
    radio.sendString("#pun" + name)
    basic.showString(name)
    basic.showNumber(channel - hidden)
})
radio.onReceivedString(function (receivedString) {
    if (receivedString == "#puack") {
        ack_count += 1
    }
})
input.onButtonPressed(Button.B, function () {
    radio.sendValue("#puB", 1)
    channel += -1
    if (channel < 0) {
        channel = 255
    }
    radio.setGroup(channel)
    basic.showNumber(channel - hidden)
})
pins.onPulsed(DigitalPin.P8, PulseValue.High, function () {
    radio.sendValue("#puB", 0)
    cmd_count += 1
})
function init_radio () {
    hidden = 160
    radio.setGroup(channel)
    basic.showNumber(channel - hidden)
}
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    r = Math.round((input.rotation(Rotation.Pitch) + 40) / 20)
    c = Math.round((input.rotation(Rotation.Roll) + 40) / 20)
    if (r >= 0 && r < sentences.length && (c >= 0 && c < sentences[0].length)) {
        pick_words(r, c)
        radio.sendString("#put" + my_word)
    } else {
        radio.sendValue("#pulogo", 1)
    }
})
function Init_robot () {
    init_radio()
    add_content()
    ack_count = 1
    cmd_count = 1
    basic.pause(2000)
    init_buttons()
}
function init_buttons () {
    pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
}
function pick_words (row: number, column: number) {
    my_word = sentences[row][column]
}
let y = 0
let x = 0
let my_word = ""
let c = 0
let r = 0
let cmd_count = 0
let ack_count = 0
let hidden = 0
let sentences: string[][] = []
let channel = 0
let name = ""
name = "Peu"
channel = 160
Init_robot()
basic.forever(function () {
    x = (512 - pins.analogReadPin(AnalogReadWritePin.P2)) / 512
    y = (512 - pins.analogReadPin(AnalogReadWritePin.P1)) / 512
    radio.sendValue("#puturn", x)
    radio.sendValue("#puspeed", y)
    radio.sendValue("#pupitch", input.rotation(Rotation.Pitch))
    radio.sendValue("#puroll", input.rotation(Rotation.Roll))
    basic.pause(20)
})

```