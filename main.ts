// MakeCode blocks wrapper for RobotPu
//% weight=50 color=#e7660b icon="\uf2bd"
//block="Robot PU"
//% groups='["Variables", "Setup", "Sensors", "Actuators", "Actions", "Remote Control"]'
namespace robotPu {
    let robot: RobotPu;

    export enum Mode {
        //% block="rest"
        Rest = 0,
        //% block="explore"
        Explore = 1,
        //% block="jump"
        Jump = 2,
        //% block="dance"
        Dance = 3,
        //% block="kick"
        Kick = 4,
        //% block="walk (remote control)"
        Walk = 5
    }

    export enum ServoJoint {
        //% block="left foot"
        LeftFoot = 0,
        //% block="left leg"
        LeftLeg = 1,
        //% block="right foot"
        RightFoot = 2,
        //% block="right leg"
        RightLeg = 3,
        //% block="head yaw"
        HeadYaw = 4,
        //% block="head pitch"
        HeadPitch = 5
    }

    function ensureRobot(): RobotPu {
        if (!robot) {
            const sn = "pu-" + control.deviceSerialNumber();
            robot = new RobotPu(sn, "peu");
            robot.calibrate();
            control.inBackground(function () {
                // add background task to update states and execute behavior logic
                while (true) {

                    robot.updateStates();   // Checks sensors and falls
                    robot.stateMachine();   // Executes current behavior logic
                    // Use a slightly larger pause to prevent CPU starvation
                    // 20ms is standard for robotics to maintain 50Hz responsiveness
                    // but robot PU need 200Hz to maintain smooth movement
                    basic.pause(5);
                }
            });
        }
        return robot;
    }

