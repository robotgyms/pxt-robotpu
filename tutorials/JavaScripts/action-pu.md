 # 🤖 Lesson: Robot PU Actions (Asynchronous Motion)
 
 Most Robot PU actions are designed to be **asynchronous** to prevent the micro:bit from locking up.
 
 Many motion blocks return a **status code**:
 
 - **`0`**: the action has reached a completion boundary (a “step” / state finished)
 - **`1`**: the action is still running (keep calling it)
 
 This lets you build “synchronous” behavior yourself by repeatedly calling the action until you observe enough `0` return events.
 
 ---
 
 ## 1. Action APIs (What you can call)
 
 ### Motion actions (return status `number`)
 
 - `robotPuPro.walk(speed, turn)`
 - `robotPuPro.sideStep(direction)`
 - `robotPuPro.explore()`
 - `robotPuPro.dance()`
 - `robotPuPro.kick()`
 - `robotPuPro.jump()`
 - `robotPuPro.rest()`
 - `robotPuPro.stand()`
 
 ### Motion actions (statement versions, return `void`)
 
 These are the same actions but **do not return a code**, so they are harder to sequence precisely:
 
 - `robotPuPro.walkDo(speed, turn)`
 - `robotPuPro.sideStepDo(direction)`
 - `robotPuPro.exploreDo()`
 - `robotPuPro.danceDo()`
 - `robotPuPro.kickDo()`
 - `robotPuPro.jumpDo()`
 - `robotPuPro.restDo()`
 - `robotPuPro.standDo()`
 
 ### Non-motion actions (usually synchronous)
 
 - `robotPuPro.greet()`
 - `robotPuPro.talk(text)` — plays text as a **melodic robotic tune** (RoboVoice); auto-detects morse strings
 - `robotPuPro.sing(text)` — plays a note-letter sequence
 - `robotPuPro.morse(code, unitMs?)` — plays ITU morse code beeps
 - `robotPuPro.morseText(text, unitMs?)` — translates text to morse and plays it
 - `robotPuPro.setMode(mode)` (switch the internal behavior state machine)

> **Real human speech:** `talk()` is a musical voice, not text-to-speech. For spoken words, add **[pxt-billy](https://github.com/adamish/pxt-billy)** and use `billy.say(text)`.
 
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
 // robotPuPro.walkBlocking(3)
 // robotPuPro.sideStepBlocking(-1)
 ```
 
 ### B. Asynchronous (recommended)
 
 You call the action many times. Each call advances the motion.
 
 ```typescript
 let rc = robotPuPro.walk(2, 0)
 if (rc == 0) {
     // A completion boundary happened (a gait state finished)
 }
 ```
 
 ---

 ## 3.5 Example: call `walk()` 100 times (no return checking)

 Sometimes you just want to “drive” the motion for a fixed amount of time and you do not care about counting steps.

 This pattern ignores the return value and simply calls `walk(...)` repeatedly:

 ```typescript
 for (let i = 0; i < 100; i++) {
     robotPuPro.walk(2, 0) // ignore rc
 }
 ```

 ## 3.6 JavaScript “function pointers” (callbacks)
 
 In JavaScript / TypeScript, you can store a function in a variable and pass it to another function. This is often called a **callback** (similar idea to a “function pointer” in C).
 
 In this lesson we pass a function like `() => number` into helpers such as `doCompletions(...)`.
 
 Example:
 
 ```typescript
 function myAction(): number {
     return robotPuPro.walk(2, 0)
 }
 
 function do400Times(run: () => number): void {
     let done = 0
     while (done < 400) {
         const rc = run()
         done += 1
     }
 }
 
 // Pass a function *reference* (do not call it here)
 do400Times(myAction)
 
 // Or pass an inline anonymous function (arrow function)
 do400Times(() => robotPuPro.walk(2, 0))
 ```
 
 Key idea:
 
 - `robotPuPro.walk(2, 0)` calls the function immediately and produces a `number`.
 - `() => robotPuPro.walk(2, 0)` produces a function that we can call later, many times.
 
 ---
 
 ## 4. How to “wait for completion” (build synchronous behavior safely)
 
 The safest pattern is:
 
 - Call the action
 - If it returns `1`, it is still running (keep calling)
 - When it returns `0`, treat that as a completion boundary for counting
 
 ### A. Wait until one completion event
 
 ```typescript
 function waitOneCompletion(run: () => number): void {
     while (true) {
         const rc = run()
         if (rc == 0) return
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
     }
 }
 ```
 
 Notes:
 
 - The meaning of a “completion” depends on the action (it is typically a gait/state boundary).
 - For some gaits, one physical “step” is made of multiple internal states. If your gait uses **2 states per step**, then you will see `rc == 0` **twice per step**.
 
 ---
 
 ## 5. Final program: walk forward, sidestep left, jump, stand
 
 Requirements:
 
 - walk forward for **3 steps** (if it is **2 states per step**, count `return == 0` for **6 times**)
 - side step left for **3 steps**
 - jump **1** time
 - stand
 
 ```typescript
function doCompletions(run: () => number, completions: number): void {
 let done = 0
 while (done < completions) {
  const rc = run()
  if (rc == 0) done += 1
 }
}

// 1) Walk forward: 3 steps
// If your gait uses 2 states per step, count 0 six times
doCompletions(() => robotPuPro.walk(2, 0), 6)

// 2) Side step left: 3 steps
// direction: negative = left, positive = right
doCompletions(() => robotPuPro.sideStep(-0.2), 6)

// 3) Jump one time
doCompletions(() => robotPuPro.jump(), 4)

// 4) Stand (return to neutral)
doCompletions(() => robotPuPro.stand(), 1)
 ```
