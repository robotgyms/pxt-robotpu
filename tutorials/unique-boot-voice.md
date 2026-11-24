# Create Unique Boot Voice (Robot PU)

This tutorial shows how to give Robot PU its own **audible identity**: a signature sound it plays on power-up, plus a repeating "I'm alive" heartbeat. In a classroom full of PUs, you can tell which robot just woke up — and which radio channel it is listening on — without looking at the screen.

## Prerequisites

- Open <https://makecode.microbit.org>
- Add the Robot PU extension
- micro:bit V2 (sound output on the built-in speaker, or the robot's amplifier)

## The problem

Every Robot PU looks the same. When several robots power on at once:

- Which one is yours?
- Which radio channel is each robot using?
- How do you know a robot finished booting and is listening for the gamepad?

Eyes are easy to check from the front — but you can *hear* a robot from anywhere in the room. So we give each PU a unique **voice**: a short chirp at boot, and a two-note pulse that repeats while it is alive.

## Ideas

A robot's identity has two parts:

1. **Radio channel** — `robotPuPro.setChannel(n)` picks the channel; the gamepad must use the same one. A unique channel per robot keeps commands from crossing over.
2. **Boot voice** — a sound that plays right after startup, unique to this robot.

Ways to make a boot voice, from simplest to most custom:

| Voice | API | Unique because |
| --- | --- | --- |
| Speak serial/name | `robotPuPro.greet()` | every PU speaks its own serial number |
| Say a name | `robotPuPro.talk("PU one")` | you pick the words |
| Morse signature | `robotPuPro.morseText("PU1")` | initials/callsign as beeps |
| Tone jingle | `robotPuPro.playToneSequenceMs([659, 523], [150, 300])` | you pick the notes |
| Sound sweep | `music.createSoundExpression(...)` | pitch/wave/effect are yours |
| Composed song | `robotPuPro.sing(robotPuPro.composeSong())` | different every boot |

This tutorial uses a sound-expression chirp plus a repeating two-note heartbeat, but any row in the table works — mix and match.

> **Note:** the first `robotPuPro.*` call in a program triggers the robot startup sequence (stand → calibrate → rest, about 4 s). Sound calls keep working during it, so the boot voice can play while PU stands up.

## Program

Copy the following into the MakeCode **JavaScript** editor:

```typescript
robotPuPro.setChannel(169)
robotPuPro.connectToGamepad()
music.play(music.createSoundExpression(WaveShape.Triangle, 2278, 2244, 125, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
basic.forever(function () {
    basic.showIcon(IconNames.Heart)
    basic.pause(1000)
    basic.showIcon(IconNames.SmallHeart)
    basic.pause(1000)
})
basic.forever(function () {
    music.play(music.tonePlayable(349, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
    music.play(music.tonePlayable(349, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
})
```

## How it works, line by line

- `robotPuPro.setChannel(169)` — this robot's identity on the radio. Pick a different number for every robot.
- `robotPuPro.connectToGamepad()` — starts listening for gamepad commands on that channel.
- `music.play(music.createSoundExpression(...), UntilDone)` — the one-shot **boot chirp**: a triangle-wave tone that sweeps from 2278 Hz down to 2244 Hz over 500 ms. This is the sound you hear when PU finishes starting.
- First `basic.forever` — the **visual heartbeat**: big heart / small heart, one beat per second. You can spot a live PU across the room.
- Second `basic.forever` — the **audible heartbeat**: two F4 quarter notes (349 Hz) repeating. Two `forever` loops run on separate fibers, so the LED and the beep stay in sync without blocking each other — or the gamepad.

## Design your own chirp

The boot voice is one juicy command — `music.createSoundExpression` — with **8 knobs** to turn:

```typescript
music.createSoundExpression(waveShape, startFrequency, endFrequency, startVolume, endVolume, duration, effect, interpolation)
```

Our chirp says: *"play a **Triangle** wave that slides from **2278 Hz** down to **2244 Hz**, fading from volume **125** to **silence** over **500 ms**."* That tiny downward slide plus the fade-out is what makes it sound like a chirpy *"peep!"* instead of a flat beep. Turn the knobs and it becomes a completely different voice:

**Knob 1 — `waveShape`: the flavor of the sound**

| Wave | Sounds like |
| --- | --- |
| `WaveShape.Sine` | a pure, smooth whistle |
| `WaveShape.Triangle` | a soft, flute-like tone |
| `WaveShape.Square` | a buzzy retro video-game beep |
| `WaveShape.Sawtooth` | a harsh, raspy buzz |
| `WaveShape.Noise` | static, wind, or a hiss |

**Knob 2 — `startFrequency → endFrequency`: the pitch slide (in Hz)**

- Slide **down** (2200 → 300): a falling *"pew!"* laser
- Slide **up** (300 → 1600): an excited *"whee!"*
- **Flat** (800 → 800): a plain beep
- Ours (2278 → 2244) slides down just a hair — a quick chirp, not a siren
- The micro:bit speaker is happiest between about 100 and 5,000 Hz

**Knob 3 — `startVolume → endVolume`: the loudness slide (0–255)**

- `255 → 0`: fades out like an echo
- `0 → 255`: fades in — the sound sneaks up on you
- `125 → 0` (ours): a softer chirp that dissolves

**Knob 4 — `duration`: how long**, in milliseconds. Short = chirp, long = siren wail.

**Knob 5 — `effect`: a wobble on top of everything**

| Effect | Sounds like |
| --- | --- |
| `SoundExpressionEffect.None` | a clean slide |
| `SoundExpressionEffect.Vibrato` | wobbly pitch, like a siren or opera singer |
| `SoundExpressionEffect.Tremolo` | wobbly volume, like it's trembling |
| `SoundExpressionEffect.Warble` | fast combined wobble — very robotic |

**Knob 6 — `interpolation`: how the slide travels.** `Linear` slides at a steady speed; `Curve` and `Exponential` start fast then slow down — great for a *"whoosh"* feel.

### Chirp recipes

Swap any of these in for the `music.createSoundExpression(...)` call:

```typescript
// laser "pew!" — buzzy wave, fast downward slide
music.createSoundExpression(WaveShape.Square, 2200, 300, 255, 0, 150, SoundExpressionEffect.None, InterpolationCurve.Linear)

// excited "whee!" — rising slide that gets louder
music.createSoundExpression(WaveShape.Triangle, 400, 1600, 200, 255, 300, SoundExpressionEffect.None, InterpolationCurve.Linear)

// sleepy sigh — smooth wave, slow fall, fades to nothing
music.createSoundExpression(WaveShape.Sine, 800, 300, 200, 0, 800, SoundExpressionEffect.None, InterpolationCurve.Curve)

// robot alarm — flat pitch, but wobbles hard
music.createSoundExpression(WaveShape.Square, 700, 700, 255, 255, 400, SoundExpressionEffect.Warble, InterpolationCurve.Linear)

// burst of static
music.createSoundExpression(WaveShape.Noise, 3000, 3000, 200, 0, 400, SoundExpressionEffect.None, InterpolationCurve.Linear)
```

**Tip:** give every robot in the room a different *slide* — one slides up, one slides down, one wobbles — and you can recognize each one instantly.

## Make it yours

Each robot in the room should sound different. Change any of:

- **Channel**: `setChannel(169)` → your own number; set the same one on your gamepad.
- **Heartbeat pitch**: `349` (F4) → another frequency. Try 392 (G4), 440 (A4), or 523 (C5). Nearby notes sound like different voices.
- **Heartbeat rhythm**: `BeatFraction.Quarter` → `BeatFraction.Eighth` for a faster pulse, or add `basic.pause(500)` between the two notes for a slow *blip... blip*.
- **Icon**: `IconNames.Heart` → `IconNames.Duck`, `IconNames.House`, `IconNames.Happy` — a face works just as well.
- **Boot chirp**: swap the sound expression for a voice instead:

  ```typescript
  robotPuPro.greet()                    // speaks this PU's own serial/name
  robotPuPro.talk("PU one")             // says the name you gave it
  robotPuPro.morseText("PU1")           // your callsign in morse
  robotPuPro.playToneSequenceMs([659, 523], [150, 300])  // a two-note jingle
  ```

## Try it

Flash the program to two PUs with different channels and different heartbeat notes. Power them on at the same time — you should hear two distinct voices and be able to name which is which with your eyes closed.
