/**
 * Make your Robot PU stronger and smarter with MakeCode blocks.
 * Robot PU can walk, dance, kick, jump, rest, explore, talk, and sing.
 * Control it with the gamepad or program custom behaviors.
 */
//% weight=50 color=#e7660b icon="\uf2bd"
//% block="Robot PU"
//% groups='["Setup", "Sensors", "Actuators", "Actions", "Remote Control", "Advanced"]'
//% helpUrl="https://robotgyms.com/pu"
namespace robotPuPro {
    let robot: RobotPu;
    let lastWalkDone = false;
    let lastExploreDone = false;
    let lastSideStepDone = false;
    let lastDanceDone = false;
    let lastKickDone = false;
    let lastJumpDone = false;
    let lastRestDone = false;
    let lastStandDone = false;

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
                    // but robot PU need 10ms to maintain 100Hz smoothness of actions
                    basic.pause(10);
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

    /** Start a robot action and run it for the given number of steps (0 or less = forever). */
    //% blockId=robotpu_start_action block="start %action for %steps steps"
    //% steps.min=0 steps.defl=1
    //% weight=100 blockGap=8
    export function start(action: Action, steps: number): void {
        ensureRobot().startAction(action, steps);
    }

    /** Check if the chosen action has finished. */
    //% blockId=robotpu_action_done block="is %action done?"
    //% weight=99 blockGap=8
    export function isDone(action: Action): boolean {
        return ensureRobot().isActionDone(action);
    }

