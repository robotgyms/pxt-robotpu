# RobotPU MakeCode Extension

## Overview

RobotPU is a playful, programmable robot built on BBC micro:bit. This extension exposes high‑level behaviors of the PU robot so learners can create interactive projects with block coding or JavaScript/TypeScript in MakeCode.

PU can walk, explore, dance, kick, jump, rest, talk, and sing. It reacts to sound, balances using its IMU, and navigates with an ultrasonic sensor.
![RobotPU](https://raw.githubusercontent.com/robotgyms/pxt-RobotPU/main/assets/robotpu.png)

Learn more about the robot hardware and kits at:
- https://robotgyms.com/pu

Purchase Links: 
- https://robotgyms.com/product/robot-pu/
- https://www.amazon.com/Robot-Programmable-Interactive-Upgradable-Self-Balancing/dp/B0DR8RGVXN

## Features

- **Expressive personality**: dance routines, reactions, auto-pilot, soccer
- **Classroom-ready** with block coding and Python paths
- **Maker-friendly** with free tutorials and upgrade projects
- **Open-source** with community resources

## What’s in the Kit (typical)

- Robot PU (pre-built and upgradable)
- 2× micro:bit
- Gamepad
- Manual
- Online tutorials and examples

## Activities and Use Cases

- **Little AI friend**: walk, dance, navigate, maze solving, chat, generate songs, sing
- **Games**: soccer, hide-and-seek, group dance/chorus
- **Learn-then-create**: programming, electronics, mechanics, 3D printing accessories
- **Community**: share code and parts, collaborate, coordinate multiple robots

## Installation

1. In MakeCode, open your micro:bit project.
2. Add extension → Import URL (or local path) → point to this repository.
3. Ensure the dependency to Billy voice is available (see Dependencies below).
4. Use the `RobotPU init` block once in `on start`.

## Dependencies

- core, radio, neopixel (from MakeCode)
- Billy voice package: github:adamish/pxt-billy

## Blocks / API

- **init** RobotPU `sn` and `name`
- **walk** `speed` (−5..5) and `turn` (−1..1)
- **explore** autonomous navigation
- **dance** reactive dancing
- **kick** quick forward kick
- **jump** jump sequence
- **rest** balanced idle
- **talk** text-to-speech via Billy
- **sing** sing a phonetic/musical string via Billy

## Example (JavaScript)

```ts
RobotPU.init("auto", "peu")
input.onButtonPressed(Button.A, function () {
    RobotPU.walk(2, 0)
})
input.onButtonPressed(Button.B, function () {
    RobotPU.rest()
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    RobotPU.dance()
})
// Background exploration
basic.forever(function () {
    RobotPU.explore()
})
```

## Tips

- **Speed and turning**: positive speed walks forward, negative walks backward; `turn` is −1 (left) to 1 (right).
- **Explore** uses the onboard ultrasonic sensor (HCSR04) for obstacle avoidance.
- **Voice**: `talk` and `sing` require the Billy voice dependency.

## License

- Apache License 2.0. See `LICENSE`.
- Copyright © 2025 Robot Gyms Inc.

## Acknowledgments

- PU robot concept and kit by Robot Gyms. This MakeCode extension wraps the robot behaviors for education and rapid prototyping.
