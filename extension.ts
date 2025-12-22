// MakeCode blocks wrapper for RobotPu
//% color=#0EA5E9 icon="\uf544" block="RobotPU"
namespace RobotPU {
    let robot: RobotPu;

    function ensureRobot(): RobotPu {
        if (!robot) {
            const sn = "pu-" + control.deviceSerialNumber();
            robot = new RobotPu(sn, "peu");
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

    /** Walk with speed and turn bias (-1 to 1). Positive speed is forward. */
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
}
