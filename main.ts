// MakeCode blocks wrapper for RobotPu
//% weight=50 color=#e7660b icon="\uf1b9"
//block="Robot PU"
//% groups='["Setup", "Actions", "Variables"]'
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
    //% weight=95 blockGap=8
    //% subcategory="Actions"
    export function greet(): void {
        ensureRobot().greet();
    }

    /** Set current robot behavior mode (state machine). */
    //% blockId=robotpu_setMode block="set mode %mode"
    //% weight=94 blockGap=8
    //% subcategory="Actions"
    export function setMode(mode: Mode): void {
        const r = ensureRobot();
        r.gst = mode as number;
        r.lastCmd_ts = control.millis();
        // sticky mode with large timeout
        ensureRobot().beacon_timeout = 200000;
    }

    /** Walk with speed (-5 to 5) and turn bias (-1 to 1). Positive speed is forward. Negative turn is left, 0 is straight, Positive is right. */
    //% blockId=robotpu_walk block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=90 blockGap=8
    export function walk(speed: number, turn: number): number {
        return ensureRobot().walk(speed, turn);
    }

    /** Walk with the given speed and turn bias. Statement version (no return). */
    //% blockId=robotpu_walk_do block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=89 blockGap=8
    export function walkDo(speed: number, turn: number): void {
        ensureRobot().walk(speed, turn);
    }

    /** Explore autonomously using sonar */
    //% blockId=robotpu_explore block="explore"
    //% subcategory="Actions"
    //% weight=85 blockGap=8
    export function explore(): number {
        return ensureRobot().explore();
    }

    /** Explore the environment using sonar. Statement version (no return). */
    //% blockId=robotpu_explore_do block="explore"
    //% subcategory="Actions"
    //% weight=84 blockGap=8
    export function exploreDo(): void {
        ensureRobot().explore();
    }

    /** Dance to music */
    //% blockId=robotpu_dance block="dance"
    //% subcategory="Actions"
    //% weight=80 blockGap=8
    export function dance(): number {
        return ensureRobot().dance();
    }

    /** Dance to music. Statement version (no return). */
    //% blockId=robotpu_dance_do block="dance"
    //% subcategory="Actions"
    //% weight=79 blockGap=8
    export function danceDo(): void {
        ensureRobot().dance();
    }

    /** Kick with a quick forward motion */
    //% blockId=robotpu_kick block="kick"
    //% subcategory="Actions"
    //% weight=75 blockGap=8
    export function kick(): number {
        return ensureRobot().kick();
    }

    /** Kick action. Statement version (no return). */
    //% blockId=robotpu_kick_do block="kick"
    //% subcategory="Actions"
    //% weight=74 blockGap=8
    export function kickDo(): void {
        ensureRobot().kick();
    }

    /** Jump action */
    //% blockId=robotpu_jump block="jump"
    //% subcategory="Actions"
    //% weight=70 blockGap=8
    export function jump(): number {
        return ensureRobot().jump();
    }

    /** Jump action. Statement version (no return). */
    //% blockId=robotpu_jump_do block="jump"
    //% subcategory="Actions"
    //% weight=69 blockGap=8
    export function jumpDo(): void {
        ensureRobot().jump();
    }

    /** Rest in balanced idle */
    //% blockId=robotpu_rest block="rest"
    //% subcategory="Actions"
    //% weight=65 blockGap=8
    export function rest(): number {
        return ensureRobot().rest();
    }

    /** Move to balanced idle/rest. Statement version (no return). */
    //% blockId=robotpu_rest_do block="rest"
    //% subcategory="Actions"
    //% weight=64 blockGap=8
    export function restDo(): void {
        ensureRobot().rest();
    }

    /** Speak text using Billy */
    //% blockId=robotpu_talk block="talk %text"
    //% text.shadow=text
    //% subcategory="Actions"
    //% weight=60 blockGap=8
    export function talk(text: string): void {
        ensureRobot().talk(text);
    }

    /** Sing a phonetic or musical string using Billy */
    //% blockId=robotpu_sing block="sing %s"
    //% s.shadow=text
    //% subcategory="Actions"
    //% weight=55
    export function sing(s: string): void {
        ensureRobot().sing(s);
    }

    /** Set servo trim offsets: left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch */
    //% blockId=robotpu_setServoTrim block="set servo trim left foot %leftFoot left leg %leftLeg right foot %rightFoot right leg %rightLeg head yaw %headYaw head pitch %headPitch"
    //% subcategory="Setup"
    //% leftFoot.defl=0 leftLeg.defl=0 rightFoot.defl=0 rightLeg.defl=0 headYaw.defl=0 headPitch.defl=0
    //% weight=58 blockGap=8
    export function setServoTrim(leftFoot: number, leftLeg: number, rightFoot: number, rightLeg: number, headYaw: number, headPitch: number): void {
        ensureRobot().setTrim(leftFoot, leftLeg, rightFoot, rightLeg, headYaw, headPitch);
    }

    /** Run calibration routine */
    //% blockId=robotpu_calibrate block="calibrate"
    //% weight=57 blockGap=8
    //% subcategory="Setup"
    export function calibrate(): void {
        ensureRobot().calibrate();
    }

    /** Set walk speed range: min maps to backward max speed, max maps to forward max speed */
    //% blockId=robotpu_setWalkSpeedRange block="set walk speed range min %min max %max"
    //% subcategory="Setup"
    //% min.defl=-3 max.defl=4
    //% weight=56 blockGap=8
    export function setWalkSpeedRange(min: number, max: number): void {
        // backward max speed (negative), forward max speed (positive)
        ensureRobot().set_bwdMaxSpeed(min);
        ensureRobot().set_fwdMaxSpeed(max);
    }

    /** Run string command */
    //% blockId=robotpu_runStrCMD block="execute command %s"
    //% s.shadow=text
    //% subcategory="Remote Control"
    //% weight=56 blockGap=8
    export function runStringCommand(s: string): void {
        ensureRobot().runStringCommand(s);
    }

    /** Run key/value command */
    //% blockId=robotpu_runKeyValueCMD block="execute command key %key value %v"
    //% key.shadow=text
    //% subcategory="Remote Control"
    //% weight=55 blockGap=8
    export function runKeyValueCommand(key: string, v: number): void {
        ensureRobot().runKeyValueCommand(key, v);
    }

    /** Current radio channel (0..255) */
    //% blockId=robotpu_channel block="channel"
    //% subcategory="Variables"
    //% weight=70
    export function channel(): number {
        return ensureRobot().get_group_id();
    }

    /** Set channel to a specific value (0..255). Alias for set_group_id. */
    //% blockId=robotpu_set_channel block="set channel to %channel"
    //% subcategory="Variables"
    //% channel.min=0 channel.max=255 channel.defl=166
    //% weight=69
    export function setChannel(channel: number): void {
        ensureRobot().set_group_id(channel);
    }

    /** Change channel by a delta (can be negative). Alias for adjust radio group. */
    //% blockId=robotpu_change_channel block="change channel by %delta"
    //% subcategory="Variables"
    //% delta.defl=1
    //% weight=68
    export function changeChannel(delta: number): void {
        ensureRobot().incr_group_id(delta);
    }

}
