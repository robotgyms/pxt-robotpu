# Parse detection results from the Smart Hat ESP32 camera

This tutorial explains how Robot PU reads detection results from the Smart Hat ESP32 camera using I2C.

The Smart Hat camera runs computer vision on the ESP32 board. The micro:bit does not process the image directly. Instead, it asks the ESP32 for a small detection result packet. The packet tells the micro:bit what the camera sees, how confident the detection is, where the object is, and how far the robot head should turn to center the object.

---

## What you will learn

By the end of this tutorial, you will understand:

- **What I2C is**: A simple communication bus used by microcontrollers and sensors.
- **How Robot PU talks to I2C devices**: The micro:bit writes messages and reads buffers using MakeCode APIs.
- **Why the Smart Hat uses a multiplexer**: The TCA9546A selects the I2C path to the ESP32 camera.
- **How the detection packet is organized**: Each byte has a meaning.
- **How to parse bytes into useful values**: The code converts raw bytes into object type, score, position, box size, yaw, and pitch.

---

## What is I2C?

I2C stands for **Inter-Integrated Circuit**. It is a communication protocol that lets one controller talk to many small electronic devices using only two signal wires.

The two main I2C wires are:

- **SDA**: Serial data. This wire carries the message data.
- **SCL**: Serial clock. This wire controls the timing of the message.

On Robot PU, the micro:bit acts like the I2C controller. Devices such as the Smart Hat camera board are I2C devices. Each device has an address, so the micro:bit knows which device it is talking to.

---

## I2C addresses in this project

This tutorial uses two important I2C addresses.

- **`MUX_ADDR = 112`**: The I2C address of the TCA9546A I2C multiplexer. In hexadecimal, this is `0x70`.
- **`ESP32_ADDR = 66`**: The I2C address of the Smart Hat ESP32 camera board. In hexadecimal, this is `0x42`.

The multiplexer is used because Robot PU can have multiple I2C devices connected. Before reading the ESP32 camera, the program opens the Smart Hat I2C channels by writing `0x0F` to the multiplexer.

```typescript
pins.i2cWriteNumber(MUX_ADDR, 0x0F, NumberFormat.Int8LE, false)
```

This write message tells the multiplexer to open all four channels.

---

## Reading and writing I2C messages in MakeCode

MakeCode provides simple APIs for I2C communication.

### Write one number to an I2C device

```typescript
pins.i2cWriteNumber(address, value, format, repeated)
```

In this tutorial:

```typescript
pins.i2cWriteNumber(MUX_ADDR, 0x0F, NumberFormat.Int8LE, false)
```

- **`MUX_ADDR`**: The device address to write to.
- **`0x0F`**: The value to send.
- **`NumberFormat.Int8LE`**: Send the value as one 8-bit number.
- **`false`**: Stop the I2C transaction after writing.

### Read a buffer from an I2C device

```typescript
pins.i2cReadBuffer(address, size, repeated)
```

In this tutorial:

```typescript
let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)
```

- **`ESP32_ADDR`**: The ESP32 camera I2C address.
- **`SIZE`**: The number of bytes to read.
- **`false`**: Stop the I2C transaction after reading.

The ESP32 returns a detection packet as a `Buffer`. A `Buffer` is an array of bytes. Each byte is a number from `0` to `255`.

---

## Detection packet format

The sample program reads an `18` byte packet.

```typescript
const SIZE = 18
```

The bytes are interpreted like this:

| Byte | Name | Meaning |
| --- | --- | --- |
| `0` | `type` | Event or object type |
| `1` | `ver` | Packet version |
| `2` | `seq` | Sequence number |
| `3` | `flags` | Status flags |
| `4` | `count` | Number of detected objects |
| `5` | `score` | Detection confidence score |
| `6-7` | `x_mm` | Object x position in millimeters |
| `8-9` | `y_mm` | Object y position in millimeters |
| `10-11` | `z_mm` | Object z position in millimeters |
| `12-13` | `w` | Bounding box width |
| `14-15` | `h` | Bounding box height |
| `16` | `yaw` | Signed yaw error |
| `17` | `pitch` | Signed pitch error |

The object type can be:

