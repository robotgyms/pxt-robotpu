# RoboVoice — Melodic Robotic Speech Without a Voice Synthesizer

## The Problem

Robot PU previously used the `pxt-billy` extension to speak text aloud.
The micro:bit extension review team requires that extensions not carry heavyweight third-party dependencies.
`pxt-billy` was removed, so we needed a self-contained way for the robot to "talk".

---

## The Idea

Instead of synthesizing human speech, we make the robot **sing the text as a melody**.
Each letter in the spoken text is mapped to a musical tone.
The result is a robotic, melodic voice — not human, but expressive and pleasant to listen to.

The key insight is:

> **If every note belongs to the same musical scale, any combination of notes will sound harmonious.**

We chose the **A-pentatonic scale** because:
- It contains only 5 note types per octave (A, C, E, G, and their octaves).
- There are **no dissonant intervals** — every pair of notes sounds good together.
- The **A note** (440 Hz) is widely regarded as the most neutral and pleasant pitch for human hearing (it is the international tuning reference).

---

## Full Printable ASCII Coverage

Every printable ASCII character produces a musical event — nothing is silently skipped:

| Category | Characters | Musical Effect |
|----------|-----------|---------------|
| **Letters** | a–z | Frequency-ranked pentatonic indices (see Layer 2) |
| **Digits** | 0–9 | Descending scale: `0`=A5 (high) → `9`=G3 (low) — robotic counting feel |
| **Excitement** | `!` | Sharp A5 accent (180ms) + rest + contour reset |
| **Question** | `?` | Rising two-note glide: E4 (80ms) → A5 (160ms) |
| **Full stop** | `.` | Low A3 (150ms) + rest + hard reset to A4 — sentence end / calm |
| **Comma** | `,` | Brief dip rest (60ms) + slight contour fall |
| **Pause** | `;` `:` | Medium rest (75ms) + neutral drift |
| **Dash** | `-` `—` | Deliberate rest (100ms) |
| **Apostrophe** | `'` | Tiny +1 semitone glide (30ms) — keeps contraction flow |
| **Open bracket** | `(` `[` `{` | Drop to low G3 (60ms) — parenthetical aside |
| **Close bracket** | `)` `]` `}` | Rise back to A4 (60ms) — exit aside |
| **Special symbols** | `@` `#` `$` `%` `&` `*` | Sharp C5 accent (55ms) — emphasis |
| **Operators** | `+` `=` | Neutral C4 tap (60ms) |
| **Slash** | `/` `\` | Ascending two-note glide C4→E4 |
| **Angle brackets** | `<` `>` | Descending two-note G4→E4 |
| **Underscore** | `_` | Low sustained G3 (100ms) — bass note |
| **Wobble** | `^` `~` | Gentle two-note wobble G4→A4 |
| **Backtick** | `` ` `` | Short low C3 accent (40ms) |
| **Double quote** | `"` | Two-note A4→A5 opening/closing emphasis |
| **Space** | ` ` | Rest (90ms) + drift toward neutral A4 |
| **Other ASCII** | remaining | Neutral C4 tap (55ms) |

---

## Design Layers

The `RoboVoice` class stacks five techniques on top of each other:

### Layer 1 — A-Pentatonic Pitch Set

The robot can only play tones from this fixed set of 13 pitches across three octaves:

| Index | Note | Frequency (Hz) | Family |
|-------|------|---------------|--------|
| 0  | A2 | 110  | A ← |
| 1  | C3 | 131  | C |
| 2  | E3 | 165  | E |
| 3  | G3 | 196  | G |
| 4  | A3 | 220  | A ← |
| 5  | C4 | 262  | C |
| 6  | E4 | 330  | E |
| 7  | G4 | 392  | G |
| 8  | A4 | 440  | **A ← default** |
| 9  | C5 | 523  | C |
| 10 | E5 | 659  | E |
| 11 | G5 | 784  | G |
| 12 | A5 | 880  | A ← |

Because all pitches belong to A-pentatonic, no matter what word is spoken, the result is always in key.

---

### Layer 2 — Frequency-Rank Letter Mapping

English letters appear with different frequencies in natural text.
We use the **corpus frequency rank** (from most to least common) to assign scale indices:

