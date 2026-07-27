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
    "you got this!",
    "be careful!",
    "new friend!"
]

let lastReplyMs = 0
const replyCooldownMs = 1500

function makeStatusString(): string {
    const mode = "" + robotPu.mode()
    const dist = robotPu.sonarDistanceCm()
    const loud = input.soundLevel()
    const ts = control.millis()
    return "PU|" + myName + "|" + mode + "|" + dist + "|" + loud + "|" + ts
}

control.inBackground(function () {
    while (true) {
        radio.sendString(makeStatusString())
        basic.pause(3000)
    }
})

radio.onReceivedString(function (receivedString: string) {
    // 1) Preserve remote command feature: allow sending commands like "#putHello" over radio
    if (receivedString.charAt(0) == "#") {
        robotPu.runStringCommand(receivedString)
        return
    }

    // 2) Peer chat protocol: PU|<name>|<mode>|<distCm>|<loud>|<ts>
    if (receivedString.length == 0) return
    if (receivedString.substring(0, 3) != "PU|") return

    const parts = receivedString.split("|")
    if (parts.length < 6) return

    const otherName = parts[1]
    const otherMode = parts[2]
    const otherDist = parseFloat(parts[3])
    const otherLoud = parseFloat(parts[4])

    // Avoid talking to ourselves
    if (otherName == myName) return

    robotPu.talk(otherName + " is " + otherMode + ". " + pick(cuteTalks))

    const now = control.millis()
    if (now - lastReplyMs > replyCooldownMs) {
        lastReplyMs = now
        robotPu.talk("I am " + myName + ". " + pick(cuteTalks))
        radio.sendString(makeStatusString())
    }
})

// Default setup
robotPu.setChannel(166)
robotPu.talk("Peer chat ready")
