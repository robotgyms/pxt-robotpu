// MakeCode blocks wrapper for RobotPu
//% weight=50 color=#e7660b icon="\uf1b9"
//block="Robot PU"
//% groups='["Setup", "Action", "Variable"]'
namespace RobotPU {
    let robot: RobotPu;

    function ensureRobot(): RobotPu {
        if (!robot) {
            const sn = "pu-" + control.deviceSerialNumber();
            robot = new RobotPu(sn, "peu");
            robot.calibrate();
            control.inBackground(function () {
                // add background task to update states and execute behavior logic
                while (true) {
                    robot.update_states();   // Checks sensors and falls
                    robot.state_machine();   // Executes current behavior logic
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
    //% subcategory="Action"
    export function greet(): void {
        ensureRobot().greet();
    }

    /** Walk with speed (-5 to 5) and turn bias (-1 to 1). Positive speed is forward. Negative turn is left, 0 is straight, Positive is right. */
    //% blockId=robotpu_walk block="walk speed %speed turn %turn"
    //% subcategory="Action"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=90 blockGap=8
    export function walk(speed: number, turn: number): number {
        return ensureRobot().walk(speed, turn);
    }

    /** Walk with the given speed and turn bias. Statement version (no return). */
    //% blockId=robotpu_walk_do block="walk speed %speed turn %turn"
    //% subcategory="Action"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=89 blockGap=8
    export function walk_do(speed: number, turn: number): void {
        ensureRobot().walk(speed, turn);
    }

    /** Explore autonomously using sonar */
    //% blockId=robotpu_explore block="explore"
    //% subcategory="Action"
    //% weight=85 blockGap=8
    export function explore(): number {
        return ensureRobot().explore();
    }

    /** Explore the environment using sonar. Statement version (no return). */
    //% blockId=robotpu_explore_do block="explore"
    //% subcategory="Action"
    //% weight=84 blockGap=8
    export function explore_do(): void {
        ensureRobot().explore();
    }

    /** Dance to music */
    //% blockId=robotpu_dance block="dance"
    //% subcategory="Action"
    //% weight=80 blockGap=8
    export function dance(): number {
        return ensureRobot().dance();
    }

    /** Dance to music. Statement version (no return). */
    //% blockId=robotpu_dance_do block="dance"
    //% subcategory="Action"
    //% weight=79 blockGap=8
    export function dance_do() {
        ensureRobot().dance();
    }

    /** Kick with a quick forward motion */
    //% blockId=robotpu_kick block="kick"
    //% subcategory="Action"
    //% weight=75 blockGap=8
    export function kick(): number {
        return ensureRobot().kick();
    }

    /** Kick action. Statement version (no return). */
    //% blockId=robotpu_kick_do block="kick"
    //% subcategory="Action"
    //% weight=74 blockGap=8
    export function kick_do(): void {
        ensureRobot().kick();
    }

    /** Jump action */
    //% blockId=robotpu_jump block="jump"
    //% subcategory="Action"
    //% weight=70 blockGap=8
    export function jump(): number {
        return ensureRobot().jump();
    }

    /** Jump action. Statement version (no return). */
    //% blockId=robotpu_jump_do block="jump"
    //% subcategory="Action"
    //% weight=69 blockGap=8
    export function jump_do(): void {
        ensureRobot().jump();
    }

    /** Rest in balanced idle */
    //% blockId=robotpu_rest block="rest"
    //% subcategory="Action"
    //% weight=65 blockGap=8
    export function rest(): number {
        return ensureRobot().rest();
    }

    /** Move to balanced idle/rest. Statement version (no return). */
    //% blockId=robotpu_rest_do block="rest"
    //% subcategory="Action"
    //% weight=64 blockGap=8
    export function rest_do(): void {
        ensureRobot().rest();
    }

    /** Speak text using Billy */
    //% blockId=robotpu_talk block="talk %text"
    //% text.shadow=text
    //% subcategory="Action"
    //% weight=60 blockGap=8
    export function talk(text: string): void {
        ensureRobot().talk(text);
    }

    /** Sing a phonetic or musical string using Billy */
    //% blockId=robotpu_sing block="sing %s"
    //% s.shadow=text
    //% subcategory="Action"
    //% weight=55
    export function sing(s: string): void {
        ensureRobot().sing(s);
    }

    /** Set servo trim offsets: left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch */
    //% blockId=robotpu_setServoTrim block="set servo trim leftFoot %left_foot leftLeg %left_leg rightFoot %right_foot rightLeg %right_leg headYaw %head_yaw headPitch %head_pitch"
    //% subcategory="Setup"
    //% left_foot.defl=0 left_leg.defl=0 right_foot.defl=0 right_leg.defl=0 head_yaw.defl=0 head_pitch.defl=0
    //% weight=58 blockGap=8
    export function setServoTrim(left_foot: number, left_leg: number, right_foot: number, right_leg: number, head_yaw: number, head_pitch: number): void {
        ensureRobot().setTrim(left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch);
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
    export function runStrCMD(s: string): void {
        ensureRobot().runStrCMD(s);
    }

    /** Run key/value command */
    //% blockId=robotpu_runKeyValueCMD block="execute command key %key value %v"
    //% key.shadow=text
    //% subcategory="Remote Control"
    //% weight=55 blockGap=8
    export function runKeyValueCMD(key: string, v: number): void {
        ensureRobot().runKeyValueCMD(key, v);
    }

    /** Current radio channel (0..255) */
    //% blockId=robotpu_channel block="channel"
    //% subcategory="Variable"
    //% weight=70
    export function channel(): number {
        return ensureRobot().get_group_id();
    }

    /** Set channel to a specific value (0..255). Alias for set_group_id. */
    //% blockId=robotpu_set_channel block="set channel to %channel"
    //% subcategory="Variable"
    //% channel.min=0 channel.max=255 channel.defl=166
    //% weight=69
    export function set_channel(channel: number): void {
        ensureRobot().set_group_id(channel);
    }

    /** Change channel by a delta (can be negative). Alias for adjust radio group. */
    //% blockId=robotpu_change_channel block="change channel by %delta"
    //% subcategory="Variable"
    //% delta.defl=1
    //% weight=68
    export function change_channel(delta: number): void {
        ensureRobot().incr_group_id(delta);
    }

}
