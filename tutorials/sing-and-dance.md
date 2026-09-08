# Sing and Dance (Robot PU)

This tutorial shows how to make Robot PU compose a disco song, sing it, and dance at the same time.

## Prerequisites

- Open https://makecode.microbit.org
- Add the Robot PU extension
- Make sure the robot is on a flat, non-slippery surface with good battery

## How it works

Robot PU has four building blocks that fit together for this project:

- `robotPuPro.greet()` — wakes up and calibrates the robot.
- `robotPuPro.setDanceSpeed(6)` — sets a fast, energetic dance speed (default is 2.0; higher is faster).
- `robotPuPro.composeSong(SongStyle.Disco)` and `robotPuPro.composeSong(SongStyle.Cute)` — compose new song strings in each style.
- `robotPuPro.sing(song, 120)` — plays the song at 120 BPM; it is **blocking**, so the robot finishes the song before moving on.
- `robotPuPro.dance()` — performs one step of the beat-reactive dance. Call it in a loop so the robot keeps dancing.

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
2. `setDanceSpeed(6)` makes the dance fast and energetic.
3. The first `basic.forever` composes an 8-bar disco loop, sings it three times, then composes a cute-style loop, sings it three times, and repeats forever.
4. The second `basic.forever` keeps calling `dance()` so the robot moves to the beat.

## Tuning the performance

| To change | Adjust |
|---|---|
| Song style | Use `SongStyle.Disco`, `SongStyle.Cute`, or alternate them as in the example |
| Singing speed | Pass a BPM to `robotPuPro.sing(song, 120)` or change the number |
| Dance speed | Use `robotPuPro.setDanceSpeed(...)` — higher is faster; try 1.5–6.0 |
| Dance smoothness | Increase `basic.pause(...)` in the dance loop if the robot wobbles |
| Stop | Reset the micro:bit or power off the robot |

## Troubleshooting

- **Robot does not sing** — check that the micro:bit volume is up and the buzzer/speaker is connected.
- **Robot falls while dancing** — place it on a non-slippery surface, reduce the dance speed, or increase `basic.pause(...)`.
- **No sound at all** — make sure the micro:bit V2 speaker is enabled in the editor settings.

## Next steps

- Combine `robotPuPro.composeSong(SongStyle.Disco)` with your own LED patterns.
- Use `robotPuPro.talk("Disco time!")` before the song starts.
- Read the `dance-pu.md` tutorial to build custom dance choreography.
