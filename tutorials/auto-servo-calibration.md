```typescript
robotPuPro.start(robotPuPro.Action.API,0)
robotPuPro.stand()
robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, 90)

let a = 35
robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, a)
let left = 35
let leftFound = 0
let right = 120
let rightFound = 0
let leftCount = 0
let rightCount = 0

while (rightFound == 0 && a < 120) {
    robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, a)
    basic.pause(400)
    serial.writeLine("angle:" + a)
    let t = input.rotation(Rotation.Roll)
    serial.writeLine("tilt:" + t)
    if (t == 0 && 0 ==leftFound) {
        leftCount += 1
        if (leftCount > 2) {
            left = a
            leftFound = 1
            leftCount = 0
        }
    } else {
        leftCount = 0
    }
    if (t > 0 && 1 == leftFound) {
        rightCount += 1
        if (rightCount > 2) {
            right = a
            rightFound = 1
            serial.writeLine("right foot:" + (left+right)*0.5)
            basic.pause(4000)
            rightCount = 0
            leftFound = 0
        }
    } else {
        rightCount = 0
    }
    a += 1
}

left = 35
leftFound = 0
right = 120
rightFound = 0
leftCount = 0
rightCount = 0
robotPuPro.servo(robotPuPro.ServoJoint.RightFoot, 90)
a = 130
while (rightFound == 0 && a > 60) {
    robotPuPro.servo(robotPuPro.ServoJoint.LeftFoot, a)
    basic.pause(400)
    serial.writeLine("angle:" + a)
    let t = input.rotation(Rotation.Roll)
    serial.writeLine("tilt:" + t)
    if (t == 0 && 0 == leftFound) {
        leftCount += 1
        if (leftCount > 2) {
            left = a
            leftFound = 1
            leftCount = 0
        }
    } else {
        leftCount = 0
    }
    if (t > 0 && 1 == leftFound) {
        rightCount += 1
        if (rightCount > 2) {
            right = a
            rightFound = 1
            serial.writeLine("left foot:" + (left + right) * 0.5)
            basic.pause(4000)
            rightCount = 0
            leftFound = 0
        }
    } else {
        rightCount = 0
    }
    a -= 1
}
```