    /** Stop the current action and reset to rest. */
    //% blockId=robotpu_stop_action block="stop robot"
    //% weight=98 blockGap=8
    export function stop(): void {
        ensureRobot().stopAction();
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
     * Set a servo trim offset to correct physical assembly differences. The value is added to the servo target angle.
     * @param joint the servo joint to trim, eg: robotPuPro.ServoJoint.LeftFoot
     * @param value trim offset in degrees, eg: 0
     */
    //% blockId=robotpu_setServoTrim block="set %joint servo trim to %value"
    //% subcategory="Setup"
    //% group="Setup"
    //% value.defl=0
    //% weight=97 blockGap=8
    export function setServoTrim(joint: ServoJoint, value: number): void {
        ensureRobot().setTrim(joint as number, value);
    }

    /** Toggle servo trim calibration mode on or off. Use the gamepad to select and adjust each servo while in calibration mode. */
    //% blockId=robotpu_toggle_trim_calibration block="toggle servo trim mode"
    //% subcategory="Setup"
    //% group="Advanced"
    //% weight=97 blockGap=8
    export function toggleServoTrim(): void {
        ensureRobot().toggleServoTrim();
    }

    /** Save the current servo trim values to flash storage. Saved trims are restored automatically on next boot. */
    //% blockId=robotpu_save_trim_calibration block="save servo trims"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=97 blockGap=8
    export function saveServoTrimCalibration(): void {
        ensureRobot().saveTrimCalibration();
    }

    /** Load saved robot configuration from flash storage, including servo trim values and radio channel. */
    //% blockId=robotpu_read_config block="load configuration"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=96 blockGap=8
    export function readConfig(): void {
        ensureRobot().readConfig();
    }

    /** Save current robot configuration to flash storage, including servo trim values and radio channel. */
    //% blockId=robotpu_write_config block="save configuration"
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
    //% blockId=robotpu_setWalkSpeedRange block="set walk speed range from %min to %max"
    //% subcategory="Setup"
    //% group="Setup"
    //% min.defl=-3 max.defl=4
    //% weight=95 blockGap=8
    export function setWalkSpeedRange(min: number, max: number): void {
        // backward max speed (negative), forward max speed (positive)
        ensureRobot().setBwdMaxSpeed(min);
        ensureRobot().setFwdMaxSpeed(max);
    }

    /**
     * Set the forward/backward walking speed.
     * @param speed walking speed from -5 (full backward) to 5 (full forward), eg: 0
     */
    //% blockId=robotpu_set_walk_speed block="set walk speed to %speed"
    //% subcategory="Setup"
    //% group="Setup"
    //% speed.min=-5 speed.max=5 speed.defl=0
    //% weight=94 blockGap=8
    export function setWalkSpeed(speed: number): void {
        ensureRobot().walkSpeed = speed;
    }

    /**
     * Set the left/right turning bias.
     * @param direction turn bias from -1 (full right) to 1 (full left), 0 is straight, eg: 0
     */
    //% blockId=robotpu_set_walk_direction block="set walk direction to %direction"
    //% subcategory="Setup"
    //% group="Setup"
    //% direction.min=-1 direction.max=1 direction.defl=0
    //% weight=94 blockGap=8
    export function setWalkDirection(direction: number): void {
        ensureRobot().walkDirection = direction;
    }

    /**
     * Get the current walking speed.
     */
    //% blockId=robotpu_walk_speed_var block="walk speed"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=93
    export function walkSpeed(): number {
        return ensureRobot().walkSpeed;
    }

    /**
     * Get the current walking direction.
     */
    //% blockId=robotpu_walk_direction_var block="walk direction"
    //% subcategory="Setup"
    //% group="Setup"
    //% weight=93
    export function walkDirection(): number {
        return ensureRobot().walkDirection;
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
     * @param frequencies array of tone frequencies in Hz, use 0 for a rest, eg: [440], [440, 550, 660]
     * @param durations array of tone durations in milliseconds, eg: [100], [100, 100, 200]
     */
    //% blockId=robotpu_play_tone_sequence_ms block="play tones with frequencies %frequencies and durations (ms) %durations"
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
    //% blockId=robotpu_setMode block="set mode to %mode"
    //% weight=86 blockGap=8
    //% subcategory="Actions"
    //% group="Actions"
    export function setMode(mode: Mode): void {
        const r = ensureRobot();
        r.gst = mode as number;
    }

    /**
     * Walk with a given speed and turn bias. Call repeatedly in a loop to keep walking.
     * @param speed walking speed from -5 (full backward) to 5 (full forward), eg: 2
     * @param turn turn bias from -1 (full right) to 1 (full left), 0 is straight, eg: 0
     */
    //% blockId=robotpu_walk block="walk at speed %speed, turning %turn"
    //% subcategory="Actions"
    //% group="Actions"
    //% speed.min=-5 speed.max=5 speed.defl=2
    //% turn.min=-1 turn.max=1 turn.defl=0
    //% weight=85 blockGap=8
    export function walk(speed: number, turn: number): void {
        const r = getRobotAPI();
        r.walkSpeed = speed;
        r.walkDirection = turn;
        lastWalkDone = (r.walk(speed, turn) === 0);
    }

    /** Return true when the last walk step completed. */
    //% blockId=robotpu_is_walk_done block="is walk step done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=85 blockGap=8
    export function isWalkStepDone(): boolean {
        return lastWalkDone;
    }

    /**
     * Walk toward a target compass heading while avoiding obstacles. Call repeatedly in a loop.
     * @param headingDeg target compass heading in degrees (0 = north, 90 = east), eg: 0
     */
    //% blockId=robotpu_walk_by_compass block="walk by compass heading %headingDeg"
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
    //% blockId=robotpu_walk_by_compass_pid block="walk by compass PID heading %headingDeg with proportional gain %kp integral gain %ki derivative gain %kd"
    //% subcategory="Actions"
    //% group="Advanced"
    //% headingDeg.min=0 headingDeg.max=359 headingDeg.defl=0
    //% kp.min=0 kp.max=0.2 kp.defl=0.02
    //% ki.min=0 ki.max=0.01 ki.defl=0.0005
    //% kd.min=0 kd.max=0.5 kd.defl=0
    //% weight=85 blockGap=8
    export function walkByCompassPID(headingDeg: number, kp: number, ki: number, kd: number): number {
        return getRobotAPI().walkByCompassPID(headingDeg, kp, ki, kd);
    }

    /** Explore autonomously using the sonar sensor to avoid obstacles. Call repeatedly in a loop. */
    //% blockId=robotpu_explore block="explore"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=84 blockGap=8
    export function explore(): void {
        lastExploreDone = (getRobotAPI().explore() === 0);
    }

    /** Return true when the last explore step completed. */
    //% blockId=robotpu_is_explore_done block="is explore done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=84 blockGap=8
    export function isExploreDone(): boolean {
        return lastExploreDone;
    }

    /**
     * Move sideways.
     * @param direction direction to step: -1 for right, 1 for left, eg: -1
     */
    //% blockId=robotpu_side_step block="side step %direction"
    //% subcategory="Actions"
    //% group="Actions"
    //% direction.min=-1 direction.max=1 direction.defl=-1
    //% weight=83 blockGap=8
    export function sideStep(direction: number): void {
        lastSideStepDone = (getRobotAPI().sideStep(direction) === 0);
    }

    /** Return true when the last side step completed. */
    //% blockId=robotpu_is_side_step_done block="is side step done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=83 blockGap=8
    export function isSideStepDone(): boolean {
        return lastSideStepDone;
    }

    /** Dance to music using the microphone to detect the beat. Call repeatedly in a loop. */
    //% blockId=robotpu_dance block="dance"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=82 blockGap=8
    export function dance(): void {
        lastDanceDone = (getRobotAPI().dance() === 0);
    }

    /** Return true when the last dance move completed. */
    //% blockId=robotpu_is_dance_done block="is dance done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=82 blockGap=8
    export function isDanceDone(): boolean {
        return lastDanceDone;
    }

    /** Perform a kick motion. Call repeatedly in a loop to complete the kick. */
    //% blockId=robotpu_kick block="kick"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=81 blockGap=8
    export function kick(): void {
        lastKickDone = (getRobotAPI().kick() === 0);
    }

    /** Return true when the last kick completed. */
    //% blockId=robotpu_is_kick_done block="is kick done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=81 blockGap=8
    export function isKickDone(): boolean {
        return lastKickDone;
    }

    /** Perform a jump sequence. Call repeatedly in a loop to complete the jump. */
    //% blockId=robotpu_jump block="jump"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=80 blockGap=8
    export function jump(): void {
        lastJumpDone = (getRobotAPI().jump() === 0);
    }

    /** Return true when the last jump completed. */
    //% blockId=robotpu_is_jump_done block="is jump done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=80 blockGap=8
    export function isJumpDone(): boolean {
        return lastJumpDone;
    }

    /** Play a laughing sound effect. Call it when Robot PU feels happy. */
    //% blockId=robotpu_laugh block="laugh"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=79 blockGap=8
    export function laugh(): void {
        ensureRobot().laugh();
    }

    /** Play a crying sound effect. Call it when Robot PU feels sad. */
    //% blockId=robotpu_cry block="cry"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=79 blockGap=8
    export function cry(): void {
        ensureRobot().cry();
    }

    /** Play a screaming sound effect. Call it when Robot PU gets surprised. */
    //% blockId=robotpu_scream block="scream"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=79 blockGap=8
    export function scream(): void {
        ensureRobot().scream();
    }

    /** Play a funny sound effect. Call it when Robot PU feels funny. */
    //% blockId=robotpu_funny block="funny"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=79 blockGap=8
    export function funny(): void {
        ensureRobot().funny();
    }

    /**
     * Update the eye blink animation with the given alert level. Higher alert levels blink faster and brighter.
     * @param alertLevel alertness from 0 (sleepy) to 10 (fully alert), eg: 5
     */
    //% blockId=robotpu_blink block="blink with alert level %alertLevel"
    //% subcategory="Actions"
    //% group="Actions"
    //% alertLevel.min=0 alertLevel.max=10 alertLevel.defl=5
    //% weight=79 blockGap=8
    export function blink(alertLevel: number): void {
        ensureRobot().pcb.blink(alertLevel);
    }

    /** Rest in a balanced idle pose. Reacts subtly to sound. */
    //% blockId=robotpu_rest block="rest"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=78 blockGap=8
    export function rest(): void {
        lastRestDone = (getRobotAPI().rest() === 0);
    }

    /** Return true when the last rest cycle completed. */
    //% blockId=robotpu_is_rest_done block="is rest done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=78 blockGap=8
    export function isRestDone(): boolean {
        return lastRestDone;
    }

    /** Move to the calibration pose and flash the eyes. Useful after changing servo trim values. */
    //% blockId=robotpu_calibrate block="calibrate"
    //% weight=78 blockGap=8
    //% group="Actions"
    //% subcategory="Actions"
    export function calibrate(): void {
        ensureRobot().calibrate();
    }

    /** Move to the standing pose. */
    //% blockId=robotpu_stand block="stand"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=77 blockGap=8
    export function stand(): void {
        lastStandDone = (getRobotAPI().stand() === 0);
    }

    /** Return true when the robot reached the standing position. */
    //% blockId=robotpu_is_stand_done block="is stand done?"
    //% subcategory="Actions"
    //% group="Actions"
    //% weight=77 blockGap=8
    export function isStandDone(): boolean {
        return lastStandDone;
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
    //% blockId=robotpu_morse block="play morse code %code|| at speed %unitMs ms"
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
    //% blockId=robotpu_morse_text block="play %text in morse|| at speed %unitMs ms"
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
    //% blockId=robotpu_servo_step_status block="status of %joint moving to %target using step %stepSize"
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
    //% blockId=robotpu_move_servos block="move servos to %targets with speeds %speeds sync indexes %syncList gain %syncSpeedGain async indexes %asyncList gain %asyncSpeedGain"
    //% subcategory="Actuators"
    //% group="Advanced"
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
    //% blockId=robotpu_set_control_offsets block="set control offsets for indexes %indexes to values %values"
    //% subcategory="Actuators"
    //% group="Advanced"
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
    //% blockId=robotpu_increment_control_offsets block="increment control offsets for indexes %indexes by values %values with gain %gain"
    //% subcategory="Actuators"
    //% group="Advanced"
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
    //% blockId=robotpu_left_eye_bright block="set left eye brightness to %brightness"
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
    //% blockId=robotpu_right_eye_bright block="set right eye brightness to %brightness"
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

    /** Return the servo target angles array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, right shoulder, left arm, right arm. */
    //% blockId=robotpu_servo_targets block="servo targets"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=36 blockGap=8
    export function servoTargets(): number[] {
        return ensureRobot().pcb.servoTarget;
    }

    /** Return the servo control output angles array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, right shoulder, left arm, right arm. */
    //% blockId=robotpu_servo_controls block="servo controls"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=35 blockGap=8
    export function servoControls(): number[] {
        return ensureRobot().pcb.servoCtrl;
    }

    /** Return the servo trim offsets array. Items: left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, right shoulder, left arm, right arm. */
    //% blockId=robotpu_servo_trims block="servo trims"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=34 blockGap=8
    export function servoTrims(): number[] {
        return ensureRobot().pcb.servoTrim;
    }

    /** Return the front distance array in centimeters. Items: left, front-left, front, front-right, right. Call sonar scan first to update the values. */
    //% blockId=robotpu_explore_distance_array block="front distances"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=33 blockGap=8
    export function frontDistanceArray(): number[] {
        const d = ensureRobot().pr.exploreDistance;
        return [d[0], d[1], (d[1] + d[2]) * 0.5, d[2], d[3]];
    }

    /** Reset the odometry so Robot PU's position is (0, 0) and heading is 0 degrees (north). */
    //% blockId=robotpu_reset_odom block="reset robot position"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=32 blockGap=8
    export function resetOdom(): void {
        ensureRobot().resetOdom();
    }

    /** Return the number of walking steps counted by the odometry pedometer. */
    //% blockId=robotpu_pedometer block="step count"
    //% subcategory="Sensors"
    //% group="Sensors"
    //% weight=31 blockGap=8
    export function stepCount(): number {
        return ensureRobot().odom.pedometer;
    }

    /** Return Robot PU's estimated location as [x, y, heading]. x and y are in millimeters, heading is in degrees. */
    //% blockId=robotpu_location_array block="robot position"
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
    //% blockId=robotpu_runStrCMD block="run string command %command"
    //% command.shadow=text
    //% subcategory="Remote Control"
    //% group="Remote Control"
    //% weight=9 blockGap=8
    export function runStringCommand(command: string): void {
        ensureRobot().runStringCommand(command);
    }

    /**
     * Execute a key/value command received over radio. Use this inside a radio.onReceivedValue handler.
     * Supported keys: #puspeed (forward/back), #puturn (left/right), #puroll (head yaw), #pupitch (head pitch), #puB (behavior), #pulogo (status announcement), #purs (rest pose index).
     * @param key the command key received from radio, eg: "#puspeed"
     * @param value the command value received from radio, eg: 1
     */
    //% blockId=robotpu_runKeyValueCMD block="execute command with key %key and value %value"
    //% key.shadow=text
    //% subcategory="Remote Control"
    //% group="Advanced"
    //% weight=9 blockGap=8
    export function runKeyValueCommand(key: string, value: number): void {
        ensureRobot().runKeyValueCommand(key, value);
    }

}