    /** Robot PU introduce itself  */
    //% blockId=robotpu_greet block="greet"
    //% weight=55 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function greet(): void {
        ensureRobot().greet();
    }

    /** Set current robot behavior mode (state machine). */
    //% blockId=robotpu_setMode block="set mode %mode"
    //% weight=54 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function setMode(mode: Mode): void {
        const r = ensureRobot();
        r.gst = mode as number;
        r.lastCmdTS = control.millis();
        // sticky mode with large timeout
        ensureRobot().beaconTimeout = 200000;
    }

    //% blockId=robotpu_left_eye_bright block="set left eye brightness %brightness"
    //% weight=53 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    //% brightness.min=0 brightness.max=1 brightness.defl=0.05
    export function leftEyeBright(brightness: number): void {
        const r = ensureRobot();
        brightness = Math.min(1, Math.max(0, brightness));
        const b = Math.min(1023, Math.max(0, Math.round(brightness * 1023)));
        r.wk.leftEyeBright(b);
    }

    //% blockId=robotpu_right_eye_bright block="set right eye brightness %brightness"
    //% weight=52 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    //% brightness.min=0 brightness.max=1 brightness.defl=0.05
    export function rightEyeBright(brightness: number): void {
        const r = ensureRobot();
        brightness = Math.min(1, Math.max(0, brightness));
        const b = Math.min(1023, Math.max(0, Math.round(brightness * 1023)));
        r.wk.rightEyeBright(b);
    }

    /** Set a Robot PU servo/joint angle (0-180). */
    //% blockId=robotpu_servo block="move %joint servo to %angle"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% weight=65 blockGap=8
    export function servo(joint: ServoJoint, angle: number): void {
        const r = ensureRobot();
        angle = Math.min(180, Math.max(0, Math.floor(angle)));
        r.wk.servo(joint as number, angle);
    }

    /** Move a Robot PU servo/joint toward a target angle using progressive stepping. */
    //% blockId=robotpu_servo_step block="move %joint servo to %target with step size %stepSize"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% target.min=0 target.max=180 target.defl=90
    //% stepSize.min=1 stepSize.max=20 stepSize.defl=2
    //% weight=64 blockGap=8
    export function servoStep(joint: ServoJoint, target: number, stepSize: number): void {
        const r = ensureRobot();
        target = Math.min(180, Math.max(0, Math.floor(target)));
        stepSize = Math.min(20, Math.max(1, Math.floor(stepSize)));
        r.wk.servoStep(target, stepSize, joint as number, r.pr);
    }

    /** Walk with speed (-5 to 5) and turn bias (-1 to 1). Positive speed is forward. Negative turn is left, 0 is straight, Positive is right. */
    //% blockId=robotpu_walk block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% group="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=55 blockGap=8
    export function walk(speed: number, turn: number): number {
        return ensureRobot().walk(speed, turn);
    }

    /** Walk with the given speed and turn bias. Statement version (no return). */
    //% blockId=robotpu_walk_do block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% group="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=54 blockGap=8
    export function walkDo(speed: number, turn: number): void {
        ensureRobot().walk(speed, turn);
    }

    /** Explore autonomously using sonar */
    //% blockId=robotpu_explore block="explore"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=51 blockGap=8
    export function explore(): number {
        return ensureRobot().explore();
    }

    /** Explore the environment using sonar. Statement version (no return). */
    //% blockId=robotpu_explore_do block="explore"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=50 blockGap=8
    export function exploreDo(): void {
        ensureRobot().explore();
    }

    //% blockId=robotpu_side_step block="side step %direction"
    //% subcategory="Actions"
    //% group="Actions"
    //% direction.min=-1 (move left) direction.max=1 (move right) direction.defl=-1
    //% weight=50 blockGap=8
    export function sideStep(direction: number): number {
        return ensureRobot().sideStep(direction);
    }

    //% blockId=robotpu_side_step_do block="side step %direction"
    //% subcategory="Actions"
    //% group="Actions"
    //% direction.min=-1 direction.max=1 direction.defl=-1
    //% weight=49 blockGap=8
    export function sideStepDo(direction: number): void {
        ensureRobot().sideStep(direction);
    }

     //% blockId=robotpu_sonar_distance_cm block="sonar distance (cm)"
     //% subcategory="Sensors"
     //% group="Sensors"
     //% weight=70 blockGap=8
     export function sonarDistanceCm(): number {
         return ensureRobot().sonar.distanceCm();
     }

    /** Dance to music */
    //% blockId=robotpu_dance block="dance"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=49 blockGap=8
    export function dance(): number {
        return ensureRobot().dance();
    }

    /** Dance to music. Statement version (no return). */
    //% blockId=robotpu_dance_do block="dance"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=48 blockGap=8
    export function danceDo(): void {
        ensureRobot().dance();
    }

    /** Kick with a quick forward motion */
    //% blockId=robotpu_kick block="kick"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=47 blockGap=8
    export function kick(): number {
        return ensureRobot().kick();
    }

    /** Kick action. Statement version (no return). */
    //% blockId=robotpu_kick_do block="kick"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=46 blockGap=8
    export function kickDo(): void {
        ensureRobot().kick();
    }

    /** Jump action */
    //% blockId=robotpu_jump block="jump"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=45 blockGap=8
    export function jump(): number {
        return ensureRobot().jump();
    }

    /** Jump action. Statement version (no return). */
    //% blockId=robotpu_jump_do block="jump"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=44 blockGap=8
    export function jumpDo(): void {
        ensureRobot().jump();
    }

    /** Rest in balanced idle */
    //% blockId=robotpu_rest block="rest"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=43 blockGap=8
    export function rest(): number {
        return ensureRobot().rest();
    }

    /** Move to balanced idle/rest. Statement version (no return). */
    //% blockId=robotpu_rest_do block="rest"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=42 blockGap=8
    export function restDo(): void {
        ensureRobot().rest();
    }

    //% blockId=robotpu_stand block="stand"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=41 blockGap=8
    export function stand(): number {
        return ensureRobot().stand();
    }

    //% blockId=robotpu_stand_do block="stand"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=40 blockGap=8
    export function standDo(): void {
        ensureRobot().stand();
    }

    /** Speak text using Billy */
    //% blockId=robotpu_talk block="talk %text"
    //% text.shadow=text
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=39 blockGap=8
    export function talk(text: string): void {
        ensureRobot().talk(text);
    }

    /** Sing a phonetic or musical string using Billy */
    //% blockId=robotpu_sing block="sing %s"
    //% s.shadow=text
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=38
    export function sing(s: string): void {
        ensureRobot().sing(s);
    }

    /** Set servo trim offsets: left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch */
    //% blockId=robotpu_setServoTrim block="set servo trim left foot %leftFoot left leg %leftLeg right foot %rightFoot right leg %rightLeg head yaw %headYaw head pitch %headPitch"
    //% subcategory="Setup"
    //% group="Setup"
    //% leftFoot.defl=0 leftLeg.defl=0 rightFoot.defl=0 rightLeg.defl=0 headYaw.defl=0 headPitch.defl=0
    //% weight=80 blockGap=8
    export function setServoTrim(leftFoot: number, leftLeg: number, rightFoot: number, rightLeg: number, headYaw: number, headPitch: number): void {
        ensureRobot().setTrim(leftFoot, leftLeg, rightFoot, rightLeg, headYaw, headPitch);
    }

    /** Run calibration routine */
    //% blockId=robotpu_calibrate block="calibrate"
    //% weight=79 blockGap=8
    //% subcategory="Setup"
    //% group="Setup"
    export function calibrate(): void {
        ensureRobot().calibrate();
    }

    /** Set walk speed range: min maps to backward max speed, max maps to forward max speed */
    //% blockId=robotpu_setWalkSpeedRange block="set walk speed range min %min max %max"
    //% subcategory="Setup"
    //% group="Setup"
    //% min.defl=-3 max.defl=4
    //% weight=78 blockGap=8
    export function setWalkSpeedRange(min: number, max: number): void {
        // backward max speed (negative), forward max speed (positive)
        ensureRobot().setBwdMaxSpeed(min);
        ensureRobot().setFwdMaxSpeed(max);
    }

    /** Run string command */
    //% blockId=robotpu_runStrCMD block="execute command %s"
    //% s.shadow=text
    //% subcategory="Remote Control"
    //% group="Remote Control"
    //% weight=30 blockGap=8
    export function runStringCommand(s: string): void {
        ensureRobot().runStringCommand(s);
    }

    /** Run key/value command */
    //% blockId=robotpu_runKeyValueCMD block="execute command key %key value %v"
    //% key.shadow=text
    //% subcategory="Remote Control"
    //% group="Remote Control"
    //% weight=29 blockGap=8
    export function runKeyValueCommand(key: string, v: number): void {
        ensureRobot().runKeyValueCommand(key, v);
    }

    /** Current radio channel (0..255) */
    //% blockId=robotpu_channel block="channel"
    //% subcategory="Variables"
    //% group="Variables"
    //% weight=90
    export function channel(): number {
        return ensureRobot().getGroupId();
    }

    /** Set channel to a specific value (0..255). Alias for setGroupId. */
    //% blockId=robotpu_set_channel block="set channel to %channel"
    //% subcategory="Variables"
    //% group="Variables"
    //% channel.min=0 channel.max=255 channel.defl=166
    //% weight=89
    export function setChannel(channel: number): void {
        ensureRobot().setGroupId(channel);
    }

    /** Change channel by a delta (can be negative). Alias for adjust radio group. */
    //% blockId=robotpu_change_channel block="change channel by %delta"
    //% subcategory="Variables"
    //% group="Variables"
    //% delta.defl=1
    //% weight=88
    export function changeChannel(delta: number): void {
        ensureRobot().incrGroupId(delta);
    }

}
