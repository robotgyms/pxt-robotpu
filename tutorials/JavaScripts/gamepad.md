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
    basic.showNumber(channel)
})
pins.onPulsed(DigitalPin.P15, PulseValue.High, function () {
    radio.sendValue("#puB", 3)
})
input.onButtonPressed(Button.AB, function () {
    basic.showNumber(channel)
    radio.sendValue("#puAB", 1)
    radio.sendString("#pun" + name)
    basic.showString(name)
    basic.showNumber(channel)
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
    basic.showNumber(channel)
})
pins.onPulsed(DigitalPin.P8, PulseValue.High, function () {
    radio.sendValue("#puB", 0)
    cmd_count += 1
})
function init_radio () {
    radio.setGroup(channel)
    basic.showNumber(channel)
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

## Technical explanation

### A. What the controller sends (message protocol)

This gamepad controller uses a small “protocol” based on radio keys:

- `#puturn` (number): left/right steering input
- `#puspeed` (number): forward/back speed input
- `#pupitch` (number): current pitch angle of the controller
- `#puroll` (number): current roll angle of the controller
- `#puA`, `#puB`, `#puAB` (number): button events from A/B/AB
- `#pulogo` (number): logo pressed (fallback case)
- `#pun<name>` (string): controller name broadcast
- `#put<phrase>` (string): a phrase chosen by tilting

On the Robot PU program, you typically listen with:

- `radio.onReceivedValue((name, value) => robotPu.runKeyValueCommand(name, value))`
- `radio.onReceivedString((s) => robotPu.runStringCommand(s))`

### B. Continuous steering (20ms loop)

The `basic.forever(...)` loop runs every 20ms, so the controller transmits updates at about **50Hz**.

That’s fast enough to feel responsive, while still leaving CPU time for radio and UI.

### C. Analog input scaling

The code reads:

- P2 → `x` (turn)
- P1 → `y` (speed)

and maps the raw 0–1023 ADC range into a roughly -1..+1 range using:

- `(512 - read) / 512`

If your joystick is centered at a different value, you can calibrate by changing `512` (but this lesson keeps your code as-is).

### D. External buttons on pins

The pin buttons are set to `PullUp`, so they idle HIGH.

When pressed (typically wired to GND), they produce an edge/pulse that triggers `pins.onPulsed(...)` and sends a corresponding `#puB` value.

### E. Tilt-to-phrase grid

Pressing the logo turns pitch/roll into a row/column index into `sentences`.

If the index is valid, it sends:

- `#put` + `my_word`

Otherwise it sends a generic `#pulogo`.

## Testing

### A. Controller sanity check

- Flash this file to the controller micro:bit.
- Press A/B and confirm the displayed channel changes.
- Press AB and confirm it shows `name` and the channel.

### B. Radio output check (receiver micro:bit)

- Flash a simple receiver that prints received values.
- Confirm you see `#puturn` and `#puspeed` updating repeatedly.

### C. Robot PU integration

- Set Robot PU to the same radio group as the controller.
- Move the analog controls and verify Robot PU turns and changes speed.
- Press pin buttons and confirm Robot PU reacts (depending on how you map `#puB` values on the robot side).

## Next steps

- **Add a dead-zone**
  - Ignore small `x/y` values near 0 to prevent drift.
- **Add a safety timeout on Robot PU**
  - If no `#puturn/#puspeed` message arrives for ~500ms, stop.
- **Add a pairing indicator**
  - Use `#puack` to show the controller is connected to the robot.