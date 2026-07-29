# Decision engine: follow the leader while avoiding obstacles (Robot PU)

When you combine leader‑following (global goal) with obstacle avoidance (local safety), you immediately run into a classic robotics problem:

Global navigation goals often conflict with local collision‑avoidance rules.

This is not just a Robot PU issue — it’s the same challenge faced by drones, autonomous cars, warehouse robots, and swarm robots.

The good news is that robotics has several well‑studied algorithms designed exactly for this situation.

Below is a clear breakdown of the best approaches, why they work, and which ones are practical for Robot PU.

## Algorithm options (quick overview)

## 1. Potential Fields (Attractive + Repulsive Forces)
This is the most intuitive and swarm‑friendly method.

How it works
The leader heading acts as an attractive force pulling the follower forward.
Obstacles act as repulsive forces pushing the robot away.
The robot moves in the direction of the vector sum.
Why it solves the conflict
The robot naturally balances:

“Go toward the leader”
“Avoid obstacles”
…without needing explicit rules.

Pros
Simple
Smooth motion
Works well for swarms
Cons
Can get stuck in local minima (e.g., corners)
Perfect for Robot PU?
Yes. Easy to implement with compass + sonar.

## 2. Behavior Arbitration (Subsumption Architecture)
This is Rodney Brooks’ famous layered robot architecture.

How it works
You define behaviors with priorities:

Avoid obstacles (highest priority)
Follow leader heading
Cruise forward (lowest priority)
The highest‑priority behavior that triggers takes control.

Why it solves the conflict
Obstacle avoidance always wins, but only temporarily.
Once clear, the robot resumes following the leader.

Pros
Very robust
Easy to reason about
Works well with simple sensors
Cons
Motion can be jerky
No blending of behaviors
Perfect for Robot PU?
Yes. Very easy to implement.

## 3. Vector Field Histogram (VFH)
A more advanced version of potential fields.

How it works
Build a histogram of obstacle directions
Choose the safest direction closest to the leader’s heading
Why it solves the conflict
It explicitly finds a collision‑free direction that is as close as possible to the leader’s heading.

Pros
Smooth
Avoids local minima
Used in real robots (e.g., Pioneer robots)
Cons
More computation
Requires more tuning
Perfect for Robot PU?
Possibly. Works if simplified.

## 4. Dynamic Window Approach (DWA)
Used in ROS navigation stack.

How it works
Simulates possible motions
Chooses the one that avoids obstacles and moves toward the goal
Why it solves the conflict
It optimizes both goals simultaneously.

Pros
Very robust
Handles dynamics
Cons
Too heavy for microcontrollers
Requires velocity simulation
Perfect for Robot PU?
No. Too computationally expensive.

## 5. Boids‑Style Flocking (Reynolds Rules)
Classic swarm algorithm.

Three rules:
Cohesion → move toward leader
Separation → avoid obstacles and other robots
Alignment → match leader heading
Why it solves the conflict
Obstacle avoidance is built into the “separation” rule.

Pros
Natural swarm behavior
Smooth motion
Scales to many robots
Cons
Harder to tune
Requires balancing weights
Perfect for Robot PU?
Yes. Works surprisingly well with simple sensors.

## 6. Hybrid: Leader Heading + Obstacle Avoidance Override
This is the simplest practical solution.

How it works
Normally follow leader heading
If obstacle detected → temporarily override with avoidance turn
After clearing → resume leader heading
Why it solves the conflict
It’s a compromise between subsumption and potential fields.

Pros
Easy
Works well
Predictable
Cons
Not as smooth as potential fields
Perfect for Robot PU?
Yes. Easiest to implement.

## Which algorithm should you use for Robot PU?
Here’s the honest breakdown:

Algorithm	Works on PU?	Difficulty	Smoothness	Notes
Potential Fields	✔️	Medium	High	Best balance of simplicity + smoothness
Subsumption	✔️✔️	Easy	Medium	Easiest to implement, very reliable
VFH	✔️	Hard	High	Great but complex
DWA	❌	Very Hard	High	Too heavy for micro:bit
Boids	✔️	Medium	High	Great for multi‑robot swarms
Hybrid Override	✔️✔️	Easy	Medium	Practical and effective

## Final recommendation (Robot PU friendly)
For Robot PU followers:

Use Hybrid Override: Follow the leader’s heading unless an obstacle is detected, then temporarily override with avoidance behavior.

This gives you:

smooth following
safe navigation
low CPU load
easy debugging
swarm scalability

## Robot PU follower (Hybrid Override)

Radio‑controlled heading + speed, with local obstacle avoidance.

