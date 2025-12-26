 # 🤖 Lesson: Robot PU Actions (Asynchronous Motion)
 
 Most Robot PU actions are designed to be **asynchronous** to prevent the micro:bit from locking up.
 
 Many motion blocks return a **status code**:
 
 - **`0`**: the action has reached a completion boundary (a “step” / state finished)
 - **`1`**: the action is still running (keep calling it)
 
 This lets you build “synchronous” behavior yourself by repeatedly calling the action until you observe enough `0` return events.
 
 ---
 
 ## 1. Action APIs (What you can call)
 
 ### Motion actions (return status `number`)
 
 - `robotPu.walk(speed, turn)`
 - `robotPu.sideStep(direction)`
 - `robotPu.explore()`
 - `robotPu.dance()`
 - `robotPu.kick()`
 - `robotPu.jump()`
 - `robotPu.rest()`
 - `robotPu.stand()`
 
 ### Motion actions (statement versions, return `void`)
 
 These are the same actions but **do not return a code**, so they are harder to sequence precisely:
 
 - `robotPu.walkDo(speed, turn)`
 - `robotPu.sideStepDo(direction)`
 - `robotPu.exploreDo()`
 - `robotPu.danceDo()`
 - `robotPu.kickDo()`
 - `robotPu.jumpDo()`
 - `robotPu.restDo()`
 - `robotPu.standDo()`
 
 ### Non-motion actions (usually synchronous)
 
 - `robotPu.greet()`
 - `robotPu.talk(text)`
 - `robotPu.sing(text)`
 - `robotPu.setMode(mode)` (switch the internal behavior state machine)
 
 ---
 
 ## 2. Why actions are asynchronous
 
 A motion like walking or sidestepping is not “one motor command”. It is a sequence of body poses that must be updated repeatedly over time.
 
 If a block tried to do the whole motion in one call (blocking), it could:
 
 - freeze button/radio events
 - starve background tasks
 - make the whole system feel “locked up”
 
 So Robot PU action APIs are designed to be called repeatedly in a loop.
 
 ---
 
 ## 3. Comparing “synchronous” vs “asynchronous” patterns
 
 ### A. Synchronous (blocking) idea (what we avoid)
 
 This is the style that can cause lock-ups:
 
 ```typescript
 // (Concept only) A blocking API would look like this.
 // robotPu.walkBlocking(3)
 // robotPu.sideStepBlocking(-1)
 ```
 
 ### B. Asynchronous (recommended)
 
 You call the action many times. Each call advances the motion.
 
 ```typescript
 let rc = robotPu.walk(2, 0)
 if (rc == 0) {
     // A completion boundary happened (a gait state finished)
 }
 basic.pause(5)
 ```
 
 ---
 
 ## 4. How to “wait for completion” (build synchronous behavior safely)
 
 The safest pattern is:
 
 - Call the action
 - If it returns `1`, wait a little and try again
 - When it returns `0`, treat that as “done enough” for your step counter
 
 ### A. Wait until one completion event
 
 ```typescript
 function waitOneCompletion(run: () => number): void {
     while (true) {
         const rc = run()
         if (rc == 0) return
         basic.pause(5)
     }
 }
 ```
 
 ### B. Count completions inside loops
 
 ```typescript
 function doCompletions(run: () => number, completions: number): void {
     let done = 0
     while (done < completions) {
         const rc = run()
         if (rc == 0) done += 1
         basic.pause(5)
     }
 }
 ```
 
 Notes:
 
 - `basic.pause(5)` prevents starving the CPU.
 - Robot PU balancing needs at least ~200Hz IMU/balance updates. `basic.pause(5)` = 5ms = **200Hz**, which keeps motion stable.
 - The micro:bit V2 motion sensor footprint supports either **NXP FXOS8700CQ** or **ST LSM303AGR** (detected at runtime by the DAL).
 - The **FXOS8700CQ** supports accelerometer ODR up to **800Hz** (and interleaved accel+mag up to **400Hz**), so a 200Hz control loop is well within the sensor’s capability.
 - In the micro:bit runtime, the accelerometer sampling period is configurable (e.g. `setPeriod(periodMs)`), so the *actual* sampling rate depends on configuration.
 - The meaning of a “completion” depends on the action (it is typically a gait/state boundary).
 
 ---
 
 ## 5. Final program: walk forward, sidestep left, jump, stand
 
 Requirements:
 
 - walk forward for **3 steps** (count `return == 0` for **4 times**)
 - side step left for **3 steps**
 - jump **1** time
 - stand
 
 ```typescript
 function doCompletions(run: () => number, completions: number): void {
     let done = 0
     while (done < completions) {
         const rc = run()
         if (rc == 0) done += 1
         basic.pause(5)
     }
 }
 
 // 1) Walk forward: 3 steps (count 0 four times)
 doCompletions(() => robotPu.walk(2, 0), 4)
 
 // 2) Side step left: 3 steps
 // direction: negative = left, positive = right
 doCompletions(() => robotPu.sideStep(-1), 4)
 
 // 3) Jump one time
 doCompletions(() => robotPu.jump(), 1)
 
 // 4) Stand (return to neutral)
 doCompletions(() => robotPu.stand(), 1)
 ```
