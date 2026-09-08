# Sing and Dance (Robot PU)

This tutorial shows how to make Robot PU compose a disco song, sing it, and dance at the same time.

## Prerequisites

- Open https://makecode.microbit.org
- Add the Robot PU extension
- Make sure the robot is on a flat, non-slippery surface with good battery

## How it works

Robot PU has three building blocks that fit together for this project:

- `robotPuPro.composeSong(SongStyle.Disco)` — composes a new disco song string.
- `robotPuPro.sing(song)` — plays the song; it is **blocking**, so the robot finishes the song before moving on.
- `robotPuPro.dance()` — performs one step of the beat-reactive dance. Call it in a loop so the robot keeps dancing.
- `robotPuPro.greet()` — wakes up and calibrates the robot.

Because the singing and dancing each run in their own `basic.forever` fiber, the robot can sing and dance at the same time.

## Program

Copy the following into the MakeCode **JavaScript** editor:

```typescript
robotPuPro.greet()
robotPuPro.setDanceSpeed(6)

// keep generating and singing disco songs
basic.forever(function () {
    let song = robotPuPro.composeSong(robotPuPro.SongStyle.Disco)
    // sing the same song 3 times, then compose a new one
    for (let i = 0; i < 3; i++) {
        robotPuPro.sing(song, 120)
    }

    song = robotPuPro.composeSong(robotPuPro.SongStyle.Cute)
    // sing the same song 3 times, then compose a new one
    for (let i = 0; i < 3; i++) {
        robotPuPro.sing(song, 120)
    }
})

// keep dancing to the beat
basic.forever(function () {
    robotPuPro.dance()
    basic.pause(10)
})
```

## What happens

1. `greet()` initializes the robot and stands it up.
2. The first `basic.forever` composes a new 8-bar disco loop in D-Dorian, sings it three times, then composes another.
3. The second `basic.forever` keeps calling `dance()` so the robot moves to the beat.

## Tuning the performance

| To change | Adjust |
|---|---|
| Song style | Use `SongStyle.Cute` instead of `SongStyle.Disco` |
| Speed | Pass a BPM to `robotPuPro.sing(song, 112)` or leave it at the default 120 |
| Dance brightness | The robot already flashes NeoPixels on the beat |
| Stop | Reset the micro:bit or power off the robot |

## Troubleshooting

- **Robot does not sing** — check that the micro:bit volume is up and the buzzer/speaker is connected.
- **Robot falls while dancing** — place it on a non-slippery surface and reduce movement by increasing `basic.pause(...)`.
- **No sound at all** — make sure the micro:bit V2 speaker is enabled in the editor settings.

## Next steps

- Combine `robotPuPro.composeSong(SongStyle.Disco)` with your own LED patterns.
- Use `robotPuPro.talk("Disco time!")` before the song starts.
- Read the `dance-pu.md` tutorial to build custom dance choreography.
