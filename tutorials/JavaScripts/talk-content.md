
# 🤖 Robot PU: Dynamic Talk Content Project Wiki

Welcome to the official project repository for **Robot PU (Pair Up)**. Robot PU expresses itself using its built-in **RoboVoice** melodic music engine — no extra library required.

> **Want a real human voice?** `robotPuPro.talk()` plays a *melodic musical utterance* using the micro:bit speaker — it is **not** text-to-speech. If you need real synthesized speech, add the **[pxt-billy](https://github.com/adamish/pxt-billy)** extension to your project and call `billy.say(text)` instead.

In this tutorial you will learn how to:

1. Build a **talk content generator** (random + templated phrases)
2. Associate talk content with **Robot PU mode** and **robot status**
3. Express it using:
   1. `robotPuPro.talk(text)` — plays text as a melodic robotic tune (RoboVoice)
   2. `robotPuPro.sing(text)` — plays a note-letter sequence (e.g. `"C D E F G "`)
   3. `robotPuPro.morseText(text)` — translates plain text to morse and plays it
   4. `billy.say(text)` *(optional, requires pxt-billy)* — real synthesized speech

---

## 📂 1. What APIs you can call

From the `pxt-robotpu` extension:

* `robotPuPro.talk(text)` — melodic robotic voice (RoboVoice); auto-detects and plays morse strings
* `robotPuPro.sing(text)` — note-letter sequence player (e.g. `"C D E F G "`)
* `robotPuPro.morse(code, unitMs?)` — play ITU morse code beeps directly
* `robotPuPro.morseText(text, unitMs?)` — translate plain text to morse and play it
* `robotPuPro.mode()` → returns the current behavior mode
* `robotPuPro.sonarDistanceCm()` → distance to obstacles
* `robotPuPro.walk(...)`, `robotPuPro.explore()`, `robotPuPro.dance()`, etc.

Optional (requires **pxt-billy** extension):

* `billy.say(text)` — real synthesized human speech (SAM engine)

From MakeCode:

* `input.soundLevel()` → 0..255 (useful as “room mood / excitement”)
* `control.millis()` → timestamps

---

## 🧠 2. Design Pattern: State → Intent → Utterance

To keep speech from being noisy or repetitive, use this pipeline:

1. **Sense** (mode + sensors)
2. **Classify** the situation (an intent)
3. **Generate** a phrase from a small set of templates
4. **Rate limit** so PU doesn’t talk nonstop

Example intents:

* “greeting”
* “exploring”
* “obstacle ahead”
* “dance hype”
* “tired / resting”

---

## 🧁 3. Cute Phrase Templates

Cute speech usually feels better when it includes:

* A nickname (friend / buddy / captain)
* A short emotion word (yay / oops / hmm)
* A context word (wall / music / maze)
* A small variation (random synonyms)

We’ll implement this using small arrays and a `pick(...)` helper.

---

## 💻 4. Implementation Script

Copy this code into the **JavaScript** tab of the MakeCode Editor.

```typescript
function pick(arr: string[]): string {
    return arr[Math.randomRange(0, arr.length - 1)]
}

function clampInt(x: number, lo: number, hi: number): number {
    if (x < lo) return lo
    if (x > hi) return hi
    return x
}

// --- “vocabulary” ---
const nicknames = ["friend", "buddy", "captain", "bestie", "team"]
const happy = ["yay!", "woohoo!", "hehe!", "nice!"]
const thinking = ["hmm...", "thinking...", "calculating...", "one sec..."]
const warning = ["uh oh!", "beep beep!", "oops!", "careful!"]
const love = ["I love you.", "You are the best!", "Let’s pair up!", "You got this!"]

// --- thresholds ---
const NEAR_CM = 25
const VERY_NEAR_CM = 12
const LOUD_LEVEL = 160

// --- talk scheduling ---
let lastTalkMs = 0
let talkCooldownMs = 2200

function canTalk(now: number): boolean {
    return (now - lastTalkMs) > talkCooldownMs
}

function say(now: number, text: string): void {
    lastTalkMs = now
    robotPuPro.talk(text)
}

// --- map robot state -> “intent” ---
enum TalkIntent {
    Greeting,
    Exploring,
    Obstacle,
    Dancing,
    Resting,
    Idle
}

function intentFromState(mode: robotPuPro.Mode, distCm: number, loud: number): TalkIntent {
    // Priority first
    if (distCm > 0 && distCm < VERY_NEAR_CM) return TalkIntent.Obstacle
    if (mode == robotPuPro.Mode.Dance || loud > LOUD_LEVEL) return TalkIntent.Dancing
    if (mode == robotPuPro.Mode.Explore) return TalkIntent.Exploring
    if (mode == robotPuPro.Mode.Rest) return TalkIntent.Resting
    return TalkIntent.Idle
}

// --- intent -> utterance ---
function generateLine(intent: TalkIntent, distCm: number, loud: number): string {
    const who = pick(nicknames)

    if (intent == TalkIntent.Greeting) {
        return "Hi " + who + "! " + pick(love)
    }

    if (intent == TalkIntent.Exploring) {
        return pick(thinking) + " exploring time, " + who + "!"
    }

    if (intent == TalkIntent.Obstacle) {
        // Keep it short (warning lines should be fast)
        const d = clampInt(Math.round(distCm), 0, 400)
        return pick(warning) + " wall at " + d + " centimeters!"
    }

    if (intent == TalkIntent.Dancing) {
        if (loud > LOUD_LEVEL) {
            return pick(happy) + " louder! I am dancing!"
        }
        return pick(happy) + " dance mode, " + who + "!"
    }

    if (intent == TalkIntent.Resting) {
        return "I am resting... " + pick(love)
    }

    return pick(thinking) + " what should we do next, " + who + "?"
}

// Optional: play a short morse exclamation when the robot is excited
function maybeMorse(now: number, loud: number): void {
    if (loud > LOUD_LEVEL && Math.randomRange(0, 10) == 0) {
        robotPuPro.morseText("HI", 60)   // plays .... ..
        lastTalkMs = now
    }
}

// --- main loop ---
basic.forever(function () {
    const now = control.millis()

    const mode = robotPuPro.mode()
    const distCm = robotPuPro.sonarDistanceCm()
    const loud = input.soundLevel()

    const intent = intentFromState(mode, distCm, loud)

    // Speak more aggressively when obstacle is close
    talkCooldownMs = (intent == TalkIntent.Obstacle) ? 900 : 2200

    if (canTalk(now)) {
        const line = generateLine(intent, distCm, loud)
        say(now, line)
        maybeMorse(now, loud)
    }

    basic.pause(50)
})

```

---

## 🧪 5. Testing & Tuning

1. **Mode association**:
   1. Set PU to explore / dance / rest and confirm the speech changes.
2. **Obstacle callouts**:
   1. Put a wall close to trigger the obstacle intent.
   2. Tune `VERY_NEAR_CM` and `NEAR_CM`.
3. **Too much talking**:
   1. Increase `talkCooldownMs`.
   2. Add more randomness (e.g. speak only with `Math.randomRange(0,3)==0`).
4. **More cute content**:
   1. Expand the arrays (`happy`, `warning`, `love`).
   2. Add more template variants in `generateLine(...)`.

---

## 🚀 6. Next Steps

* **Talk + emotion integration**: connect with `emotion-pu.md` and let emotion choose the vocabulary.
* **Conversation memory**: store the last few lines and avoid repeating them.
* **Radio chat**: send/receive short messages via micro:bit radio and have PU “reply”.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
