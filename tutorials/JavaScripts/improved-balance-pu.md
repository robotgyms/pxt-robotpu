# Robot PU improved balance: beyond PID (noise + delay)
 
 Balancing on uneven ground is harder than it looks because two things fight “plain PID”:
 
 - **Noise** (tilt measurements are jittery)
 - **Delay** (sensor filtering + computation + servo response)
 
 This tutorial introduces a micro:bit-friendly architecture that usually feels **smoother and more stable than PID**:
 
 - **State estimation**: complementary filter (lightweight alternative to a Kalman filter)
 - **Controller**: PD (no integral windup)
 - **Delay compensation**: simple prediction using angular rate
 
 ## Why Kalman filter alone is not enough
 
 A Kalman filter (or any filter) is an **estimator**, not a controller.
 
 - **Estimator**: “what is the angle and angular rate right now?”
 - **Controller**: “what command should I output to correct it?”
 
 The winning pattern is:
 
 **Estimator (complementary/Kalman) + controller (PD/LQR) + optional prediction**
 
 ## The algorithm (overview)
 
 We will stabilize roll and pitch using these steps:
 
 1. **Measure** roll/pitch (from IMU / accelerometer-based angles).
 2. **Estimate** a cleaner angle using a complementary filter.
 3. **Predict** a short time into the future to reduce the impact of delay.
 4. **Control** using PD:
    - P corrects angle error
    - D damps motion using angular rate
 5. **Clamp** outputs to protect servos.
 
 ## Where this fits in Robot PU projects
 
 In MakeCode, you typically won’t replace internal balancing code. Instead you can:
 
 - run the algorithm in your own program loop
 - send small “bias” corrections into Robot PU using:
   - `robotPu.runKeyValueCommand("#puroll", value)`
   - `robotPu.runKeyValueCommand("#pupitch", value)`
 
 Then keep your main behavior running (walk/dance/rest).
 
 ## Example implementation (MakeCode TypeScript)
 
 This is a compact implementation of:
 
 - complementary filter
 - PD control
 - small prediction
 
 It assumes you have roll/pitch angle measurements available (for example, values derived from the micro:bit IMU). If you are using `input.rotation(...)` for angles, you can pass those directly as `observedRoll`/`observedPitch`.
 
 ```typescript
 // ---------------------------------------------
 // Tunable parameters
 // ---------------------------------------------
 
 // Complementary filter coefficient (0.90–0.98 typical)
 const ALPHA = 0.95
 
 // PD controller gains
 const KP = 0.35
 const KD = 0.12
 
 // Prediction time (seconds) to compensate delay
 const PREDICT_DT = 0.03   // 30 ms
 
 // Output clamp to protect servos
 const MAX_OUT = 40
 
 // ---------------------------------------------
 // Internal state
 // ---------------------------------------------
 let filteredRoll = 0
 let filteredPitch = 0
 let lastUpdateMs = input.runningTime()
 
 function balanceAssist(observedRoll: number, observedPitch: number, expectedRoll: number, expectedPitch: number) {
     // 1) Compute dt
     let now = input.runningTime()
     let dt = (now - lastUpdateMs) / 1000
     lastUpdateMs = now
 
     if (dt <= 0 || dt > 0.2) dt = 0.02
 
     // 2) Approximate angular rates (very lightweight)
     let rollRate = (observedRoll - filteredRoll) / dt
     let pitchRate = (observedPitch - filteredPitch) / dt
 
     // 3) Complementary filter
     filteredRoll = ALPHA * (filteredRoll + rollRate * dt) + (1 - ALPHA) * observedRoll
     filteredPitch = ALPHA * (filteredPitch + pitchRate * dt) + (1 - ALPHA) * observedPitch
 
     // 4) Predict forward to compensate delay
     let predictedRoll = filteredRoll + rollRate * PREDICT_DT
     let predictedPitch = filteredPitch + pitchRate * PREDICT_DT
 
     // 5) PD control (use rate for damping)
     let rollError = expectedRoll - predictedRoll
     let pitchError = expectedPitch - predictedPitch
 
     let rollOut = KP * rollError + KD * (-rollRate)
     let pitchOut = KP * pitchError + KD * (-pitchRate)
 
     // 6) Clamp and apply
     rollOut = Math.constrain(rollOut, -MAX_OUT, MAX_OUT)
     pitchOut = Math.constrain(pitchOut, -MAX_OUT, MAX_OUT)
 
     robotPu.runKeyValueCommand("#puroll", rollOut)
     robotPu.runKeyValueCommand("#pupitch", pitchOut)
 }
 
 // Example usage: assist while walking on uneven ground
 basic.forever(function () {
     let roll = input.rotation(Rotation.Roll)
     let pitch = input.rotation(Rotation.Pitch)
 
     // Target upright
     balanceAssist(roll, pitch, 0, 0)
 
     // Keep behavior gentle on uneven ground
     robotPu.walk(0.9, 0.10)
     basic.pause(20)
 })
 ```
 
 ## How to tune it
 
 - **Start conservative**
   - begin with smaller `KP`, smaller `KD`, smaller `MAX_OUT`
 - **Tune `ALPHA`**
   - higher means smoother but more delay
   - lower means noisier but more responsive
 - **Tune `KP`**
   - increase until it corrects tilt quickly
   - if it oscillates, reduce `KP` or increase `KD`
 - **Tune `KD`**
   - increase until wobble is damped
   - if it becomes twitchy/noisy, reduce `KD`
 - **Tune `PREDICT_DT`**
   - typical range: `0.02..0.05`
   - too large can cause overcorrection
 
 ## Common pitfalls
 
 - **Derivative noise**
   - if motion looks “twitchy”, reduce `KD`, reduce `ALPHA`, or increase `basic.pause(...)`
 - **Too aggressive outputs**
   - lower `MAX_OUT` first (this is a safety knob)
 - **Delay makes it oscillate**
   - reduce `KP`, increase `KD`, or increase `PREDICT_DT` slightly
 
 ## Next steps
 
 - Apply the same `balanceAssist(...)` loop while running `robotPu.dance()`.
 - Add a tilt guard (if tilt > threshold: `robotPu.rest()` and pause briefly).