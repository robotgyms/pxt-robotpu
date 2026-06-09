# Learn to skate
We put on roller blades on robot PU.
Use reinforcement learning to make robot PU learn skating.

Reward function: 
- Reward forward momentum by accumulating positive Y acceleration from the IMU.
- penalty for falling down (robotPu.bodyPitch()/robotPu.bodyRoll() angle > 60 degrees)

Adjust:
- w_t: skate roll
- l_t: skate step size
- s_t: skate step height
- skateSpeed1: left foot
- skateSpeed2: right foot  

```javascript
robotPu.setServoTrim(-6, -5, -6, -5, -8, 0)
let w_t = 22  // skate roll
let l_t = 45  // skate step size
let s_t = 15  // skate foot height
let h_t = 30  // skate leg height
let skates1 = [90 - w_t,       90 - 5,  90 + w_t - s_t, 90 - h_t,  90 + 55,  90 + 5]; // skate gait 1 (left foot on ground)
let skates2 = [90,             90 + l_t+5, 90,             90 + l_t-5, 90 - l_t, 90 - 15]; // skate gait 2 (left foot on ground)
let skates3 = [90 - w_t + s_t, 90 + h_t,  90 + w_t,       90 + 5,  90 - 55,  90 + 5]; // skate gait 3 (right foot on ground)
let skates4 = [90,             90 - l_t-5, 90,             90 - l_t+5, 90 + l_t, 90 - 15]; // skate gait 4 (right foot on ground)
let skateSpeed1 = [1,3,6,3,6,1]  // left foot
let skateSpeed2 = [6,3,1,3,6,1]  // right foot
let state = 0

function skate(speedGain:number) {
    switch(state){
        case 0:
            if (robotPu.moveServos(skates1, skateSpeed1, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true){
                state += 1;
            }
            break;
        case 1:
            if (robotPu.moveServos(skates2, skateSpeed1, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true){
                state += 1;
            }
            break;
        case 2:
            if (robotPu.moveServos(skates3, skateSpeed2, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true){
                state += 1;
            }
            break;
        case 3:
            if (robotPu.moveServos(skates4, skateSpeed2, [0, 1, 2, 3], speedGain, [4, 5], speedGain) == true){
                state += 1;
            }
            break;
    }
    state = state % 4;
}

robotPu.talk("Skating")
basic.forever(function () {
    skate(1.0)
    // to do: learn from reward momentum
    basic.pause(10)
})
```