| Frequency Rank | Letters | Scale Index | Note | Why |
|---------------|---------|-------------|------|-----|
| 1–6 (most common) | E, T, A, O, I, N | 8, 8, 12, 4, 8, 6 | **A4, A4, A5, A3, A4, E4** | Most letters heard → A family |
| 7–14 | S, H, R, D, L, C, U, M | 9, 7, 10, 9, 7, 10, 9, 7 | C5/G4/E5 | Mid-range pleasant tones |
| 15–26 (rare) | W, F, G, Y, P, B, V, K, J, X, Q, Z | 3–6 | G3/C4/E4 | Lower, less frequent presence |

Because **E, T, A, O, I, N** account for roughly **60% of all letters** in English text, the robot's melody will land on A notes the majority of the time — exactly as intended.

---

### Layer 3 — Markov Pitch Smoothing

A naive mapping jumps directly from one pitch to the next, producing jarring leaps (e.g., A2 → A5 in one step).

Instead, each output pitch is computed as a **weighted average** of the previous output and the new target:

```
smoothIndex = previousIndex × 0.6 + targetIndex × 0.4
```

This is a first-order Markov process (exponential moving average).
The result is that pitches **glide smoothly** from note to note, like a theremin or a robot humming.

Consecutive similar letters (e.g., "ll", "ss") produce a sustained tone rather than a repeated click.

---

### Layer 4 — Pitch Contour

Natural speech has **intonation** — pitch rises in the middle of words and falls at the end of sentences.
We simulate this with a `contourBias` variable:

- **Vowel encountered** → `contourBias += 0.5` (pitch pushed upward)
- **Consonant encountered** → `contourBias × 0.7` (bias decays toward zero)
- **Space or punctuation** → `contourBias -= 1`, and `smoothIndex` drifts back toward A4

This means the melody naturally rises through a word and settles back to a neutral pitch between words — mimicking the rise-fall shape of spoken language.

---

### Layer 5 — Duration Weighting

Different letter types have different natural durations in speech:

| Letter type | Examples | Duration |
|------------|---------|---------|
| Vowels | a, e, i, o, u | **140 ms** — long, voiced |
| Frequent consonants | n, s, r, l, m, h | **80 ms** — medium |
| Stop consonants | p, b, t, k, d, g | **45 ms** — short percussive pop |
| Other consonants | f, w, y, v, ... | **65 ms** — default |
| Space / punctuation | ` `, `.`, `!`, `?` | **90 ms rest** |

Vowels are long because they carry the vowel sound in speech.
Stop consonants are short because they are percussive pops with no sustained tone.
This rhythm gives the melody a natural "speech-like" cadence.

---

## Example

Speaking `"Hello Robot"` produces approximately:

```
h  → 45ms  G4  (stop consonant, mid-range)
e  → 140ms A4  (vowel, A-family, contour rises)
l  → 80ms  ~A4 (smoothed, near previous)
l  → 80ms  ~A4 (smoothed, nearly same)
o  → 140ms A4  (vowel, contour rises further)
   → 90ms  rest (space, contour falls, pitch drifts to A4)
r  → 65ms  ~E5 (contour rising from A4)
o  → 140ms A5  (vowel, contour pushes to A5)
b  → 45ms  ~A4 (stop, smoothed back)
o  → 140ms A4  (vowel)
t  → 45ms  ~A4 (stop, short)
```

The overall contour rises through each word and resets at the space — just like natural speech intonation.

---

## Morse Code Support

Robot PU can also play **standard ITU morse code** directly.
Pass a morse string to `robotPuPro.talk()` — the robot detects it automatically and routes it through the morse player instead of the melodic voice.

### Text → Morse Translation

Use `RoboVoice.toMorse()` to convert any plain text string into a morse code string:

```typescript
RoboVoice.toMorse("SOS")       // → "... --- ..."
RoboVoice.toMorse("Hello")     // → ".... . .-.. .-.. ---"
RoboVoice.toMorse("Hi 73")     // → ".... ..  --... ...--"
RoboVoice.toMorse("OK?")       // → "--- -.-  ..--.."
```

The returned string uses:
- **Single space** between letters within a word
- **Double space** between words (ITU word gap)
- Silently skips any character not in the ITU table

This output can be passed directly to `talk()`, `morse()`, or stored as a variable:

