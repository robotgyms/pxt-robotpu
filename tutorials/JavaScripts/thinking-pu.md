
 # 🧠 Lesson: Robot Thinking (Feedback Loops)
 
 “Robot thinking” is usually not human-like thinking. In robotics, it often means:
 
 - observe sensors
 - compute an adjustment
 - apply the adjustment
 - repeat fast
 
 This is called a **feedback loop** (closed-loop control).
 
 In Robot PU, walking and balancing is a great example. The extension’s `moveBalance(...)` continuously reads the IMU and adjusts servo targets while walking.
 
 ---
 
 ## 1. Control loops: open-loop vs closed-loop
 
 ### A. Open-loop control (no feedback)
 
 Open-loop means:
 
 - you command an action
 - you do not measure the result
 - you assume the robot behaves as expected
 
 Example idea:
 
 - “Set leg servos to these angles and hope the robot is stable.”
 
 Pros:
 
 - simple
 - predictable on perfect hardware
 
 Cons:
 
 - sensitive to battery voltage, friction, payload, bumps
 - cannot recover when the real world differs from your assumption
 
 ### B. Closed-loop control (feedback)
 
 Closed-loop means:
 
 - command an action
 - measure what happened (sensors)
 - compute an error
 - correct the command
 
 Pros:
 
 - robust to disturbance
 - self-correcting
 
 Cons:
 
 - more complex
 - needs good sensor data and good tuning
 
 ---
 
 ## 2. Robot PU example: `moveBalance()` (walking + balance)
 
 In `robotpu.ts`, walking calls:
 
 - `walk(sp, di)` → `moveBalance(sp, di, ...)`
 
 High-level idea inside `moveBalance(...)`:
 
 1. **Observation**: read IMU data and estimate body tilt
 2. **Thinking**: compute how much to tilt/offset the legs and body to stay balanced
 3. **Action**: apply those offsets as “control vectors” to the servo targets
 
 Then it calls the lower-level gait engine (`wk.move(...)`) to advance the motion state.
 
 ---
 
 ## 3. Observation: `balanceParam()` (sensor → state estimate)
 
 `balanceParam()` reads the accelerometer:
 
 - `input.acceleration(Dimension.X/Y/Z)`
 
 And computes tilt-related internal signals (examples you’ll see in the code):
 
 - `bodyRoll`, `bodyPitch`
 - filtered versions `bodyRoll2`, `bodyPitch2` (smoothed over time)
 
 This is a small but important idea: **filtering**.
 
 - raw sensors are noisy
 - filtering reduces noise so control outputs don’t jitter
 
 ---
 
 ## 4. Thinking: turn IMU tilt into corrective offsets
 
 In `moveBalance(...)`, the robot uses the estimated roll/pitch to compute offsets:
 
 - if the robot leans left, shift weight / servo offsets to recover
 - if the robot leans right, do the opposite
 
 You’ll see logic like:
 
 - clamp the correction (`maxRollCtrl`) so it cannot over-correct
 - slow down when tilt is large (safety + stability)
 
 The output of “thinking” is a set of **control signals** written into `pr.servoCtrl[...]`.
 
 That control vector is then combined with the current gait pose targets.
 
 ---
 
 ## 5. Action: apply control and step the gait
 
 The action step is:
 
 - apply the computed `servoCtrl` offsets
 - call `wk.move(...)` to take one small step toward the current pose
 
 That’s why motion actions are designed to be called repeatedly: each call is one iteration of the feedback + motion update.
 
 ---
 
 ## 6. Types of controllers (concepts)
 
 Robot PU’s balancing logic is a practical example of a **heuristic controller** (hand-designed rules + clamping + smoothing).
 
 Other common controllers:
 
 - **P controller**: correction proportional to error
 - **PD controller**: proportional + damping (uses error change rate)
 - **PID controller**: proportional + integral + derivative
 
 Typical tradeoffs:
 
 - P: simple, but may oscillate
 - PD: more stable, less overshoot
 - PID: can remove steady-state error, but can be tricky to tune
 
 ---
 
 ## 7. More advanced “thinking” (not required, but good to know)
 
 These are common in more advanced robots. They are mentioned here as future directions (they are not implemented in this tutorial code).
 
 - **Kalman filter / complementary filter**
   - better sensor fusion (e.g., accel + gyro) and better state estimation
 
 - **Feed-forward control**
   - predict required servo output from the planned motion
   - combine with feedback for best results
 
 - **Probabilistic models** (Bayesian / probability networks)
   - represent uncertainty explicitly (useful when sensors are noisy)
 
 - **Reinforcement learning**
   - **Q-learning / Q-tables**: learn which action to take in each state
   - modern variants use neural networks (Deep Q Networks)
 
 ---
 
 ## 8. Practical MakeCode pattern: Observation → Thinking → Action
 
 Here is the general pattern you’ll reuse in many projects:
 
 ```typescript
 basic.forever(function () {
     // Observation
     const cm = robotPu.sonarDistanceCm()
 
     // Thinking
     let speed = 2
     let turn = 0
     if (cm > 0 && cm < 15) {
         speed = -2
         turn = 0.8
     }
 
     // Action
     robotPu.walk(speed, turn)
 })
 ```
 
 The difference between a “dumb” robot and a “smart” robot is usually the quality of the **Thinking** step.

