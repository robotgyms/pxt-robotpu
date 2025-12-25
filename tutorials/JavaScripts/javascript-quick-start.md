# 🚀 Mastering JavaScript on the micro:bit

Transitioning from Blocks to **Static TypeScript (STS)**—the version of JavaScript used in MakeCode—unlocks the full potential of Robot PU. This guide covers everything from the interface to advanced Object-Oriented Design.

---

## 1. The Programming Interface

When you open [makecode.microbit.org](https://makecode.microbit.org), you primarily work in the **Blocks** editor. To switch to JavaScript:

1. Locate the **toggle switch** at the top center of the screen.
2. Click **JavaScript**.
3. The toolbox on the left remains, but clicking a category now provides code snippets instead of blocks.

---

## 2. Basic JavaScript Syntax

STS is "strongly typed," meaning it likes to know what kind of data you are using.

* **Variables**: Use `let` for values that change and `const` for values that stay the same.
```javascript
let speed = 100;
const robotName = "PU";

```


* **Functions**: Wrap reusable logic in functions.
```javascript
function waveHand() {
    pins.servoWritePin(AnalogPin.P1, 90);
    basic.pause(500);
    pins.servoWritePin(AnalogPin.P1, 0);
}

```


### 2.1 Naming: camelCase (and PascalCase for classes)

In JavaScript/STS, names are usually written in *camelCase*:

1. Start with a lowercase letter.
2. Capitalize each new word.
3. Don’t use spaces.

```javascript
let sonarDistanceCm = 0
let isObstacleDetected = false
function setWalkSpeed(speed: number) {
    // ...
}

```

Classes are typically written in *PascalCase* (also called UpperCamelCase):

```javascript
class LedEye {
    // ...
}

```

If you follow these conventions, your code becomes easier to read and matches most MakeCode and TypeScript examples.


### 2.2 Loops (repeat work)


Loops let you run the same code multiple times. They’re perfect for things like:

1. Repeating a movement sequence.
2. Sampling a sensor many times.
3. Animations (LEDs, sounds, etc.).

#### `basic.forever` (runs repeatedly)

```javascript
basic.forever(function () {
    // This code repeats forever
    led.toggle(0, 0)
    basic.pause(200)
})

```

#### `for` loop (repeat a known number of times)

```javascript
for (let i = 0; i < 4; i++) {
    // Runs 4 times with i = 0,1,2,3
    basic.showNumber(i)
    basic.pause(200)
}

```

#### `while` loop (repeat until a condition changes)

```javascript
let count = 0
while (count < 3) {
    basic.showString("GO")
    count += 1
}

```

#### `for ... of` loop (iterate over an array)

```javascript
let steps = [50, 80, 50, 80]
for (let s of steps) {
    // Use each value from the array
    // (Example uses a generic variable; replace with your own robot call)
    // robotPu.walk(s, 0)
    basic.pause(200)
}

```

---

### 2.3 Logic (make decisions)

Logic is how your program decides what to do based on inputs (buttons, radio, sensors).

#### `if / else` (branching)

```javascript
let x = input.acceleration(Dimension.X)

if (x > 200) {
    basic.showArrow(ArrowNames.East)
} else if (x < -200) {
    basic.showArrow(ArrowNames.West)
} else {
    basic.showIcon(IconNames.SmallDiamond)
}

```

#### Boolean operators (`&&`, `||`, `!`)

```javascript
let aPressed = input.buttonIsPressed(Button.A)
let bPressed = input.buttonIsPressed(Button.B)

if (aPressed && bPressed) {
    basic.showString("AB")
}

if (aPressed || bPressed) {
    basic.showString("A or B")
}

if (!aPressed) {
    basic.showString("A not pressed")
}

```

---

### 2.4 Math (numbers you’ll use constantly)

Robot projects use math everywhere: speed, angles, distance conversions, timers, thresholds.

#### Basic operators

```javascript
let a = 10
let b = 3

let sum = a + b
let diff = a - b
let product = a * b
let quotient = a / b
let remainder = a % b

```

#### Helpful `Math` functions

```javascript
let raw = -42

let magnitude = Math.abs(raw)
let limited = Math.min(100, Math.max(0, magnitude))
let rounded = Math.round(12.7)

```

#### Random numbers (for variety)

```javascript
let r = randint(0, 10) // inclusive: 0..10
basic.showNumber(r)

```

---

## 3. micro:bit Pin Usage

Pins are how the micro:bit talks to the outside world (LEDs, buttons, sensors, motors, servos). In MakeCode STS you mainly use the `pins` namespace.

### 3.1 Digital pins (ON/OFF)

Use digital pins for signals that are either `0` (LOW) or `1` (HIGH).

```javascript
// Turn a device on and off
pins.digitalWritePin(DigitalPin.P16, 1)
basic.pause(500)
pins.digitalWritePin(DigitalPin.P16, 0)

// Read a digital input (like a simple switch)
let pressed = pins.digitalReadPin(DigitalPin.P0) == 1

```

### 3.2 Analog pins (0..1023)

Analog reads return a value from `0..1023` (micro:bit v1/v2). This is common for knobs, light sensors, and some distance sensors.

```javascript
let level = pins.analogReadPin(AnalogPin.P1)
basic.showNumber(level)

```

### 3.3 PWM / analog write (power control)

`analogWritePin` outputs a PWM signal (pulse-width modulation). It’s commonly used for dimming LEDs or controlling motor power via a driver.

```javascript
// Write a PWM duty cycle (0..1023)
pins.analogWritePin(AnalogPin.P2, 512)

```

### 3.4 Servo control

Servos are controlled by angle (typically `0..180`).

```javascript
// Move a servo on P1
pins.servoWritePin(AnalogPin.P1, 90)
basic.pause(500)
pins.servoWritePin(AnalogPin.P1, 0)

```

### 3.5 Pull-up / pull-down (stable input readings)

If an input pin is “floating” you’ll get noisy readings. Configure a pull mode for more stable input values.

```javascript
pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
let value = pins.digitalReadPin(DigitalPin.P0)

```

### 3.6 Practical tips

1. Use the correct pin type: `DigitalPin.Px` for digital read/write, `AnalogPin.Px` for analog/PWM/servo.
2. Avoid sharing the same pin between multiple devices.
3. If a sensor is “random,” check pull mode and wiring first.

### Action: Drive a servo from the micro:bit

This mini exercise shows a simple servo “sweep” and a button-controlled servo. It’s a great way to verify wiring before integrating a servo into Robot PU behaviors.

1. Connect servo signal to `P1`, power to `3V`, and ground to `GND`.
2. Flash the code below.

```javascript
let angle = 0

// Sweep the servo back and forth
basic.forever(function () {
    for (angle = 0; angle <= 180; angle += 10) {
        pins.servoWritePin(AnalogPin.P1, angle)
        basic.pause(80)
    }
    for (angle = 180; angle >= 0; angle -= 10) {
        pins.servoWritePin(AnalogPin.P1, angle)
        basic.pause(80)
    }
})

// Optional: snap to positions using buttons
input.onButtonPressed(Button.A, function () {
    pins.servoWritePin(AnalogPin.P1, 0)
})

input.onButtonPressed(Button.B, function () {
    pins.servoWritePin(AnalogPin.P1, 90)
})

input.onButtonPressed(Button.AB, function () {
    pins.servoWritePin(AnalogPin.P1, 180)
})

```

---

## 4. Object-Oriented Design (OOD)

Classes allow you to group data and behaviors together. This is how we build "drivers" for sensors like the Sonar on PU's chest.

### Example: A Simple Robot Component

```javascript
class LedEye {
    pin: DigitalPin;

    constructor(targetPin: DigitalPin) {
        this.pin = targetPin;
    }

    blink() {
        pins.digitalWritePin(this.pin, 1);
        basic.pause(200);
        pins.digitalWritePin(this.pin, 0);
    }
}

// Create an "instance" of the eye on Pin P16
let leftEye = new LedEye(DigitalPin.P16);
leftEye.blink();

```

---

## 5. I2C on the micro:bit

I2C is a two-wire bus used by many sensors (IMUs, magnetometers, OLED displays). Multiple devices can share the same two wires as long as they have different addresses.

### 5.1 Hardware basics

1. Two signal lines:
   1. `SDA` (data)
   2. `SCL` (clock)
2. On the micro:bit edge connector these are typically:
   1. `P20` = SDA
   2. `P19` = SCL
3. Power your sensor from `3V` and `GND` (micro:bit is **3.3V logic**).

### 5.2 Addresses (7-bit)

MakeCode generally uses the **7-bit I2C address** (for example `0x68`). Some datasheets also show an 8-bit “read/write” address; if you see `0xD0/0xD1`, the 7-bit address is usually `0x68`.

### 5.3 Common I2C operations in MakeCode STS

#### Write a register, then read a byte

Many sensors work like this: write the register number you want, then read data back.

```javascript
// Example: read 1 byte from register 0x00 on a device at address 0x68
let addr = 0x68
let reg = 0x00

// Tell the device which register we want
pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE, false)

// Read 1 byte back
let value = pins.i2cReadNumber(addr, NumberFormat.UInt8BE, false)
basic.showNumber(value)

```

#### Read / write multiple bytes with buffers

```javascript
let addr = 0x3C // common OLED address (example)

// Write a few bytes
let out = pins.createBuffer(2)
out[0] = 0x00
out[1] = 0xAF
pins.i2cWriteBuffer(addr, out, false)

// Read N bytes
let data = pins.i2cReadBuffer(addr, 6, false)
basic.showNumber(data.length)

```

### 5.4 Practical tips

1. If nothing responds, double-check the address and wiring (SDA/SCL swapped is very common).
2. If readings are unstable, check that the sensor has I2C pull-up resistors (many breakout boards include them).
3. Keep wires short on the edge connector for more reliable I2C.

---

## 6. Compilation and Uploading

MakeCode compiles your JavaScript into a **.hex** file—a format the micro:bit hardware understands.

### Step-by-Step Upload:

1. **Connect**: Plug your micro:bit into your computer via USB.
2. **Download**: Click the purple **Download** button.
3. **Transfer**:
* **Direct (WebUSB)**: If your browser is paired, the code flashes instantly.
* **Manual**: Drag the `.hex` file from your Downloads folder onto the **MICROBIT** drive on your computer.


4. **Run**: The yellow light on the back flashes during the transfer. Once it stops, the program starts automatically.


---

## 7. Tips for Clean and Reusable Code

Writing "clean" code makes it easier for you (and others) to fix bugs later.

* **Use Descriptive Names**: Instead of `let x = 10`, use `let sonarDistance = 10`.
* **The Single Responsibility Principle**: A class or function should do **one** thing well. For example, a `Sonar` class should only handle measuring distance, not playing music.
* **Comment Your Logic**: Use `//` to explain *why* you are doing something complex.
* **Avoid "Magic Numbers"**: Instead of using `0.0171821` inside your logic, create a variable named `SOUND_SPEED_CONSTANT`.
* **Keep it Modular**: Put your classes at the top of the file or in separate tabs to keep your main `forever` loop tidy.

---

