/**
 * Make your Robot PU stronger and smarter with MakeCode blocks.
 * Robot PU can walk, dance, kick, jump, rest, explore, talk, and sing.
 * Control it with the gamepad or program custom behaviors.
 */
//% weight=50 color=#e7660b icon="\uf2bd"
//% block="Robot PU"
//% groups='["Setup", "Sensors", "Actuators", "Actions", "Remote Control"]'
//% helpUrl="https://robotgyms.com/pu"
namespace robotPuPro {
    let robot: RobotPu;

    /**
     * Robot PU behavior modes. Set the mode to switch between built-in behaviors.
     */
    export enum Mode {
        //% block="trim calibration"
        CalibrateServo = -4,
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
        Walk = 5,
        //% block="API (advanced programming)"
        API = 6,

    }

    /**
     * Robot PU servo joints. Each joint corresponds to one servo motor on the robot body.
     */
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
        HeadPitch = 5,
        //% block="left shoulder"
        LeftShoulder = 6,
        //% block="left arm"
        LeftArm = 7,
        //% block="right shoulder"
        RightShoulder = 8,
        //% block="right arm"
        RightArm = 9
    }

    function ensureRobot(): RobotPu {
        if (!robot) {
            const sn = "pu-" + control.deviceSerialNumber();
            robot = new RobotPu(sn, "peu");
            robot.calibrate();
            robot.start();
            control.inBackground(function () {
                // add background task to update states and execute behavior logic
                while (true) {
                    robot.updateStates();   // Checks sensors and falls
                    robot.stateMachine();   // Executes current behavior logic
                    // Use a slightly larger pause to prevent CPU starvation
                    // 20ms is standard for robotics to maintain 50Hz responsiveness
                    // but robot PU need 200Hz to maintain 200Hz responsiveness
                    basic.pause(5);
                }
            });
        }
        // set last command timestamp to prevent timeout reset
        robot.lastCmdTS = control.millis();
        return robot;
    }

    function getRobotAPI(): RobotPu {
        const r = ensureRobot();
        r.gst = Mode.API;
        return r;
    }

    /** Current radio channel (0..255). Both Robot PU and the gamepad must use the same channel to communicate. */
    //% blockId=robotpu_channel block="channel"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=99
    //% helpUrl="https://robotgyms.com/pu"
    export function channel(): number {
        return ensureRobot().getGroupId();
    }

    /**
     * Set the radio channel (0..255). Both Robot PU and the gamepad must use the same channel.
     * @param channel radio channel number, eg: 166
     */
    //% blockId=robotpu_set_channel block="set channel to %channel"
    //% subcategory="Setup"
    //% group="Setup"
    //% channel.min=0 channel.max=255 channel.defl=166
    //% weight=99
    //% helpUrl="https://robotgyms.com/pu"
    export function setChannel(channel: number): void {
        ensureRobot().setGroupId(channel);
    }

    /**
     * Change the radio channel by a given amount. Wraps around between 0 and 255.
     * @param delta amount to change the channel by, eg: 1
     */
    //% blockId=robotpu_change_channel block="change channel by %delta"
    //% subcategory="Setup"
    //% group="Setup"
    //% delta.defl=1
    //% weight=99
    export function changeChannel(delta: number): void {
        ensureRobot().incrGroupId(delta);
    }

    /** The current behavior mode Robot PU is running. */
    //% blockId=robotpu_mode_var block="mode"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=98
    export function mode(): Mode {
        return ensureRobot().gst as Mode;
    }

    /**
     * Set Robot PU's behavior mode. Robot PU will keep running that mode until you change it.
     * @param mode the behavior mode to switch to, eg: robotPuPro.Mode.Walk
     */
    //% blockId=robotpu_set_mode_var block="set mode to %mode"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=98
    export function setModeVar(mode: Mode): void {
        setMode(mode);
    }

    /**
     * Set servo trim offsets to correct physical assembly differences. Values are added to each servo target angle.
     * @param leftFoot trim offset for the left foot servo in degrees, eg: 0
     * @param leftLeg trim offset for the left leg servo in degrees, eg: 0
     * @param rightFoot trim offset for the right foot servo in degrees, eg: 0
     * @param rightLeg trim offset for the right leg servo in degrees, eg: 0
     * @param headYaw trim offset for the head yaw servo in degrees, eg: 0
     * @param headPitch trim offset for the head pitch servo in degrees, eg: 0
     */
    //% blockId=robotpu_setServoTrim block="set servo trim left foot %leftFoot left leg %leftLeg right foot %rightFoot right leg %rightLeg head yaw %headYaw head pitch %headPitch"
    //% subcategory="Setup"
    //% group="Setup"
    //% leftFoot.defl=0 leftLeg.defl=0 rightFoot.defl=0 rightLeg.defl=0 headYaw.defl=0 headPitch.defl=0
    //% weight=97 blockGap=8
    export function setServoTrim(leftFoot: number, leftLeg: number, rightFoot: number, rightLeg: number, headYaw: number, headPitch: number): void {
        ensureRobot().setTrim(leftFoot, leftLeg, rightFoot, rightLeg, headYaw, headPitch);
    }

    /** Toggle servo trim calibration mode on or off. Use the gamepad to select and adjust each servo while in calibration mode. */
    //% blockId=robotpu_toggle_trim_calibration block="toggle servo trim calibration mode"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=97 blockGap=8
    export function toggleServoTrim(): void {
        ensureRobot().toggleServoTrim();
    }

    /** Save the current servo trim values to flash storage. Saved trims are restored automatically on next boot. */
    //% blockId=robotpu_save_trim_calibration block="save servo trim calibration"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=97 blockGap=8
    export function saveServoTrimCalibration(): void {
        ensureRobot().saveTrimCalibration();
    }

    /** Load saved robot configuration from flash storage, including servo trim values and radio channel. */
    //% blockId=robotpu_read_config block="read configuration"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=96 blockGap=8
    export function readConfig(): void {
        ensureRobot().readConfig();
    }

    /** Save current robot configuration to flash storage, including servo trim values and radio channel. */
    //% blockId=robotpu_write_config block="write configuration"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=96 blockGap=8
    export function writeConfig(): void {
        ensureRobot().writeConfig();
    }

    /**
     * Set the walk speed range. The minimum maps to full backward speed, the maximum maps to full forward speed.
     * @param min maximum backward speed (negative value), eg: -3
     * @param max maximum forward speed (positive value), eg: 4
     */
    //% blockId=robotpu_setWalkSpeedRange block="set walk speed range min %min max %max"
    //% subcategory="Setup"
    //% group="Setup"
    //% min.defl=-3 max.defl=4
    //% weight=95 blockGap=8
    export function setWalkSpeedRange(min: number, max: number): void {
        // backward max speed (negative), forward max speed (positive)
        ensureRobot().setBwdMaxSpeed(min);
        ensureRobot().setFwdMaxSpeed(max);
    }

    /** The maximum brightness of Robot PU's eye LEDs (0 to 1). */
    //% blockId=robotpu_eye_brightness_var block="eye brightness"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=94
    export function eyeBrightness(): number {
        return ensureRobot().pcb.eyeBrightness;
    }

    /**
     * Set the maximum brightness of Robot PU's eye LEDs.
     * @param brightness brightness from 0 (off) to 1 (full brightness), eg: 0.5
     */
    //% blockId=robotpu_set_eye_brightness_var block="set eye brightness to %brightness"
    //% subcategory="Setup"
    //% group="Setup"
    //% brightness.min=0 brightness.max=1 brightness.defl=0.5
    //% brightness.fieldOptions.precision=0.01
    //% weight=94
    export function setEyeBrightness(brightness: number): void {
        brightness = Math.min(1, Math.max(0, brightness));
        ensureRobot().pcb.eyeBrightness = brightness;
    }

    /** Robot PU introduces itself by speaking its name and serial number. */
    //% blockId=robotpu_greet block="greet"
    //% weight=89 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function greet(): void {
        ensureRobot().greet();
    }

    /** Take one sonar reading and update the internal front distance array. Call this before reading the front distance array. */
    //% blockId=robotpu_sonar_scan block="sonar scan"
    //% weight=88 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function sonarScan(): void {
        ensureRobot().sonarScan();
    }

    /**
     * Play a sequence of tones using arrays of frequencies in Hz and durations in milliseconds. Use frequency 0 for a rest.
     * @param frequencies array of tone frequencies in Hz, use 0 for a rest, eg: [440, 550, 660]
     * @param durations array of tone durations in milliseconds, eg: [100, 100, 200]
     */
    //% blockId=robotpu_play_tone_sequence_ms block="play tones frequencies %frequencies durations (ms) %durations"
    //% weight=87 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function playToneSequenceMs(frequencies: number[], durations: number[]): void {
        const n = Math.min(frequencies ? frequencies.length : 0, durations ? durations.length : 0);
        for (let i = 0; i < n; i++) {
            const dur = Math.max(0, Math.round(durations[i]));
            const f = Math.round(frequencies[i]);
            if (f <= 0) music.rest(dur);
            else music.playTone(f, dur);
        }
    }

    /**
     * Set Robot PU's behavior mode directly.
     * @param mode the behavior mode to switch to, eg: robotPuPro.Mode.Walk
     */
    //% blockId=robotpu_setMode block="set mode %mode"
    //% weight=86 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function setMode(mode: Mode): void {
        const r = ensureRobot();
        r.gst = mode as number;
    }

    /**
     * Walk with a given speed and turn bias. Call repeatedly in a loop to keep walking.
     * Returns 1 while a gait step is in progress, 0 when the step completes.
     * @param speed walking speed from -5 (full backward) to 5 (full forward), eg: 2
     * @param turn turn bias from -1 (full left) to 1 (full right), 0 is straight, eg: 0
     */
    //% blockId=robotpu_walk block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% group="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=85 blockGap=8
    export function walk(speed: number, turn: number): number {
        const r = getRobotAPI();
        r.walkSpeed = speed;
        r.walkDirection = turn;
        return r.walk(speed, turn);
    }

    /**
     * Walk with a given speed and turn bias. Call repeatedly in a loop to keep walking.
     * @param speed walking speed from -5 (full backward) to 5 (full forward), eg: 2
     * @param turn turn bias from -1 (full left) to 1 (full right), 0 is straight, eg: 0
     */
    //% blockId=robotpu_walk_do block="walk speed %speed turn %turn"
    //% subcategory="Actions"
    //% group="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=85 blockGap=8
    export function walkDo(speed: number, turn: number): void {
        const r = getRobotAPI();
        r.walkSpeed = speed;
        r.walkDirection = turn;
        r.walk(speed, turn);
    }

    /**
     * Walk toward a target compass heading while avoiding obstacles. Call repeatedly in a loop.
     * @param headingDeg target compass heading in degrees (0 = north, 90 = east), eg: 0
     */
    //% blockId=robotpu_walk_by_compass block="walk by compass %headingDeg"
    //% subcategory="Actions"
    //% group="Actions"
    //% headingDeg.min=0 headingDeg.max=359 headingDeg.defl=0
    //% weight=85 blockGap=8
    export function walkByCompass(headingDeg: number): number {
        return getRobotAPI().walkByCompass(headingDeg);
    }

    /**
     * Walk toward a target compass heading using PID (Proportional-Integral-Derivative) control while avoiding obstacles.
     * PID tuning: increase proportional gain for faster response, add integral gain to correct steady-state error, add derivative gain to reduce overshoot.
     * @param headingDeg target compass heading in degrees (0 = north, 90 = east), eg: 0
     * @param kp proportional gain, eg: 0.02
     * @param ki integral gain, eg: 0.0005
     * @param kd derivative gain, eg: 0
     */
    //% blockId=robotpu_walk_by_compass_pid block="walk by compass PID %headingDeg proportional gain %kp integral gain %ki derivative gain %kd"
    //% subcategory="Actions"
    //% group="Actions"
    //% headingDeg.min=0 headingDeg.max=359 headingDeg.defl=0
    //% kp.min=0 kp.max=0.2 kp.defl=0.02
    //% ki.min=0 ki.max=0.01 ki.defl=0.0005
    //% kd.min=0 kd.max=0.5 kd.defl=0
    //% weight=85 blockGap=8
    export function walkByCompassPID(headingDeg: number, kp: number, ki: number, kd: number): number {
        return getRobotAPI().walkByCompassPID(headingDeg, kp, ki, kd);
    }

    /** Explore autonomously using the sonar sensor to avoid obstacles. Call repeatedly in a loop. Returns 1 while moving, 0 when a step completes. */
    //% blockId=robotpu_explore block="explore"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=84 blockGap=8
    export function explore(): number {
        return getRobotAPI().explore();
    }

    /** Explore autonomously using the sonar sensor to avoid obstacles. Call repeatedly in a loop. */
    //% blockId=robotpu_explore_do block="explore"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=84 blockGap=8
    export function exploreDo(): void {
        getRobotAPI().explore();
    }

    /**
     * Move sideways. Returns 0 when the step is complete.
     * @param direction direction to step: -1 for left, 1 for right, eg: -1
     */
    //% blockId=robotpu_side_step block="side step %direction"
    //% subcategory="Actions"
    //% group="Actions"
    //% direction.min=-1 direction.max=1 direction.defl=-1
    //% weight=83 blockGap=8
    export function sideStep(direction: number): number {
        return getRobotAPI().sideStep(direction);
    }

    /**
     * Move sideways.
     * @param direction direction to step: -1 for left, 1 for right, eg: -1
     */
    //% blockId=robotpu_side_step_do block="side step %direction"
    //% subcategory="Actions"
    //% group="Actions"
    //% direction.min=-1 direction.max=1 direction.defl=-1
    //% weight=83 blockGap=8
    export function sideStepDo(direction: number): void {
        getRobotAPI().sideStep(direction);
    }

    /** Dance to music using the microphone to detect the beat. Returns 0 when one dance move is complete. Call repeatedly in a loop. */
    //% blockId=robotpu_dance block="dance"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=82 blockGap=8
    export function dance(): number {
        return getRobotAPI().dance();
    }

    /** Dance to music using the microphone to detect the beat. Call repeatedly in a loop. */
    //% blockId=robotpu_dance_do block="dance"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=82 blockGap=8
    export function danceDo(): void {
        getRobotAPI().dance();
    }

    /** Perform a kick motion. Returns 0 when the kick is complete. Call repeatedly in a loop until it returns 0. */
    //% blockId=robotpu_kick block="kick"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=81 blockGap=8
    export function kick(): number {
        return getRobotAPI().kick();
    }

    /** Perform a kick motion. Call repeatedly in a loop to complete the kick. */
    //% blockId=robotpu_kick_do block="kick"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=81 blockGap=8
    export function kickDo(): void {
        getRobotAPI().kick();
    }

    /** Perform a jump sequence. Returns 0 when the jump is complete. Call repeatedly in a loop until it returns 0. */
    //% blockId=robotpu_jump block="jump"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=80 blockGap=8
    export function jump(): number {
        return getRobotAPI().jump();
    }

    /** Perform a jump sequence. Call repeatedly in a loop to complete the jump. */
    //% blockId=robotpu_jump_do block="jump"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=80 blockGap=8
    export function jumpDo(): void {
        getRobotAPI().jump();
    }

    /** Rest in a balanced idle pose. Reacts subtly to sound. Returns 0 when one rest cycle completes. */
    //% blockId=robotpu_rest block="rest"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=78 blockGap=8
    export function rest(): number {
        return getRobotAPI().rest();
    }

    /** Rest in a balanced idle pose. Reacts subtly to sound. */
    //% blockId=robotpu_rest_do block="rest"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=79 blockGap=8
    export function restDo(): void {
        getRobotAPI().rest();
    }

    /** Move to the calibration pose and flash the eyes. Useful after changing servo trim values. */
    //% blockId=robotpu_calibrate block="calibrate"
    //% weight=78 blockGap=8
    //% group="Actions"
    //% subcategory="Actions"
    export function calibrate(): void {
        ensureRobot().calibrate();
    }

    /** Move to the standing pose. Returns 0 when the robot has reached the standing position. */
    //% blockId=robotpu_stand block="stand"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=77 blockGap=8
    export function stand(): number {
        return getRobotAPI().stand();
    }

    /** Move to the standing pose. */
    //% blockId=robotpu_stand_do block="stand"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=77 blockGap=8
    export function standDo(): void {
        getRobotAPI().stand();
    }

    /**
     * Speak text aloud as a melodic robotic voice. If the text contains only morse characters (. - / space) it is played as morse code instead.
     * @param text the text to speak or morse code string, eg: "Hello!"
     */
    //% blockId=robotpu_talk block="talk %text"
    //% text.shadow=text
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=76 blockGap=8
    export function talk(text: string): void {
        ensureRobot().talk(text);
    }

    /**
     * Sing a musical note sequence using the built-in music engine.
     * Notes are written as letter names (A-G) with optional octave number, separated by spaces. Use '-' for a rest.
     * @param song the note sequence string to sing, eg: "C5 B G - E F E G "
     */
    //% blockId=robotpu_sing block="sing %song"
    //% song.shadow=text
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=75
    export function sing(song: string): void {
        ensureRobot().sing(song);
    }

    /**
     * Play a morse code string using ITU-standard timing.
     * Use '.' for dit, '-' for dah, ' ' to separate letters, '  ' (double space) to separate words, '/' as an alternative letter separator.
     * @param code morse code string to play, eg: "... --- ..."
     * @param unitMs duration of one dit in milliseconds, eg: 80
     */
    //% blockId=robotpu_morse block="morse %code|| speed %unitMs ms"
    //% code.shadow=text
    //% unitMs.min=30 unitMs.max=300 unitMs.defl=80
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=74 blockGap=8
    //% helpUrl="https://robotgyms.com/pu"
    export function morse(code: string, unitMs: number = 80): void {
        ensureRobot().voice.morse(code, unitMs);
    }

    /**
     * Translate plain text into a morse code string using the ITU morse alphabet.
     * The returned string can be passed to the morse block or displayed on the LED matrix.
     * @param text plain text to translate, eg: "SOS"
     */
    //% blockId=robotpu_to_morse block="translate %text to morse"
    //% text.shadow=text
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=73 blockGap=8
    //% helpUrl="https://robotgyms.com/pu"
    export function toMorse(text: string): string {
        return RoboVoice.toMorse(text);
    }

    /**
     * Translate plain text to morse code and play it immediately.
     * Combines the translate and morse blocks in one step.
     * @param text plain text to translate and play as morse, eg: "Hello"
     * @param unitMs duration of one dit in milliseconds, eg: 80
     */
    //% blockId=robotpu_morse_text block="say %text in morse|| speed %unitMs ms"
    //% text.shadow=text
    //% unitMs.min=30 unitMs.max=300 unitMs.defl=80
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=72 blockGap=8
    //% helpUrl="https://robotgyms.com/pu"
    export function morseText(text: string, unitMs: number = 80): void {
        ensureRobot().voice.morse(RoboVoice.toMorse(text), unitMs);
    }

    /**
     * Move a servo joint directly to an angle.
     * @param joint the servo joint to move, eg: robotPuPro.ServoJoint.HeadYaw
     * @param angle target angle from 0 to 180 degrees, eg: 90
     */
    //% blockId=robotpu_servo block="move %joint servo to %angle"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% weight=49 blockGap=8
    export function servo(joint: ServoJoint, angle: number): void {
        const r = getRobotAPI();
        r.pcb.servo(joint as number, angle);
    }

    /**
     * Move a servo joint toward a target angle one step at a time, for smooth motion.
     * @param joint the servo joint to move, eg: robotPuPro.ServoJoint.HeadYaw
     * @param target target angle from 0 to 180 degrees, eg: 90
     * @param stepSize maximum degrees to move per call, eg: 2
     */
    //% blockId=robotpu_servo_step block="move %joint servo to %target with step size %stepSize"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% target.min=0 target.max=180 target.defl=90
    //% stepSize.min=1 stepSize.max=20 stepSize.defl=2
    //% weight=49 blockGap=8
    export function servoStep(joint: ServoJoint, target: number, stepSize: number): void {
        const r = getRobotAPI();
        r.pcb.servoStep(target, stepSize, joint as number);
    }

    /**
     * Move a servo joint toward a target angle one step at a time. Returns 1 while moving, 0 when arrived.
     * @param joint the servo joint to move, eg: robotPuPro.ServoJoint.HeadYaw
     * @param target target angle from 0 to 180 degrees, eg: 90
     * @param stepSize maximum degrees to move per call, eg: 2
     */
    //% blockId=robotpu_servo_step_status block="servo step %joint to %target step size %stepSize"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% target.min=0 target.max=180 target.defl=90
    //% stepSize.min=1 stepSize.max=20 stepSize.defl=2
    //% weight=48 blockGap=8
    export function servoStepStatus(joint: ServoJoint, target: number, stepSize: number): number {
        const r = getRobotAPI();
        return r.pcb.servoStep(target, stepSize, joint as number);
    }

    /**
     * Move multiple servos toward target angles simultaneously, with separate synchronous and asynchronous servo groups.
     * Synchronous servos block until they arrive; asynchronous servos move in the background.
     * @param targets array of 10 target angles (one per servo joint, 0 to 180 degrees)
     * @param speeds array of 10 maximum step sizes in degrees per call (one per servo joint)
     * @param syncList array of servo joint indices that must arrive before this function returns true
     * @param syncSpeedGain speed multiplier for the synchronous group, eg: 1
     * @param asyncList array of servo joint indices that move in the background
     * @param asyncSpeedGain speed multiplier for the asynchronous group, eg: 1
     */
    //% blockId=robotpu_move_servos block="move servos targets %targets speeds %speeds synchronous indexes %syncList synchronous gain %syncSpeedGain asynchronous indexes %asyncList asynchronous gain %asyncSpeedGain"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% targets.shadow=lists_create_with speeds.shadow=lists_create_with syncList.shadow=lists_create_with asyncList.shadow=lists_create_with
    //% syncSpeedGain.defl=1 syncSpeedGain.min=-10 syncSpeedGain.max=10
    //% asyncSpeedGain.defl=1 asyncSpeedGain.min=-10 asyncSpeedGain.max=10
    //% weight=48 blockGap=8
    export function moveServos(targets: number[], speeds: number[], syncList: number[], syncSpeedGain: number, asyncList: number[], asyncSpeedGain: number): boolean {
        const r = getRobotAPI();
        return r.pcb.moveServos(targets, speeds, syncList, syncSpeedGain, asyncList, asyncSpeedGain);
    }

    /**
     * Set servo control offsets for feedback or feedforward control. Each value is an angle offset added to the servo motion target.
     * @param indexes array of servo joint indices to set offsets for
     * @param values array of angle offsets in degrees to apply to each indexed servo
     */
    //% blockId=robotpu_set_control_offsets block="set control offsets indexes %indexes values %values"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% indexes.shadow=lists_create_with values.shadow=lists_create_with
    //% weight=47 blockGap=8
    export function setControlOffsets(indexes: number[], values: number[]): void {
        getRobotAPI().setControlOffsets(indexes, values);
    }

    /**
     * Increment servo control offsets smoothly. Each value is multiplied by gain and added to the current offset.
     * @param indexes array of servo joint indices to increment offsets for
     * @param values array of offset increments in degrees
     * @param gain multiplier applied to each value before adding, eg: 1
     */
    //% blockId=robotpu_increment_control_offsets block="increment control offsets indexes %indexes values %values gain %gain"
    //% subcategory="Actuators"
    //% group="Actuators"
    //% indexes.shadow=lists_create_with values.shadow=lists_create_with
    //% gain.defl=1 gain.min=-1 gain.max=1
    //% weight=47 blockGap=8
    export function incrementControlOffsets(indexes: number[], values: number[], gain: number): void {
        getRobotAPI().incrementControlOffsets(indexes, values, gain);
    }

    /**
     * Set the left eye LED brightness.
     * @param brightness brightness from 0 (off) to 1 (full brightness), eg: 0.5
     */
    //% blockId=robotpu_left_eye_bright block="set left eye brightness %brightness"
    //% weight=46 blockGap=8
    //% subcategory="Actuators"
    //% group="Actuators"
    //% brightness.min=0 brightness.max=1 brightness.defl=0.05
    export function leftEyeBright(brightness: number): void {
        const r = ensureRobot();
        brightness = Math.min(1, Math.max(0, brightness));
        const b = Math.min(1023, Math.max(0, Math.round(brightness * 1023)));
        r.pcb.leftEyeBright(b);
    }

    /**
     * Set the right eye LED brightness.
     * @param brightness brightness from 0 (off) to 1 (full brightness), eg: 0.5
     */
    //% blockId=robotpu_right_eye_bright block="set right eye brightness %brightness"
    //% weight=46 blockGap=8
    //% subcategory="Actuators"
    //% group="Actuators"
    //% brightness.min=0 brightness.max=1 brightness.defl=0.05
    export function rightEyeBright(brightness: number): void {
        const r = ensureRobot();
        brightness = Math.min(1, Math.max(0, brightness));
        const b = Math.min(1023, Math.max(0, Math.round(brightness * 1023)));
        r.pcb.rightEyeBright(b);
    }

    /** Return the current sonar distance reading in centimeters. Returns a large value if nothing is detected. */
    //% blockId=robotpu_sonar_distance_cm block="sonar distance (cm)"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=39 blockGap=8
    export function sonarDistanceCm(): number {
        return ensureRobot().sonar.distanceCm();
    }

    /** Return the current body roll angle in degrees. Positive means tilting to the right. */
    //% blockId=robotpu_body_roll block="body roll"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=38 blockGap=8
    export function bodyRoll(): number {
        return ensureRobot().getBodyRoll();
    }

    /** Return the current body pitch angle in degrees. Positive means leaning forward. */
    //% blockId=robotpu_body_pitch block="body pitch"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=38 blockGap=8
    export function bodyPitch(): number {
        return ensureRobot().getBodyPitch();
    }

    /** Return the live music tempo detected from the microphone in beats per minute. */
    //% blockId=robotpu_music_tempo block="music tempo"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=37 blockGap=8
    export function musicTempo(): number {
        return ensureRobot().getMusicTempo();
    }

    /** Return the servo target angles array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, left arm, right shoulder, right arm. */
    //% blockId=robotpu_servo_targets block="servo targets"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=36 blockGap=8
    export function servoTargets(): number[] {
        return ensureRobot().pcb.servoTarget;
    }

    /** Return the servo control output angles array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, left arm, right shoulder, right arm. */
    //% blockId=robotpu_servo_controls block="servo controls"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=35 blockGap=8
    export function servoControls(): number[] {
        return ensureRobot().pcb.servoCtrl;
    }

    /** Return the servo trim offsets array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, left arm, right shoulder, right arm. */
    //% blockId=robotpu_servo_trims block="servo trims"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=34 blockGap=8
    export function servoTrims(): number[] {
        return ensureRobot().pcb.servoTrim;
    }

    /** Return the front distance array in centimeters. Items: left, front-left, front, front-right, right. Call sonar scan first to update the values. */
    //% blockId=robotpu_explore_distance_array block="front distance array"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=33 blockGap=8
    export function frontDistanceArray(): number[] {
        const d = ensureRobot().pr.exploreDistance;
        return [d[0], d[1], (d[1] + d[2]) * 0.5, d[2], d[3]];
    }

    /** Reset the odometry so Robot PU's position is (0, 0) and heading is 0 degrees (north). */
    //% blockId=robotpu_reset_odom block="reset robot location"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=32 blockGap=8
    export function resetOdom(): void {
        ensureRobot().resetOdom();
    }

    /** Return Robot PU's estimated location as [x, y, heading]. x and y are in millimeters, heading is in degrees. */
    //% blockId=robotpu_location_array block="robot location array"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=32 blockGap=8
    export function locationArray(): number[] {
        const p = ensureRobot().odom.getPosition();
        return [p.x_mm, p.y_mm, p.theta_deg];
    }

    /**
     * Execute a string command received over radio. Use this inside a radio.onReceivedString handler.
     * Supported commands: #put<text> (speak), #pus<song> (sing), #puhi<name> (greet friend), #pun<name> (set robot name).
     * @param command the command string received from radio, eg: "#putHello!"
     */
    //% blockId=robotpu_runStrCMD block="execute string command %command"
    //% command.shadow=text
    //% subcategory="Remote Control"
    //% group="Remote Control"
    //% weight=9 blockGap=8
    export function runStringCommand(command: string): void {
        ensureRobot().runStringCommand(command);
    }

    /**
     * Execute a key/value command received over radio. Use this inside a radio.onReceivedValue handler.
     * Supported keys: #puspeed (forward/back), #puturn (left/right), #puroll (head yaw), #pupitch (head pitch), #puB (behavior).
     * @param key the command key received from radio, eg: "#puspeed"
     * @param value the command value received from radio, eg: 1
     */
    //% blockId=robotpu_runKeyValueCMD block="execute key value command key %key value %value"
    //% key.shadow=text
    //% subcategory="Remote Control"
    //% group="Remote Control"
    //% weight=9 blockGap=8
    export function runKeyValueCommand(key: string, value: number): void {
        ensureRobot().runKeyValueCommand(key, value);
    }

}
