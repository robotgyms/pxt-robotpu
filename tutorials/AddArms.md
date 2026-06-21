# Add Arms (4-Servo Upgrade)

Build a simple **up/down arm set** for Robot PU using **4 servos**. Two servos plug into Robot PU’s onboard servo controller (strong, usually **5V**). Two more servos are driven directly by the micro:bit pins (works at **3.3V**, but typically weaker).

Arm 3D design + printing project:

https://www.tinkercad.com/things/lry3ev565Pz-robot-pu-arms-on-back

Tutorial video:

https://youtu.be/Y6k2xs_MXjI

---

## 1. Goal

By the end of this tutorial, you will have:

- **Two “controller” servos** (I2C servo board) acting as Arm joints
- **Two “micro:bit pin” servos** acting as Arm joints
- A program that cycles:
  - Arms **Down**
  - Arms **Up**
  - repeating every second

---

## 2. Example project

This tutorial is based on this MakeCode project:

https://makecode.microbit.org/_8Pef1oJxcL8M

---

## 3. Hardware / Wiring

You are mixing **two servo control methods** in one robot:

- **I2C servo controller outputs** (Robot PU board)
- **Direct PWM from micro:bit pins**

Why mix methods?

- The Robot PU I2C servo controller provides **8 servo slots total**.
- Once you add arms, the robot build needs **10 servos total**.
- So the extra **2 servos must be driven directly by the micro:bit**, which is why this tutorial uses `P14` and `P15`.

The most important rule is:

- **All grounds must be shared** (servo power ground and micro:bit ground must be connected).

### 3.1 I2C servos (Robot PU servo controller)

Use the Robot PU servo controller outputs:

- `robotPuPro.ServoJoint.Reserve1`
- `robotPuPro.ServoJoint.Reserve2`

These are typically powered from the board’s servo supply (**often 5V**), which is why they usually feel stronger.

### 3.2 Pin servos (micro:bit)

Connect the other two servos to:

- **Signal**: `P14` and `P15`
- **Power**: micro:bit `3.3V` (works, but weaker)
- **Ground**: common ground with the robot

If your expansion board provides a separate **5V servo power source**, you can re-wire the P14/P15 servos to that 5V source (recommended for stronger arms). If you do that:

- Keep **signal** on `P14`/`P15`
- Power the servo from **5V**
- Ensure **common ground** is shared with the micro:bit

---

## 4. Before you run the code (calibration mindset)

Servos are not perfectly identical, and the same angle might mean slightly different physical positions.

In the code, the arm “poses” are just servo angles:

- **Down pose** uses angles near `0`/`180`
- **Rest pose** uses angles around `90`

If an arm moves the wrong way:

- Swap `0` and `180` for that servo (or change `45` to `135` and vice-versa)

If an arm tries to push past its mechanical limit:

- Reduce the extreme angles (for example use `10` and `170` instead of `0` and `180`)

---

## 5. Code (copy/paste)

Paste this into the **JavaScript** tab in MakeCode.

```javascript
function ArmUp () {
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve1, 0)
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve2, 180)
    pins.servoWritePin(AnalogPin.P14, 135)
    pins.servoWritePin(AnalogPin.P15, 45)
    robotPuPro.talk("Up Up Up!")
}

function ArmDown () {
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve1, 180)
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve2, 0)
    pins.servoWritePin(AnalogPin.P14, 45)
    pins.servoWritePin(AnalogPin.P15, 135)
    robotPuPro.talk("Done Done Done!")
}

function RestArm () {
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve1, 90)
    robotPuPro.servo(robotPuPro.ServoJoint.Reserve2, 90)
    pins.servoWritePin(AnalogPin.P14, 0)
    pins.servoWritePin(AnalogPin.P15, 180)
}

radio.onReceivedString(function (receivedString) {
    robotPuPro.runStringCommand(receivedString)
})

radio.onReceivedValue(function (name, value) {
    robotPuPro.runKeyValueCommand(name, value)
})

robotPuPro.setServoTrim(
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

---

## 6. Testing checklist

1. **Power check**
   1. Servo plugs are oriented correctly.
   2. Servo power is correct (3.3V for direct micro:bit servos unless you intentionally rewired to 5V).
   3. **Ground is shared** between micro:bit and servo power.
2. **Flash the program**
3. **Observe the first 2 seconds**
   1. The program calls `RestArm()` first.
   2. Then it starts alternating `ArmDown()` / `ArmUp()`.
4. **Confirm motion**
   1. Arms alternate down/up every second.
   2. No servo is buzzing loudly or straining at an end-stop.

---

## 7. Troubleshooting

- **One arm moves backwards**
  - Flip the angle pair for that servo:
    - Change `0` to `180` (and `180` to `0`), or swap `45` and `135`.
- **Pin servos (P14/P15) are weak or jittery**
  - 3.3V can be marginal for bigger servos.
  - Use a **separate 5V servo supply** (shared ground) if your hardware supports it.
- **Servo chatters / hums at rest**
  - Slightly change the “rest” angle (for example `90` -> `85` or `95`).
  - Avoid `0`/`180` if your linkage is near a hard stop.
- **Nothing moves**
  - Double-check that the correct joints are used:
    - I2C: `robotPuPro.ServoJoint.Reserve1` / `Reserve2`
    - Pins: `AnalogPin.P14` / `AnalogPin.P15`

---

## 8. Next steps

- **Make it interactive**
  - Use button presses or radio commands to trigger `ArmUp()` / `ArmDown()` instead of auto-cycling.
- **Tune poses safely**
  - Replace `0`/`180` with gentler limits (like `10`/`170`) once your linkage is installed.
- **Strength upgrade**
  - If your arms sag or stall, move the pin-driven servos to a proper 5V servo supply (shared ground).

