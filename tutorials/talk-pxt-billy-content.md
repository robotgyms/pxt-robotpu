# 🗣️ Lesson: Giving Robot PU a Real Human Voice (pxt-billy)

> **Built-in voice vs real speech:**
> - `robotPuPro.talk(text)` — built-in **RoboVoice** melodic music engine, no extra library needed.
> - `billy.say(text)` — **real synthesized human speech** (SAM engine). Requires the **[pxt-billy](https://github.com/adamish/pxt-billy)** extension.
>
> This lesson covers the **pxt-billy** approach for when you want an actual spoken voice.

In this lesson, we will transform **Robot PU** from a silent dancer into a talking companion! You will learn how to install a "speech engine," generate long descriptive sentences, and create a "Mood Switcher" using the micro:bit buttons.

---

## 1. Background Setup

**Robot PU** is an AI-powered humanoid buddy that uses a **micro:bit** for its brain. To make him talk, we use a special code library called **pxt-billy**.

This library uses "Speech Synthesis" to build words out of digital sounds in real-time. It is based on a classic engine called SAM (Software Automatic Mouth).

---

## 2. Problem Definition

To make Robot PU a great communicator, we need to solve three challenges:

* **The Voice Box**: Teaching the micro:bit how to synthesize speech.
* **Advanced Vocabulary**: Moving beyond simple phrases to long, interesting sentences.
* **Personality Toggles**: Changing PU's voice from a happy Elf to a grumpy Robot on command.

---

## 3. Basic Idea of Solutions

1. **Extensions**: We will use the MakeCode Extension UI to search for and add `pxt-billy`.
2. **Complex Data Structures**: We will expand our `Content` class with adjectives and conjunctions to create longer sentences.
3. **State Management**: We will use a variable to track PU's "mood" and change his vocal preset accordingly.

---

## 4. Implementation

### Step A: Add the Extension

You must teach MakeCode how to speak before the code will work:

1. Open your project at [makecode.microbit.org](https://makecode.microbit.org/).
2. Click **Extensions** at the bottom of the toolbox.
3. Paste this URL into the search bar: `https://github.com/adamish/pxt-billy`.
4. Select the **billy** extension to add it.

### Step B: The Complete Script

Copy and paste this code into your **JavaScript** tab. It includes the advanced word generator and the Button B mood switcher.

```typescript
/**
 * SECTION 1: ADVANCED CONTENT GENERATOR
 */
class Content {
    loc: string[];
    act: string[];
    sub: string[];
    obj: string[];
    adj: string[]; 
    conj: string[];

    constructor() {
        this.sub = ["I", "He", "She", "They", "Robot PU"];
        this.act = ["liked", "saw", "heard", "felt", "loves"];
        this.obj = ["me", "you", "the dance", "the song", "the code"];
        this.loc = ["here", "there", "up", "down", "in the lab"];
        this.adj = ["shiny", "happy", "weird", "fast", "super"];
        this.conj = ["and", "but", "because", "so"];
    }

    private choice(arr: string[]): string {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Generates a long: [Sub] [Act] [Adj] [Obj] [Conj] [Loc]
    cute_words(): string {
        return this.choice(this.sub) + " " +
            this.choice(this.act) + " " +
            this.choice(this.adj) + " " +
            this.choice(this.obj) + " " +
            this.choice(this.conj) + " " +
            this.choice(this.loc) + ".";
    }
}

/**
 * SECTION 2: INITIALIZATION
 */
let generator = new Content();
let puMood = 0; // 0 = Elf, 1 = Robot
music.setVolume(150); // Set global volume (0-255)
billy.voicePreset(BillyVoicePreset.Elf); // Start as an Elf

/**
 * SECTION 3: INTERACTION
 */

// BUTTON A: Talk!
input.onButtonPressed(Button.A, function () {
    let phrase = generator.cute_words();
    basic.showIcon(IconNames.SmallSquare); // "Open mouth"
    billy.say(phrase); // Blocking speech command
    basic.showIcon(IconNames.Asleep); // "Close mouth"
});

// BUTTON B: Switch Mood (Elf <-> Robot)
input.onButtonPressed(Button.B, function () {
    if (puMood == 0) {
        puMood = 1;
        billy.voicePreset(BillyVoicePreset.Robot);
        basic.showIcon(IconNames.Angry);
        billy.say("I am a grumpy robot");
    } else {
        puMood = 0;
        billy.voicePreset(BillyVoicePreset.Elf);
        basic.showIcon(IconNames.Happy);
        billy.say("I am a happy elf");
    }
    basic.pause(500);
    basic.showIcon(IconNames.Asleep);
});

```
### How the "Sentence Factory" Works
To help kids understand how **Robot PU** generates sentences, it is best to think of it like a **"Sentence Factory"** or a game of **"Mad Libs."** Below is the updated explanation section for your LearnDash page.
Robot PU doesn't just remember full sentences; he builds them from scratch every time you press a button. This is called **Procedural Generation**.

### The Ingredients (The Lists)

Inside the `Content` class, we create several lists of "parts of speech." Think of these as bins in a factory:

* **Subjects (`sub`)**: Who is doing the action?
* **Actions (`act`)**: What is happening?
* **Adjectives (`adj`)**: What does the thing look like?
* **Objects (`obj`)**: What is being acted upon?
* **Conjunctions (`conj`)**: A "glue" word to connect ideas.
* **Locations (`loc`)**: Where is it happening?

### The Robot's Choice (The `choice` function)

The robot has a secret helper function called `choice`. Whenever PU needs a word, he closes his eyes and picks one random item from a bin.

```typescript
private choice(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
}

```

### The Assembly Line (The `cute_words` function)

Finally, PU takes those random choices and glues them together in a specific order with spaces in between.

**The Formula:** `[Subject] + [Action] + [Adjective] + [Object] + [Conjunction] + [Location]`

**An Example Assembly:**

1. **Subject**: "Robot PU"
2. **Action**: "loves"
3. **Adjective**: "shiny"
4. **Object**: "the code"
5. **Conjunction**: "because"
6. **Location**: "in the lab"

**Final Output:** *"Robot PU loves shiny the code because in the lab."*

Even though the grammar might be a little silly, it ensures that Robot PU has thousands of possible things to say, making him feel much more "alive"!

---

## 5. Testing
Code: https://makecode.microbit.org/S81118-63767-88308-72596
Download (.hex): https://github.com/robotgyms/pxt-robotpu/raw/master/tutorials/microbit-robot-pu-pxt-billy-content.hex
1. **Download** the code to your Robot PU.
2. **Toggle Moods**: Press **Button B**. Does PU's face change? Does his voice sound different?
3. **Generate Sentences**: Press **Button A**. Are the sentences longer than before? Does the voice match the mood you picked?
4. **Hardware Check**: On micro:bit V2, sound comes from his chest. On V1, ensure headphones/speakers are on **Pin 0**.

---

## 6. What Can Be Done Next?

### Tweaking the pxt-billy Voice (Pitch & Speed)

To tweak the voice of the `pxt-billy` extension for the BBC micro:bit, you primarily adjust two parameters in the config API: **Pitch** (the frequency of the voice) and **Speed** (how fast the words are spoken).

The "Billy" extension uses an 8-bit style synthesis. Generally, higher pitches sound younger/feminine, while lower pitches sound older/masculine.

### Voice Configuration Guide

| Age Group | Target Voice | Pitch | Speed | Why these settings? |
| --- | --- | --- | --- | --- |
| Toddler | High-pitched/Squeaky | 200–255 | 80 | Max pitch creates a tiny, cartoonish feel; slower speed mimics early speech. |
| 10yo Boy | Pre-pubescent | 160 | 100 | High pitch, but lower than a toddler. Standard speed for clarity. |
| 10yo Girl | Bright/Light | 180 | 110 | Slightly higher pitch and faster tempo than a boy of the same age. |
| Teenager | Fast/Energetic | 140 | 150 | Mid-range pitch but very high speed to mimic fast-talking teens. |
| Young Adult | Clear/Balanced | 100–120 | 110 | Standard "default" settings; clear and modern-sounding. |
| Middle Age | Deep/Settled | 80 | 95 | Lower pitch creates a more "authoritative" or mature tone. |
| Old Person | Raspy/Slow | 60 | 70 | Very low pitch and slow speed creates the effect of a weathered voice. |

### How to apply this in MakeCode

In the JavaScript/Python editor, your configuration block would look like this (using the "Middle Age" example):

```typescript
// Middle Age Voice Example
billy.configure(80, 95, 128, 0)
billy.say("Hello, how are you today?")
```

Note: The `configure` function usually takes four arguments: (`pitch`, `speed`, `mouth`, `throat`). While Pitch and Speed are the most impactful, you can slightly increase the Throat value (the 4th parameter) to `140+` for older voices to make them sound "grittier."

```typescript
radio.onReceivedString(function (receivedString) {
    robotPuPro.runStringCommand(receivedString)
})
radio.onReceivedValue(function (name, value) {
    robotPuPro.runKeyValueCommand(name, value)
})
let pulseDelay = 0
let pitch = 0
let distance = 0
robotPuPro.setChannel(166)
billy.configureVoice(
80,
95,
128,
0
)
billy.say("I have a sonar")
basic.forever(function () {
    if (distance > 2 && distance < 100) {
        // Map 2cm->2000Hz and 100cm->200Hz
        pitch = Math.map(distance, 2, 100, 2000, 200)
        // Map 2cm->100ms and 100cm->800ms
        pulseDelay = Math.map(distance, 2, 100, 100, 800)
        music.setVolume(255)
        music.playTone(pitch, 50)
        basic.pause(pulseDelay)
        // --- CASE 1: DANGER ZONE (Too Close!) ---
        // --- CASE 2: DETECTION ZONE (Reporting Distance) ---
        if (distance > 0 && distance < 6) {
            basic.showIcon(IconNames.Skull)
            // Red Alert Sound
            music.playMelody("C5 P C5 P C5 P C5 P", 500)
            billy.say("Danger, stop!")
        } else if (distance >= 6 && distance < 20) {
            basic.showIcon(IconNames.Target)
            // Report distance: e.g., "Distance 25"
            billy.say("Distance " + distance)
        }
    } else {
        basic.pause(500)
    }
    basic.pause(2000)
})
basic.forever(function () {
    distance = robotPuPro.sonarDistanceCm()
    robotPuPro.walkDo(Math.map(distance, 7, 20, -1, 6), 0)
    basic.pause(10)
})

```

* **More Moods**: Add a third state for `BillyVoicePreset.Dalek` to make PU sound like a metallic villain.
* **Touch Interaction**: Use the micro:bit V2 **Touch Logo** to trigger a "Giggle" sound or a special greeting.
* **Chatty Sonar**: Update your sonar code so that when an object is closer than 10cm, PU shouts "Too close!" in his current mood voice.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*