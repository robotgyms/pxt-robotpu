
 # 🎵 Lesson: Music Analysis for Robot PU (beats, tempo, melody)
 
 This lesson explains how Robot PU detects **music beats** using the internal `MusicLib` helper class, and how you can build your own **beat / tempo** logic in MakeCode JavaScript.
 
 Important limitation:
 
 - The micro:bit microphone provides **loudness (amplitude)** via `input.soundLevel()` (0–255).
 - Without extra audio hardware + DSP, you generally **cannot detect real pitch / notes** from the built-in microphone.
 - So this lesson focuses on **beat + tempo** (rhythm). For “melody/notes”, we focus on **playing/generating** notes and simple symbolic representations.
 
 ---
 
 ## 1. What the extension already does (MusicLib)
 
 Inside `robotpu.ts` there is a `class MusicLib` used by Robot PU’s `dance()` behavior.
 
 Key idea:
 
 - Every ~`sampleMs` (default **125ms**), it buckets the latest loudness sample.
 - It keeps a ring buffer of loudness history.
 - If a bucket is loud enough compared to an adaptive threshold, it counts as a **beat**.
 - When a beat is detected, it updates an estimated `period` (time between beats), using smoothing.
 
 The public method is:
 
 - `isABeat(timestamp, loudness, snr, sampleMs = 125) : boolean`
 
 And the class tracks:
 
 - `period` (ms): estimated beat period
 - `loudThreshold`: adaptive threshold
 
 Robot PU uses this in `dance()` roughly like:
 
 - call `isABeat(control.millis(), input.soundLevel(), 1.1)`
 - if beat: change moves / flash LEDs / update wiggle timing
 
 ---
 
 ## 2. Beat detection in your own code (simple version)
 
 The extension’s `MusicLib` is internal, so you can’t call it directly from a normal MakeCode project.
 
 But you can implement a simple beat detector using the same inputs:
 
 - `input.soundLevel()`
 - `control.millis()`
 
 This detector triggers when sound crosses a threshold, with a “cooldown” to avoid double-triggering.
 
 ```typescript
 let lastBeatMs = 0
 let periodMs = 500
 let threshold = 140
 
 function onBeat(now: number): void {
     // Update period estimate (simple smoothing)
     const newPeriod = now - lastBeatMs
     if (newPeriod > 150 && newPeriod < 2000) {
         periodMs = (periodMs * 3 + newPeriod) / 4
     }
     lastBeatMs = now
 
     // Example reaction: flash LED
     led.toggle(2, 2)
 }
 
 basic.forever(function () {
     const now = control.millis()
     const s = input.soundLevel()
 
     // Cooldown ~ 40% of current beat period
     if (s > threshold && (now - lastBeatMs) > periodMs * 0.4) {
         onBeat(now)
     }
 })
 ```
 
 ---
 
 ## 3. Tempo (BPM) estimation
 
 Once you have an estimated beat period in milliseconds:
 
 - `BPM ≈ 60000 / periodMs`
 
 Example:
 
 ```typescript
 basic.forever(function () {
     if (periodMs > 0) {
         const bpm = Math.round(60000 / periodMs)
         // Show tempo when button A is pressed
         // (displaying continuously will block your beat loop)
         if (input.buttonIsPressed(Button.A)) {
             basic.showNumber(bpm)
         }
     }
 })
 ```
 
 Notes:
 
 - Tempo estimation is noisy. It improves if you smooth period and require consistent beats.
 - Very fast rhythms may “double-trigger” unless you add a cooldown.
 
 ---
 
 ## 4. Using beats to control Robot PU
 
 Example idea: “dance harder on beats”.
 
 Since Robot PU actions advance when called repeatedly, one practical pattern is:
 
 - on beat: trigger a short action burst
 - otherwise: keep calling a background action (like `dance()`)
 
 ```typescript
 basic.forever(function () {
     const now = control.millis()
     const s = input.soundLevel()
 
     if (s > threshold && (now - lastBeatMs) > periodMs * 0.4) {
         onBeat(now)
         // A short “pop” action on beat
         for (let i = 0; i < 120; i++) {
             robotPu.jump()
         }
     } else {
         // Idle behavior
         robotPu.dance()
     }
 })
 ```
 
 ---
 
 ## 5. Melody / notes: what you can (and cannot) do
 
 ### A. What you can do well on micro:bit
 
 - **Play notes and melodies** using MakeCode `music` APIs:
   - `music.playTone(frequency, ms)`
   - `music.playMelody("C D E F G A B C5", 120)`
   - `music.play(music.stringPlayable("C5 B A G F E D C", 120), music.PlaybackMode.InBackground)`
 
 - **Generate melodies** symbolically (choose note names, rhythms, patterns) and then play them.
 
 ### B. What is hard (with only `soundLevel`)
 
 - Detecting the *actual* note / pitch of music in the room.
 - Recognizing a melody from microphone input.
 
 You can still do “melody-like” analysis at a higher level:
 
 - detect sections (quiet vs loud)
 - detect beat/tempo changes
 - detect drops (sudden loudness increase)
 
 ---
 
 ## 6. Summary
 
 - `MusicLib` in the extension detects beats from loudness history and estimates a beat `period`.
 - You can reproduce a simpler beat detector in user code using `input.soundLevel()` + timing.
 - From beat period you can estimate tempo (BPM).
 - Micro:bit can **play** notes easily, but cannot reliably **recognize** notes from microphone with `soundLevel` alone.

