// MakeCode blocks wrapper for RobotPu
//% color=#0EA5E9 icon="\uf17b" block="RobotPU"
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

    /** Initialize RobotPU with an optional serial number and name */
    //% blockId=robotpu_init block="init RobotPU sn %sn name %name"
    //% sn.defl="auto" name.defl="peu"
    //% weight=100 blockGap=8
    export function init(sn: string = "auto", name: string = "peu"): void {
        const realSn = sn === "auto" ? ("pu-" + control.deviceSerialNumber()) : sn;
        robot = new RobotPu(realSn, name || "peu");
    }

    /** Robot PU introduce itself  */
    //% blockId=robotpu_intro block="intro"
    //% weight=95 blockGap=8
    export function intro(): void {
        ensureRobot().intro();
    }

    /** Walk with speed (-5 to 5) and turn bias (-1 to 1). Positive speed is forward. Negative turn is left, 0 is straight, Positive is right. */
    //% blockId=robotpu_walk block="walk speed %speed turn %turn"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=90 blockGap=8
    export function walk(speed: number, turn: number): number {
        return ensureRobot().walk(speed, turn);
    }

    /** Explore autonomously using sonar */
    //% blockId=robotpu_explore block="explore"
    //% weight=85 blockGap=8
    export function explore(): number {
        return ensureRobot().explore();
    }

    /** Dance to sound */
    //% blockId=robotpu_dance block="dance"
    //% weight=80 blockGap=8
    export function dance(): number {
        return ensureRobot().dance();
    }

    /** Kick with a quick forward motion */
    //% blockId=robotpu_kick block="kick"
    //% weight=75 blockGap=8
    export function kick(): number {
        return ensureRobot().kick();
    }

    /** Jump action */
    //% blockId=robotpu_jump block="jump"
    //% weight=70 blockGap=8
    export function jump(): number {
        return ensureRobot().jump();
    }

    /** Rest in balanced idle */
    //% blockId=robotpu_rest block="rest"
    //% weight=65 blockGap=8
    export function rest(): number {
        return ensureRobot().rest();
    }

    /** Speak text using Billy */
    //% blockId=robotpu_talk block="talk %text"
    //% text.shadow=text
    //% weight=60 blockGap=8
    export function talk(text: string): void {
        ensureRobot().talk(text);
    }

    /** Sing a phonetic or musical string using Billy */
    //% blockId=robotpu_sing block="sing %s"
    //% s.shadow=text
    //% weight=55
    export function sing(s: string): void {
        ensureRobot().sing(s);
    }

    /** Set servo trim offsets: left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch */
    //% blockId=robotpu_setTrim block="set trim leftFoot %left_foot leftLeg %left_leg rightFoot %right_foot rightLeg %right_leg headYaw %head_yaw headPitch %head_pitch"
    //% left_foot.defl=0 left_leg.defl=0 right_foot.defl=0 right_leg.defl=0 head_yaw.defl=0 head_pitch.defl=0
    //% weight=58 blockGap=8
    export function setTrim(left_foot: number, left_leg: number, right_foot: number, right_leg: number, head_yaw: number, head_pitch: number): void {
        ensureRobot().setTrim(left_foot, left_leg, right_foot, right_leg, head_yaw, head_pitch);
    }

    /** Run calibration routine */
    //% blockId=robotpu_calibrate block="calibrate"
    //% weight=57 blockGap=8
    export function calibrate(): void {
        ensureRobot().calibrate();
    }

    /** Run string command */
    //% blockId=robotpu_runStrCMD block="execute command %s"
    //% s.shadow=text
    //% weight=56 blockGap=8
    export function runStrCMD(s: string): void {
        ensureRobot().runStrCMD(s);
    }

    /** Run key/value command */
    //% blockId=robotpu_runKeyValueCMD block="execute command key %key value %v"
    //% key.shadow=text
    //% weight=55 blockGap=8
    export function runKeyValueCMD(key: string, v: number): void {
        ensureRobot().runKeyValueCMD(key, v);
    }

    /** Adjust radio group by delta (wraps 0..255) */
    //% blockId=robotpu_incr_group_id block="adjust radio group by %i"
    //% i.defl=1
    //% weight=54
    export function incr_group_id(i: number): void {
        ensureRobot().incr_group_id(i);
    }

    /** Set radio group to a specific channel (0..255) */
    //% blockId=robotpu_set_group_id block="set radio group to %channel"
    //% channel.min=0 channel.max=255 channel.defl=166
    //% weight=53 blockGap=8
    export function set_group_id(channel: number): void {
        ensureRobot().set_group_id(channel);
    }

}