```typescript
// -----------------------------
// Radio setup
// -----------------------------
radio.setGroup(42)

// Leader broadcasts: "heading,speed"
// heading = 0..359 degrees
// speed   = -100..100 (joystick Y)
let targetHeading = 0
let targetSpeed = 0

radio.onReceivedString(function (msg) {
let parts = msg.split(",")
if (parts.length == 2) {
targetHeading = parseInt(parts[0])
targetSpeed = parseInt(parts[1])
}
})

// -----------------------------
// Hybrid Override Parameters
// -----------------------------
const EMERGENCY_STOP_CM = 10     // hard stop
const AVOID_CM = 20              // avoidance threshold
const AVOID_TURN = -0.9          // strong turn (negative = right)
const FOLLOW_GAIN = 1 / 90       // heading error → turn

// -----------------------------
// Helper: heading error
// -----------------------------
function headingError(): number {
let myHeading = input.compassHeading()
let err = targetHeading - myHeading

    // Wrap to [-180, +180]
    if (err > 180) err -= 360
    if (err < -180) err += 360

    return err
}

// -----------------------------
// Helper: compute turn from heading
// -----------------------------
function computeFollowTurn(): number {
let err = headingError()
let turn = err * FOLLOW_GAIN

    // clamp to [-1, +1]
    if (turn > 1) turn = 1
    if (turn < -1) turn = -1

    return turn
}

// -----------------------------
// Helper: compute forward speed
// -----------------------------
function computeFollowSpeed(): number {
// joystick Y (-100..100) → speed (-2..2)
return targetSpeed / 50
}

// -----------------------------
// Main loop: Hybrid Override
// -----------------------------
basic.forever(function () {

    // Read center sonar bin
    let d = robotPuPro.frontDistanceArray()[2]

    // 1) Emergency stop
    if (d > 0 && d < EMERGENCY_STOP_CM) {
        robotPuPro.walk(0, 0)
        basic.showIcon(IconNames.No)
        return
    }

    // 2) Obstacle avoidance override
    if (d > 0 && d < AVOID_CM) {
        // Turn away from obstacle (turn right)
        robotPuPro.walk(1.0, AVOID_TURN)
        return
    }

    // 3) Normal follow mode
    let fwd = computeFollowSpeed()
    let turn = computeFollowTurn()

    robotPuPro.walk(fwd, turn)
    basic.pause(20)
})
```

## How This Works
Normal Mode
Robot aligns its compass to the leader’s heading
Robot matches the leader’s joystick speed
Smooth, coordinated swarm movement
Override Mode
Triggered when sonar detects an obstacle:

Emergency stop if dangerously close
Avoidance turn if moderately close
Leader commands are ignored temporarily
Once clear, robot resumes following
This ensures:

Safety
Smoothness
Low CPU usage
Scalability to many followers

## Robot PU leader (Gamepad controller)

Broadcasts heading + speed to all followers.

```typescript
// -------------------------------------
// Leader Gamepad for Robot PU Swarm
// Compass heading + joystick speed → radio
// -------------------------------------
radio.setGroup(42)   // All robots must use the same group

basic.forever(function () {

    // 1. Compass heading (0–359 degrees)
    let heading = input.compassHeading()

    // 2. Joystick Y speed (-100..100)
    // Forward = positive, backward = negative
    let speed = input.rotation(Rotation.Pitch)

    // 3. Pack into a simple string: "heading,speed"
    let msg = heading + "," + speed

    // 4. Broadcast to all followers
    radio.sendString(msg)

    basic.pause(80)   // ~12.5 updates per second
})
```

## How It Works
✔ Compass heading
The leader’s orientation becomes the global direction for the swarm.

✔ Joystick speed
The leader controls how fast the swarm moves:

Push forward → swarm advances
Pull back → swarm reverses
Center → swarm stops
✔ Radio broadcast
Every follower receives the same "heading,speed" packet and reacts accordingly.

✔ Update rate
80 ms is a sweet spot:

Fast enough for smooth control
Slow enough to avoid radio congestion

## Tuning guide (the part that usually matters)

- **`radio` update rate**
  - Start with `basic.pause(80)` on the leader.
  - If followers feel laggy, try `50..60ms`.
  - If radio becomes unreliable with many robots, increase to `100..150ms`.
- **`FOLLOW_GAIN`**
  - If follower turns too slowly, increase (example: `1/70`).
  - If follower oscillates left/right, decrease (example: `1/110`).
- **`AVOID_CM` and `EMERGENCY_STOP_CM`**
  - Increase `AVOID_CM` if the robot reacts too late.
  - Keep `EMERGENCY_STOP_CM` conservative for safety.
- **Avoidance direction**
  - Current example always turns right.
  - If you want smarter avoidance, read left vs right bins:
    - `robotPuPro.frontDistanceArray()[1]` (left-ish)
    - `robotPuPro.frontDistanceArray()[3]` (right-ish)
    - Turn toward the side with more space.

## Troubleshooting

- **Follower ignores heading / turns randomly**
  - Ensure compass is calibrated.
  - Keep robots away from metal tables / magnets.
- **Follower jitters near obstacles**
  - Sonar can be noisy; add a small hysteresis:
    - enter avoid at `AVOID_CM`
    - exit avoid only when `d > AVOID_CM + 5`
- **Follower keeps moving when radio signal is lost**
  - Add a “radio timeout” (store last receive time; stop if too old).