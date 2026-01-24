
# 🤖 Robot PU: Text APIs + PU Peer Chat (Radio Talk) Project Wiki

This tutorial has two parts:

1. A quick demo of the MakeCode **Text** APIs (string processing).
2. A **PU-to-PU chat** program: multiple Robot PU units on the same radio channel will automatically broadcast status and “talk” to each other.

---

## 📌 1. Text APIs you will use

The MakeCode Text reference is:

https://makecode.microbit.org/reference/text

The main APIs we’ll demonstrate:

* `text.charAt(i)`
* `text.charCodeAt(i)`
* `text.compare(other)`
* `text.substr(start, length)`
* `parseFloat(text)`
* `text.indexOf(sub)`
* `text.includes(sub)`
* `text.split(separator)`
* `text.isEmpty()`

---

## 🧪 2. Mini demo: process text then ask PU to talk

Copy into MakeCode JavaScript:

```typescript
let s = "PU|peu|Dance|12.5"

// 1) split
let parts = s.split("|")

// 2) substr
let tag = s.substr(0, 2)

// 3) indexOf / includes
let hasBar = s.indexOf("|") >= 0
let hasDance = s.includes("Dance")

// 4) charAt / charCodeAt
let firstChar = s.charAt(0)
let firstCode = s.charCodeAt(0)

// 5) compare
let sameTag = tag.compare("PU") == 0

// 6) parseFloat
let dist = parseFloat(parts[3])

// 7) isEmpty
let empty = "".isEmpty()

// Now let Robot PU speak a summary
robotPu.talk(
    "tag " + tag +
    ", dance " + hasDance +
    ", dist " + dist +
    ", first " + firstChar +
    ", code " + firstCode +
    ", ok " + sameTag +
    ", empty " + empty
)
```

---

## 📻 3. PU Peer Chat: radio status protocol

We will broadcast a status string that looks like:

```
PU|<name>|<mode>|<distCm>|<loud>|<ts>
```

Example:

```
PU|pu-123456789|Explore|42.0|88|123456
```

Requirements:

* All Robot PU units must share the same radio channel: `robotPu.setChannel(166)` (or your chosen channel).
* Each robot periodically broadcasts its own status.
* When a robot receives another robot’s status, it:
  1. Says: `<other name> + activity`
  2. Replies with its own name + status
  3. Adds some cute talk (random)

---

## 💻 4. Full Program

This program can live in your `test.ts`.

Key pieces:

* `radio.onReceivedString(...)` parses status strings using the Text APIs.
* It still supports Robot PU command strings by forwarding `#...` messages into `robotPu.runStringCommand(...)`.

Copy/paste example:

```typescript
function randRange(lo: number, hi: number): number {
    const anyMath = Math as any
    if (anyMath && typeof anyMath.randomRange === "function") {
        return anyMath.randomRange(lo, hi)
    }
    return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

function pick(arr: string[]): string {
    return arr[randRange(0, arr.length - 1)]
}

const myName = "pu-" + control.deviceSerialNumber()
const cuteTalks = [
    "hi hi!",
    "let's pair up!",
    "easy peasy!",
    "woohoo!",
    "you got this!"
]

let lastReplyMs = 0
const replyCooldownMs = 1500

function modeToText(m: robotPu.Mode): string {
    // Use compare() here (Text API)
    const s = "" + m
    if (s.compare("3") == 0) return "Dance"
    if (s.compare("1") == 0) return "Explore"
    if (s.compare("0") == 0) return "Rest"
    return "Mode" + s
}

function makeStatusString(): string {
    const mode = modeToText(robotPu.mode())
    const dist = robotPu.sonarDistanceCm()
    const loud = input.soundLevel()
    const ts = control.millis()
    return "PU|" + myName + "|" + mode + "|" + dist + "|" + loud + "|" + ts
}

function sendStatus(): void {
    radio.sendString(makeStatusString())
}

control.inBackground(function () {
    while (true) {
        sendStatus()
        basic.pause(3000)
    }
})

robotPu.setChannel(166)
robotPu.talk("Peer chat on!")

radio.onReceivedString(function (receivedString: string) {
    // Text API: isEmpty
    if (receivedString.isEmpty()) return

    // Preserve remote command feature: allow "#putHello" etc.
    // Text API: substr + compare
    if (receivedString.substr(0, 1).compare("#") == 0) {
        robotPu.runStringCommand(receivedString)
        return
    }

    // Fast filters
    // Text API: indexOf + includes
    if (receivedString.indexOf("|") < 0) return
    if (!receivedString.includes("PU|")) return

    // Text API: substr
    if (receivedString.substr(0, 3) != "PU|") return

    // Text API: split
    const parts = receivedString.split("|")
    if (parts.length < 6) return

    const otherName = parts[1]
    const otherMode = parts[2]

    // Text API: parseFloat
    const otherDist = parseFloat(parts[3])
    const otherLoud = parseFloat(parts[4])

    // Avoid talking to ourselves
    // Text API: compare
    if (otherName.compare(myName) == 0) return

    // Text API: charAt + charCodeAt
    const first = otherName.charAt(0)
    const firstCode = otherName.charCodeAt(0)

    robotPu.talk(otherName + " is " + otherMode + ". " + pick(cuteTalks))
    robotPu.talk("I heard " + first + " code " + firstCode)

    const now = control.millis()
    if (now - lastReplyMs > replyCooldownMs) {
        lastReplyMs = now
        robotPu.talk("I am " + myName + ", " + modeToText(robotPu.mode()))
        sendStatus()
    }
})

```

---

## 🧪 5. Testing

1. Flash the same program to **two** Robot PU units.
2. Make sure both units use the same channel (default `166`).
3. Put the robots near each other.
4. You should hear a back-and-forth:

   1. “pu-xxxx is exploring”
   2. “I am pu-yyyy, I am exploring too”

If they talk too frequently:

* Increase the broadcast interval.
* Add a per-sender reply cooldown.

---

*For more information, visit [robotgyms.com/pu](https://robotgyms.com/pu).*