- **`IDLE = 0x00`**: No special event.
- **`FACE = 0x01`**: Face detection result.
- **`WAKE = 0x02`**: Wake event.
- **`VOICE = 0x03`**: Voice event.
- **`SOCCER_BALL = 0x04`**: Soccer ball detection result.
- **`SOCCER_GOAL = 0x05`**: Soccer goal detection result.

---

## Status flags

The `flags` byte stores several yes/no status values in one byte. Each bit has a different meaning.

- **`VALID`**: The packet contains valid data.
- **`STALE`**: The packet may be old.
- **`CAPTURE`**: Image capture is active.
- **`WEB`**: Web/debug service is active.
- **`SLEEP`**: The camera is sleeping.

The `flagsText(...)` helper converts the bit flags into readable words for serial output.

---

## Signed and unsigned numbers

Bytes are always stored as `0..255`, but some detection values can be negative.

For example, `yaw` and `pitch` are signed 8-bit values. A positive yaw might mean the object is to one side of the camera image, while a negative yaw means it is on the other side.

The helper function `i8(...)` converts a raw byte into a signed value:

```typescript
function i8(v: number): number {
    return v >= 128 ? v - 256 : v
}
```

The `x_mm`, `y_mm`, and `z_mm` values use two bytes each. The `i16(...)` helper combines two bytes into one signed 16-bit number.

```typescript
function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}
```

The `w` and `h` values use two bytes each, but they are unsigned because width and height cannot be negative.

```typescript
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}
```

---

## How the code works

The program has four main parts.

### 1. Define addresses and packet size

The code stores the I2C addresses and packet size in constants.

```typescript
const MUX_ADDR = 112
const ESP32_ADDR = 66
const SIZE = 18
```

Using constants makes the program easier to read and easier to change later.

### 2. Define event types and status flags

The event type constants make the packet type easier to understand.

```typescript
const FACE = 0x01
const SOCCER_BALL = 0x04
const SOCCER_GOAL = 0x05
```

The flag constants make it possible to check one bit at a time.

```typescript
const VALID = 1 << 0
const STALE = 1 << 1
```

### 3. Parse one packet

The `printPacket(...)` function checks the packet length, reads important bytes, and prints detection results.

```typescript
if (p.length != SIZE) {
    serial.writeLine("bad length: " + p.length)
    return
}
```

This check is important. If the packet is the wrong size, the program should not try to parse it.

For face, soccer ball, and soccer goal packets, the code parses detection data:

```typescript
let count = p[4]
let score = p[5]
let x_mm = i16(p, 6)
let y_mm = i16(p, 8)
let z_mm = i16(p, 10)
let w = u16(p, 12)
let h = u16(p, 14)
let yaw = i8(p[16])
let pitch = i8(p[17])
```

Then it prints the result to the serial console.

```typescript
serial.writeLine(`objects=${count} score=${score} x_mm=${x_mm} y_mm=${y_mm} z_mm=${z_mm}`)
serial.writeLine(`box=${w}x${h} yaw=${yaw} pitch=${pitch}`)
```

### 4. Poll the camera repeatedly

The `basic.forever(...)` loop reads one packet every `20 ms`.

```typescript
basic.forever(function () {
    let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)

    if (packet.length == SIZE) {
        printPacket(packet)
    } else {
        serial.writeLine("i2c read error")
        basic.showIcon(IconNames.No)
    }
    basic.pause(20)
})
```

This is called polling. The micro:bit repeatedly asks the ESP32 camera, “What do you see now?”

---

## Testing steps

- **Connect the Smart Hat**: Make sure the ESP32 camera is connected and powered.
- **Download the program**: Flash the MakeCode program to the micro:bit.
- **Open serial output**: Use the MakeCode serial console to watch printed packets.
- **Show an object**: Put a face, soccer ball, or soccer goal target in front of the camera.
- **Watch the LED display**: The micro:bit shows the object type number.
- **Check serial values**: Confirm `objects`, `score`, `x_mm`, `y_mm`, `box`, `yaw`, and `pitch` update.

---

## Troubleshooting