```typescript
const code = RoboVoice.toMorse("Help me");
robotPuPro.talk(code);                     // auto-detected as morse → plays it

this.voice.morse(code, 60);             // play fast
basic.showString(code);                 // display on LED matrix
```

### Detection

A string is treated as morse if it contains **only** the characters `.`, `-`, `/`, and space — and has at least one `.` or `-`.
Any other character (a letter, digit, etc.) causes it to be treated as normal text.

```typescript
robotPuPro.talk("... --- ...")   // → morse: plays SOS
robotPuPro.talk("Hello!")        // → melody: plays melodic voice
robotPuPro.talk(".--.--.") // → morse: plays the pattern
```

### ITU-Standard Timing

Morse timing is defined by a single unit duration (default **80 ms per dit**).
All other durations are integer multiples:

| Symbol | Character | Duration | Meaning |
|--------|-----------|---------|---------|
| Dit | `.` | 1 unit (80ms) | Short tone at A5 |
| Dah | `-` | 3 units (240ms) | Long tone at A5 |
| Inter-symbol gap | *(between `.` `-` in same letter)* | 1 unit rest | Within a letter |
| Letter gap | `space` or `/` | 3 units rest | Between letters |
| Word gap | `double space` | 7 units rest | Between words |

The pitch is always **A5 (880 Hz)** — the classic radio morse tone, and also the top note of the A-pentatonic scale.

### Separator Styles

Two separator conventions are supported:

```
... --- ...        ← spaces between letters, double-space between words
.../---/...        ← slash-separated (common in text morse notation)
.--.--..--.--.     ← no separators (raw pattern, plays as one continuous letter)
```

### Speed Control

The `morse()` method accepts an optional `unitMs` parameter to control speed:

```typescript
// Slow (great for learning): 120ms per dit
this.voice.morse("... --- ...", 120);

// Standard: 80ms per dit (default)
this.voice.morse("... --- ...");

// Fast (experienced operator): 50ms per dit
this.voice.morse("... --- ...", 50);
```

### Common Morse Patterns

| Pattern | Meaning |
|---------|---------|
| `... --- ...` | SOS |
| `.- .-.. .-.. / --- -.-` | ALL OK |
| `.. / .- -- / .... . .-. .` | I AM HERE |
| `.... . .-.. .-.. ---` | HELLO |
| `-... . . .--.` | BEEP |

---

## Implementation

The algorithm is implemented in the `RoboVoice` class in `robotpu.ts`.

```typescript
// Create a voice instance
let voice = new RoboVoice();

// Speak a phrase — resets pitch state before each utterance
voice.reset();
voice.say("Hello Robot!");

// Or use through RobotPu.talk() which wraps this automatically
robotPuPro.talk("I am ready.");
```

**Public API:**

| Method | Description |
|--------|-------------|
| `speak(text, unitMs?)` | **Smart dispatcher.** Plays morse if text looks like morse, otherwise plays melodic voice. Called by `RobotPu.talk()`. |
| `say(text)` | Play text as a melodic utterance. Blocks until complete. |
| `morse(code, unitMs?)` | Play a morse code string with ITU-standard timing. Default 80ms per dit. |
| `reset()` | Reset smoothed pitch state to neutral A4. Called automatically before each `speak()`. |
| `RoboVoice.toMorse(text)` | **Static.** Translate plain text to ITU morse string. Returns string of `.`, `-`, spaces. |
| `RoboVoice.isMorse(text)` | **Static.** Returns `true` if the string contains only morse characters. |

---

## Why Not Use Text-to-Speech?

The micro:bit V2 has limited processing power and no built-in speech synthesizer.
External TTS libraries (like `pxt-billy`) add significant code size and introduce third-party dependencies that complicate extension review.

The `RoboVoice` approach:
- Uses only the built-in `music` namespace (no extra dependencies)
- Produces output that is clearly robotic but musically pleasant
- Is predictable and deterministic (same text → same melody)
- Works in the simulator as well as on hardware
- Keeps the extension self-contained and review-compliant

---

## Further Reading

- [A-pentatonic scale — Wikipedia](https://en.wikipedia.org/wiki/Pentatonic_scale)
- [English letter frequency — Wikipedia](https://en.wikipedia.org/wiki/Letter_frequency)
- [Exponential moving average](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average)
- [Robot PU extension API](https://robotgyms.com/pu)