- **No serial output**: Check that the serial console is open and the program is running.
- **I2C read error**: Check Smart Hat power, I2C wiring, and the multiplexer setup write.
- **Always shows `IconNames.No`**: The ESP32 may not be responding at address `0x42`.
- **Packet values look wrong**: Confirm the packet size matches the ESP32 firmware protocol.
- **No detections**: Improve lighting and make sure the target object matches the camera model.

---

## Complete MakeCode

```typescript
// Address
const MUX_ADDR = 112  // 0x70
const ESP32_ADDR = 66 // 0x42
const SIZE = 18

// Event Types
const IDLE = 0x00
const FACE = 0x01
const WAKE = 0x02
const VOICE = 0x03
const SOCCER_BALL = 0x04
const SOCCER_GOAL = 0x05

// Event status
const VALID = 1 << 0
const STALE = 1 << 1
const CAPTURE = 1 << 2
const WEB = 1 << 3
const SLEEP = 1 << 4

/**
 * Parse 18-byte package
 */
function i16(buf: Buffer, offset: number): number {
    let v = buf[offset] | (buf[offset + 1] << 8)
    return v >= 32768 ? v - 65536 : v
}

/**
 * Parse U16
 */
function u16(buf: Buffer, offset: number): number {
    return buf[offset] | (buf[offset + 1] << 8)
}

/**
 * Parse Unsigned Char
 */
function i8(v: number): number {
    return v >= 128 ? v - 256 : v
}

/**
 * Event status to string
 */
function flagsText(f: number): string {
    let s = ""
    if (f & VALID) s += " valid"
    if (f & STALE) s += " stale"
    if (f & CAPTURE) s += " capture"
    if (f & WEB) s += " web"
    if (f & SLEEP) s += " sleep"
    return s.length > 0 ? s.trim() : "none"
}

/**
 * print packages
 */
function printPacket(p: Buffer) {
    if (p.length != SIZE) {
        serial.writeLine("bad length: " + p.length)
        return
    }

    let type = p[0]
    let ver = p[1]
    let seq = p[2]
    let flags = p[3]

    if (type == FACE || type == SOCCER_BALL || type == SOCCER_GOAL) {
        let count = p[4]
        let score = p[5]
        let x_mm = i16(p, 6)
        let y_mm = i16(p, 8)
        let z_mm = i16(p, 10)
        let w = u16(p, 12)
        let h = u16(p, 14)
        let yaw = i8(p[16])
        let pitch = i8(p[17])
        if (!(flags & STALE)) {
            serial.writeLine(`type=${type} ver=${ver} seq=${seq} flags=${flagsText(flags)} objects=${count} score=${score} x_mm=${x_mm} y_mm=${y_mm} z_mm=${z_mm} box=${w}x${h} yaw=${yaw} pitch=${pitch}`)
        }
    }
}

const CMD_SERVICE_ENABLE = 8
const SERVICE_WIFI = 1
const SERVICE_IMAGE_CAPTURE = 2
const SERVICE_FACE_DETECTION = 3
const SERVICE_SOCCER_BALL_DETECTION = 4
const SERVICE_SOCCER_GOAL_DETECTION = 5

function setService(serviceId: number, enabled: boolean) {
    pins.i2cWriteBuffer(ESP32_ADDR, Buffer.fromArray([CMD_SERVICE_ENABLE, serviceId, enabled ? 1 : 0]), false)
}

basic.showString("I")

// Open all 4 channels in TCA9546A
pins.i2cWriteNumber(MUX_ADDR, 0x0F, NumberFormat.Int8LE, false)

// turn on detections
basic.forever(function () {
    setService(SERVICE_IMAGE_CAPTURE, true)
    basic.pause(10)
    setService(SERVICE_FACE_DETECTION, true)
    basic.pause(10)
    setService(SERVICE_SOCCER_BALL_DETECTION, true)
    basic.pause(10)
    setService(SERVICE_SOCCER_GOAL_DETECTION, true)
    basic.pause(30000)
})

// parse i2c packages
basic.forever(function () {
    let packet = pins.i2cReadBuffer(ESP32_ADDR, SIZE, false)

    if (packet.length == SIZE) {
        printPacket(packet)
    } else {
        serial.writeLine("i2c read error")
        basic.showIcon(IconNames.No)
    }

    //serial.writeLine("---")
    basic.pause(20)
})
```