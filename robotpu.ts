namespace robotPuPro {

    export class Parameters {
        walkTilt: number;
        jumpTilt: number;
        legSize: number;
        dof: number;
        exploreDirection: number[];
        exploreSize: number;
        exploreDistance: number[];
        exploreMid2: number;
        exploreMid1: number;
        walkFwdStates: number[];
        walkBwdStates: number[];
        skateFwdStates: number[];
        skateBwdStates: number[];
        boxingStates: number[];
        danceOkStates: number[];
        stateTargets: number[][];
        stateSpeedIndices: number[]; // Using index-based array for mapping
        speedCandidates: number[][];

        constructor() {
            this.walkTilt = 16;
            this.jumpTilt = 27;
            this.legSize = 45;
            this.dof = 10;

            // Turning directions
            this.exploreDirection = [-1.0, -0.7, 0.7, 1.0];
            this.exploreSize = this.exploreDirection.length;
            this.exploreDistance = [500.0, 500.0, 500.0, 500.0];
            this.exploreMid2 = Math.floor(this.exploreSize * 0.5);
            this.exploreMid1 = Math.max(0, this.exploreMid2 - 1);

            // Movement sequences
            this.walkFwdStates = [2, 3, 4, 5];
            this.walkBwdStates = [6, 5, 7, 3];
            this.skateFwdStates = [8, 9, 10, 11];
            this.skateBwdStates = [12, 1, 13, 9];
            this.boxingStates = [8, 9, 10, 11, 12, 13];
            this.danceOkStates = [0, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 16, 17];

            let w_t = this.walkTilt;
            let l_s = this.legSize;
            let j_t = this.jumpTilt;

            // Servo targets for each pose
            // 10 DOF. servo index:
            // left foot, left leg, right foot, right leg, head yaw, head pitch, left shoulder, right shoulder, left arm, right arm
            this.stateTargets = [
                [90, 90, 90, 90, 90, 90, 90, 90, 90, 90],                  // 0: stand
                [10, 150, 170, 30, 40, 125, 90, 90, 90, 90],               // 1: duck
                [90 - w_t, 90 + 35, 90 - j_t, 90 + 30, 90 - l_s - 8, 90, 90 - l_s, 90 - l_s, 90, 90], // 2: walk1
                [93, 90 + l_s, 93, 90 + l_s, 90 - l_s - 8, 90, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],           // 3: w2
                [90 + j_t, 90 - 30, 90 + w_t, 90 - 35, 90 + l_s + 8, 90, 90 + l_s, 90 + l_s, 90, 90], // 4: w3
                [87, 90 - l_s, 87, 90 - l_s, 90 + l_s + 8, 90, 90 + l_s, 90 + l_s, 90 - l_s, 90 + l_s],           // 5: w4
                [90 - w_t, 90 - 25, 90 - j_t, 90 - 45, 90 + l_s, 90, 90 + l_s, 90 + l_s, 90, 90],     // 6: w5
                [90 + j_t, 90 + 45, 90 + w_t, 90 + 25, 90 - l_s, 90, 90 - l_s, 90 - l_s, 90, 90],     // 7: w6
                [90 - w_t, 90 + 35, 90 - j_t, 90 + 30, 90 - l_s - 8, 90, 90, 90, 90, 90], // 8: boxing 1
                [93, 90 + l_s, 93, 90 + l_s, 90 - l_s - 8, 90, 90 - l_s, 90 + l_s, 90, 180],           // 9: b2
                [90 + j_t, 90 - 30, 90 + w_t, 90 - 35, 90 + l_s + 8, 90, 0, 180, 45, 90], // 10: b3
                [87, 90 - l_s, 87, 90 - l_s, 90 + l_s + 8, 90, 90 - l_s, 180, 90, 80],           // 11: b4
                [90 - w_t, 90 - 25, 90 - j_t, 90 - 45, 90 + l_s, 90, 90, 180, 90, 90],     // 12: b5
                [90 + j_t, 90 + 45, 90 + w_t, 90 + 25, 90 - l_s, 90, 90 - l_s, 90, 0, 45],     // 13: b6
                [130, 90, 50, 90, 90, 90, 0, 0, 90, 45],                 // 14: jump
                [0, 85, 180, 95, 90, 90, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],                  // 15: sit
                [85, 90, 95, 90, 45, 65, 90, 90 + l_s, 90 + l_s, 90],                  // 16: dance
                [85, 90, 95, 90, 135, 65, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],                 // 17
                [75, 90, 30, 90, 135, 105, 90 + l_s, 90 + l_s, 90, 90],                // 18: side move
                [150, 90, 105, 90, 45, 105, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],               // 19
                [75, 90, 30, 90, 45, 75, 90 + l_s, 90 + l_s, 90, 90],                  // 20
                [150, 90, 105, 90, 135, 75, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],               // 21
                [75, 90, 75, 90, 90, 90, 90 + l_s, 90 + l_s, 90, 90],                  // 22
                [105, 90, 105, 90, 90, 90, 90 - l_s, 90 - l_s, 90 - l_s, 90 + l_s],                // 23
                [130, 90, 50, 90, 90, 55, 0, 180, 135, 45],                 // 24: soccer
                [90, 60, 90, 120, 90, 90, 90, 90, 90, 90],                 // 25: calibrate
                [90, 90, 90, 90, 90, 90, 90, 90, 90, 90]                   // 26: rest
            ];

            // Mapping dictionary
            this.stateSpeedIndices = [1, 0, 3, 4, 2, 4, 3, 2, 3, 4, 2, 4, 3, 2, 8, 10, 0, 0, 6, 6, 6, 6, 9, 7, 5, 7, 0];

            // Control speed vectors
            this.speedCandidates = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],             // 0
                [1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 1],         // 1
                [2, 1, 1, 1, 1.2, 0.4, 2, 2, 2, 2],         // 2
                [1, 1, 2, 1, 1.2, 0.4, 2, 2, 2, 2],         // 3
                [1, 1, 1, 1, 1.2, 0.4, 1, 1, 1, 1],         // 4
                [5, 1, 5, 1, 1, 5, 1, 1, 1, 1],             // 5
                [0.55, 1, 0.55, 1, 1, 1, 1, 1, 1, 1],       // 6
                [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],             // 7
                [5, 1, 5, 1, 1, 3, 1, 1, 1, 1],             // 8
                [1, 1, 2, 1, 1, 1, 1, 1, 1, 1],             // 9
                [6, 2, 6, 2, 1, 1, 1, 1, 1, 1]              // 10
            ];
        }
    }

    export class PID {
        public kp: number;
        public ki: number;
        public kd: number;

        private integral: number;
        private prevError: number;
        private lastTs: number;
        private hasPrev: boolean;

        constructor(kp: number = 0, ki: number = 0, kd: number = 0) {
            this.kp = kp;
            this.ki = ki;
            this.kd = kd;
            this.integral = 0;
            this.prevError = 0;
            this.lastTs = 0;
            this.hasPrev = false;
        }

        public setGains(kp: number, ki: number, kd: number): void {
            this.kp = kp;
            this.ki = ki;
            this.kd = kd;
        }

        public reset(): void {
            this.integral = 0;
            this.prevError = 0;
            this.lastTs = 0;
            this.hasPrev = false;
        }

        public update(error: number, nowMs: number, integralLimit: number = 0): number {
            if (!this.hasPrev) {
                this.hasPrev = true;
                this.prevError = error;
                this.lastTs = nowMs;
                return this.kp * error;
            }

            let dtMs = nowMs - this.lastTs;
            if (dtMs <= 0) dtMs = 1;
            let dt = dtMs / 1000.0;

            this.integral += error * dt;
            if (integralLimit > 0) {
                if (this.integral > integralLimit) this.integral = integralLimit;
                if (this.integral < -integralLimit) this.integral = -integralLimit;
            }

            let derivative = (error - this.prevError) / dt;

            this.prevError = error;
            this.lastTs = nowMs;

            return this.kp * error + this.ki * this.integral + this.kd * derivative;
        }
    }

    export class MusicLib {
        loudThreshold: number;
        loud: number;
        bufferSize: number;
        buf: number[];
        lastIndex: number;
        period: number;
        hits: number;

        constructor() {
            this.loudThreshold = 15; // loudness threshold for beats
            this.loud = 0;
            this.bufferSize = 43; // 42 measurements bucket and 1 data collection bucket
            this.buf = [];
            for (let i = 0; i < this.bufferSize; i++) {
                this.buf.push(0);
            }
            this.lastIndex = 0;
            this.period = 500; // most possible period in ms
            this.hits = 0;
        }

        // ring buffer index calculation
        ringBufferIdx(m: number, icr: number, size: number) {
            const result = (m + icr) % size
            if (result < 0) {
                // Handle negative modulo in JS
                return result + size
            }
            return result
        }

        /**
         * check if it is a beat, compute music period, and update threshold
         */
        isABeat(timestamp: number, loudness: number, snr: number, sampleMs: number = 125): boolean {
            this.loud = loudness * 0.01; // scale down
            let isABeatResult = false;

            // compute bucket index
            let idx = Math.floor(timestamp / sampleMs) % this.bufferSize;

            if (idx == this.lastIndex) {
                // update the data collection bucket
                this.hits += 1;
                this.buf[idx] = (this.buf[idx] * (this.hits - 1) + this.loud) / this.hits;
            } else {
                // fill the new bucket
                this.hits = 1;
                this.buf[idx] = this.loud;
                this.lastIndex = idx;

                // beat detection only when previous bucket is full
                let cIdx = this.ringBufferIdx(idx, -2, this.bufferSize);
                let prevIdx = cIdx;
                let c = 0; // beat count

                // Calculate average loudness
                let sumLoud = 0;
                for (let val of this.buf) {
                    sumLoud += val;
                }
                let avgLoudness = sumLoud / this.bufferSize;
                let length = this.bufferSize - 3;

                for (let j = 0; j < length; j++) {
                    let nl = this.ringBufferIdx(cIdx, -1, this.bufferSize);
                    let nr = this.ringBufferIdx(cIdx, 1, this.bufferSize);

                    if (this.buf[cIdx] > this.buf[nl] * snr &&
                        this.buf[cIdx] > this.buf[nr] * snr &&
                        this.buf[cIdx] > avgLoudness) {
                        c++;
                        if (prevIdx == cIdx) {
                            this.loudThreshold = this.buf[cIdx] * 0.9;
                            isABeatResult = true;
                        }
                    }
                    cIdx = nl; // move to previous
                }

                if (c > 0) {
                    let newPeriod = sampleMs * length / c;
                    let periodRatio = this.period > 0 ? newPeriod / this.period : 1.0;
                    let smoothFactor = (periodRatio > 0.8 && periodRatio < 1.2) ? 0.1 : 0.05;

                    this.period = (this.period * (1.0 - smoothFactor)) + (newPeriod * smoothFactor);
                }
            }
            return isABeatResult;
        }
    }
    export class Content {
        notes: string[];
        chord: number[][];
        pattern: number[][];
        loc: string[];
        act: string[];
        sub: string[];
        obj: string[];
        sentences: string[];

        constructor() {
            this.notes = ["#70REYY", "#62MIYY", "#58FAOR", "#52SOHW", "#46LAOR", "#42TIYY", "#39DOWW",
                "#35REYY", "#31MIYY", "#29FAOR", "#26SOHW", "#23LAOR", "#21TIYY", "#20DOWW"];
            this.chord = [[0, 3, 5], [0, 2, 4, 6], [0, 2, 4, 7], [0, 1, 2, 3]];
            this.pattern = [[0, 0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1], [3]];
            this.loc = ["here", "there", "up", "down", "left", "right", "front", "back", ""];
            this.act = ["liked", "saw", "heard", "felt", ""];
            this.sub = ["I", "He", "She", "They", ""];
            this.obj = ["me", "you", "him", "her", "them", "it", "the dance", "the song", ""];
            this.sentences = ["I am so tired.", "Let's go, go, go!", "Be careful!", "Life lies in motion.",
                "Let's pair up!", "I am stuck!", "New song:", "Easy peasy!", "I like my backpack",
                "I love you", "You are the best!", "yeh!", "woohoo!"];
        }

        // Helper to pick random item from an array
        private choice<T>(arr: T[]): T {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Helper to get random integer between min and max (inclusive)
        private randint(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
         * Composes a procedural song string
         */
        composeSong(): string {
            let song: string[] = [];
            let b = this.notes.length;
            let d = this.choice(this.chord);
            let w = this.choice(this.pattern);
            let k = 0;

            while (k < 16) {
                let l = this.randint(0, b - 1);
                for (let m of w) {
                    let n = (l + this.choice(d) + this.choice([-1, 0, 0, 0, 0, 1])) % b;
                    if (n < 0) n += b; // Handle negative modulo

                    let o = this.notes[n];

                    if (m >= 1 && this.randint(0, 8) == 0) {
                        song.push(o);
                        for (let count = 0; count < m; count++) {
                            let innerIdx = (n + this.choice([-1, 0, 1])) % b;
                            if (innerIdx < 0) innerIdx += b;
                            song.push(this.notes[innerIdx]);
                        }
                    } else {
                        // Python: n + n[-1] * 4 * j
                        // Appends the last character of the note string repeated (4 * j) times
                        let repeatedChar = o.charAt(o.length - 1);
                        let suffix = "";
                        for (let count2 = 0; count2 < (4 * m); count2++) {
                            suffix += repeatedChar;
                        }
                        song.push(o + suffix);
                    }
                    k += m + 1;
                }
                d = this.choice(this.chord);
                w = this.choice(this.pattern);
            }
            return song.join("");
        }

        /**
         * Generates a random "cute" sentence
         */
        cuteWords(): string {
            return this.choice(this.sub) + " " +
                this.choice(this.act) + " " +
                this.choice(this.obj) + " " +
                this.choice(this.loc) + ".";
        }
    }
    export class HCSR04 {
        timeoutUS: number;
        trig: DigitalPin;
        echo: DigitalPin;
        private lastCm: number;

        constructor(trigPin: DigitalPin = DigitalPin.P2, echoPin: DigitalPin = DigitalPin.P8) {
            // Default timeout: 30000us (approx 500cm)
            this.timeoutUS = 500 * 2 * 30;
            this.trig = trigPin;
            this.echo = echoPin;
            this.lastCm = -1;

            // Initialize pins
            pins.digitalWritePin(this.trig, 0);
            pins.digitalReadPin(this.echo);
        }

        /**
         * Measures distance in centimeters
         */
        distanceCm(): number {
            // 1. Send 10us pulse to Trigger pin
            pins.digitalWritePin(this.trig, 0);
            control.waitMicros(5);
            pins.digitalWritePin(this.trig, 1);
            control.waitMicros(10);
            pins.digitalWritePin(this.trig, 0);

            // 2. Read the pulse width on Echo pin (High pulse)
            // returns duration in microseconds
            let t = pins.pulseIn(this.echo, PulseValue.High, this.timeoutUS);

            // 3. Handle timeout (Python code defaults to 500 if t < 0)
            if (t <= 0) {
                t = 500;
            }

            control.waitMicros(5);

            // 4. Calculate distance: (time * speed of sound / 2)
            // The original multiplier 0.0171821 is (343.64 m/s / 2 / 10000)
            let cm = t * 0.0171821;

            // Min/Max clamp to reduce jitter and outliers
            if (cm < 2) cm = 2;
            if (cm > 400) cm = 400;

            // Simple debouncing/smoothing against the previous reading
            if (this.lastCm < 0) {
                this.lastCm = cm;
            } else {
                let diff = Math.abs(cm - this.lastCm);
                let alpha = diff > 60 ? 0.2 : 0.5;
                this.lastCm = this.lastCm * (1 - alpha) + cm * alpha;
            }

            return this.lastCm;
        }
    }
    // Configuration Constants

    export class PCB {
        public i2cAddress: number;
        private lastBlinkTS: number;
        private eyeIsOn: boolean;
        // eye
        private leftEyeBrightness: number;
        private rightEyeBrightness: number;
        private eyeBrightIcr: number;
        private blinkInterval: number;
        public pos: number;
        public lastPos: number;
        public numSteps: number;
        private blinkG: number;
        private idle: boolean;
        public currentState: number;
        public dof: number = 10
        servoErr: number[];
        public servoCtrl: number[];
        public servoTarget: number[];
        public servoTrim: number[];

        constructor() {
            this.i2cAddress = 16;
            this.lastBlinkTS = 0;
            this.eyeIsOn = true;
            this.leftEyeBrightness = 1023;
            this.rightEyeBrightness = 1023;
            this.eyeBrightIcr = 1;
            this.blinkInterval = 6000;
            this.pos = 0;
            this.lastPos = 0;
            this.numSteps = 0;
            this.blinkG = 4000;
            this.idle = false;
            this.currentState = 0;

            // Initialize vectors
            this.servoErr = [];
            this.servoCtrl = [];
            this.servoTarget = [];
            this.servoTrim = []
            for (let i = 0; i < this.dof; i++) {
                this.servoErr.push(0.0);
                this.servoCtrl.push(0.0);
                this.servoTarget.push(0.0);
                this.servoTrim.push(0.0)
            }

            // I2C is initialized automatically in MakeCode
        }

        /**
         * Control a DC motor. sp: -100 to 100.
         * @param m motor index (1 or 2)
         * @param sp speed from -100 (full reverse) to 100 (full forward)
         */
        public dcMotor(m: number, sp: number): void {
            m = Math.floor(m);
            if (m < 1 || m > 2) return;
            sp = Math.floor(Math.max(-100, Math.min(100, sp)));
            let buf = pins.createBuffer(4);
            buf.setNumber(NumberFormat.UInt8LE, 0, m);
            buf.setNumber(NumberFormat.UInt8LE, 1, sp >= 0 ? 0x01 : 0x02);
            buf.setNumber(NumberFormat.Int8LE, 2, Math.abs(sp));
            buf.setNumber(NumberFormat.UInt8LE, 3, 0);
            pins.i2cWriteBuffer(this.i2cAddress, buf);
        }

        /**
         * Set servo angle (0-180).
         */
        public servo(sr: number, a: number): void {
            if (sr >= 0 && sr <= 7) {
                a = Math.min(180, Math.max(0, Math.floor(a)));
                let reg = (sr == 7) ? 0x10 : sr + 3;
                let buf2 = pins.createBuffer(4);
                buf2.setNumber(NumberFormat.UInt8LE, 0, reg);
                buf2.setNumber(NumberFormat.UInt8LE, 1, a);
                buf2.setNumber(NumberFormat.UInt8LE, 2, 0);
                buf2.setNumber(NumberFormat.UInt8LE, 3, 0);
                pins.i2cWriteBuffer(this.i2cAddress, buf2);
            } else if (sr == 8) {
                // use pin 14 as servo
                pins.servoWritePin(AnalogPin.P14, a);
            } else if (sr == 9) {
                // use pin 15 as servo
                pins.servoWritePin(AnalogPin.P15, a);
            }
        }

        /**
         * Move servo toward target with controlled speed.
         */
        public servoStep(target: number, sp: number, idx: number): number {
            sp = Math.abs(sp);
            target = Math.max(0, Math.min(179, target));
            let err = target - this.servoTarget[idx];
            this.servoErr[idx] = err;

            if (Math.abs(err) <= sp) {
                this.servoTarget[idx] = target;
            } else {
                this.servoTarget[idx] += (err >= 0) ? sp : -sp;
            }
            this.servo(idx, this.servoTarget[idx]);
            return err
        }

        /**
         * Move a servo smoothly to an angle (0-180) using the PCB's smooth motion command.
         * @param sr servo index 0-7
         * @param a target angle
         */
        public servoSmooth(sr: number, a: number): void {
            if (sr >= 0 && sr <= 7) {
                a = Math.min(180, Math.max(0, Math.floor(a)));
                let reg = (sr == 7) ? 0x20 : sr + 0x13;
                let buf = pins.createBuffer(4);
                buf.setNumber(NumberFormat.UInt8LE, 0, reg);
                buf.setNumber(NumberFormat.UInt8LE, 1, a);
                buf.setNumber(NumberFormat.UInt8LE, 2, 0);
                buf.setNumber(NumberFormat.UInt8LE, 3, 0);
                pins.i2cWriteBuffer(this.i2cAddress, buf);
            }
        }

        /**
         * Move all servos immediately to target state.
         */
        public servoMove(targets: number[]): void {
            for (let p = 0; p < targets.length; p++) {
                this.servoTarget[p] = targets[p] + this.servoTrim[p] + this.servoCtrl[p]
                this.servo(p, this.servoTarget[p]);
            }
            this.idle = true;
        }

        /**
         * Check if servos reached target.
         */
        public isServoIdle(servoList: number[]): boolean {
            this.idle = servoList.every(i => Math.abs(this.servoErr[i]) < 1);
            return this.idle;
        }

        /**
         * Move robot through state sequences. If moving down, return 0
         */
        public move(p: Parameters, states: number[],
            syncList: number[], sp: number,
            asyncList: number[], asyncSp: number): number {
            if (sp == 0) return 0;
            this.pos = Math.min(this.pos, states.length - 1);
            this.currentState = states[this.pos];
            let targets = p.stateTargets[this.currentState];
            let spIdx = p.stateSpeedIndices[this.currentState] || 0;
            let speeds = p.speedCandidates[spIdx];
            if (this.moveServos(targets, speeds, syncList, sp, asyncList, asyncSp)) {
                this.lastPos = this.pos;
                this.pos = (this.pos + 1) % states.length;
                this.numSteps += 1;
                return 0;
            }
            return 1;
        }

        /**
         *
         * @param targets. A list of servo targets.
         * @param speeds. A list of servo speeds.
         * @param syncList. Servo indexes that move synchronously.
         * @param syncSpeedGain. Synchronous speed gain
         * @param asyncList. Servo indexes that move asynchronously
         * @param asyncSpeedGain. Asynchronous speed gain
         */
        public moveServos(targets: number[], speeds: number[],
            syncList: number[], syncSpeedGain: number,
            asyncList: number[], asyncSpeedGain: number): boolean {
            for (let q of syncList) {
                this.servoStep(targets[q] + this.servoTrim[q] + this.servoCtrl[q], syncSpeedGain * speeds[q], q);
            }
            for (let r of asyncList) {
                this.servoStep(targets[r] + this.servoTrim[r] + this.servoCtrl[r], asyncSpeedGain * speeds[r], r);
            }
            return this.isServoIdle(syncList)
        }

        /**
         * Control onboard LED lights.
         */
        public setLight(light: number): void {
            let buf3 = pins.createBuffer(4);
            buf3.setNumber(NumberFormat.UInt8LE, 0, 0x12);
            buf3.setNumber(NumberFormat.UInt8LE, 1, light);
            buf3.setNumber(NumberFormat.UInt8LE, 2, 0);
            buf3.setNumber(NumberFormat.UInt8LE, 3, 0);
            pins.i2cWriteBuffer(this.i2cAddress, buf3);
        }

        /**
         * Turn the servo power on or off.
         * @param on true to power on, false to power off
         */
        public setServoPower(on: boolean): void {
            let buf = pins.createBuffer(4);
            buf.setNumber(NumberFormat.UInt8LE, 0, on ? 0x31 : 0x32);
            buf.setNumber(NumberFormat.UInt8LE, 1, 0);
            buf.setNumber(NumberFormat.UInt8LE, 2, 0);
            buf.setNumber(NumberFormat.UInt8LE, 3, 0);
            pins.i2cWriteBuffer(this.i2cAddress, buf);
        }

        /**
         * Read the battery level from the PCB.
         * @returns battery percentage from 0 to 100
         */
        public getBatteryLevel(): number {
            let cmd = pins.createBuffer(4);
            cmd.setNumber(NumberFormat.UInt8LE, 0, 0x33);
            pins.i2cWriteBuffer(this.i2cAddress, cmd, true);
            let ret = pins.i2cReadBuffer(this.i2cAddress, 1);
            return ret.getNumber(NumberFormat.UInt8LE, 0);
        }

        /**
         * Eyes ON/OFF control.
         */
        public eyesCtl(c: number): void {
            pins.digitalWritePin(DigitalPin.P12, c);
            pins.digitalWritePin(DigitalPin.P13, c);
            this.eyeIsOn = (c == 1);
            this.lastBlinkTS = control.millis();
        }

        /**
         * Left eye brightness (0-1023).
         */
        public leftEyeBright(b: number): void {
            pins.analogWritePin(AnalogPin.P12, b);
            this.leftEyeBrightness = b;
        }

        /**
         * Right eye brightness (0-1023).
         */
        public rightEyeBright(b: number): void {
            pins.analogWritePin(AnalogPin.P13, b);
            this.rightEyeBrightness = b;
        }

        /**
         * Turn the speaker on 
         */
        public speakerOn(): void {
            //music.setBuiltInSpeakerEnabled(true);
        }

        /**
         * Turn the speaker off
         */
        public speakerOff(): void {
            //music.setBuiltInSpeakerEnabled(false);
            // Force Pin 0 LOW to pull down the driver transistor to avoid speaker overheating and wasting power
            //pins.digitalWritePin(DigitalPin.P0, 0);
        }

        /**
         * Blink animation logic.
         */
        public blink(alertLevel: number): void {
            let tsDiff = control.millis() - this.lastBlinkTS;

            if (this.eyeIsOn) {
                if (tsDiff > this.blinkInterval) {
                    this.eyesCtl(0);
                } else {
                    this.blinkG = alertLevel * 400;
                    let brightness = Math.min(1023, alertLevel * 102);
                    this.leftEyeBright(brightness);
                    this.rightEyeBright(brightness);
                }
            } else {
                if (tsDiff > Math.randomRange(100, 250)) {
                    this.eyesCtl(1);
                    if (Math.randomRange(0, 4) == 0) {
                        this.blinkInterval = Math.randomRange(100, 250);
                    } else {
                        this.blinkInterval = Math.randomRange(this.blinkG, this.blinkG * 2);
                    }
                }
            }
        }

        /**
         * Pulsing/Flash animation.
         */
        public flash(icr: number = 50): void {
            this.leftEyeBrightness += this.eyeBrightIcr;

            if (this.leftEyeBrightness >= 1023) {
                this.eyeBrightIcr = -icr;
                this.leftEyeBrightness = 1023;
            } else if (this.leftEyeBrightness <= 0) {
                this.eyeBrightIcr = icr;
                this.leftEyeBrightness = 0;
            }

            this.rightEyeBright(1023 - this.leftEyeBrightness);
            this.leftEyeBright(this.leftEyeBrightness);
        }
    }

    // 2D rotation matrix SO(2).
    function rot2(thetaRad: number): number[][] {
        let c = Math.cos(thetaRad);
        let s = Math.sin(thetaRad);
        return [
            [c, -s],
            [s, c],
        ];
    }

    export class Odometry {
        public axisHalfDistanceMm: number;
        public currentTransformation: number[][];
        public pedometer: number = 0;

        static rot2(thetaRad: number): number[][] {
            let c = Math.cos(thetaRad);
            let s = Math.sin(thetaRad);
            return [
                [c, -s],
                [s, c],
            ];
        }

        static se2(R: number[][], t: number[]): number[][] {
            return [
                [R[0][0], R[0][1], t[0]],
                [R[1][0], R[1][1], t[1]],
                [0, 0, 1],
            ];
        }

        static trans2(tx: number, ty: number): number[][] {
            return [
                [1, 0, tx],
                [0, 1, ty],
                [0, 0, 1],
            ];
        }

        static matMul3(A: number[][], B: number[][]): number[][] {
            return [
                [
                    A[0][0] * B[0][0] + A[0][1] * B[1][0] + A[0][2] * B[2][0],
                    A[0][0] * B[0][1] + A[0][1] * B[1][1] + A[0][2] * B[2][1],
                    A[0][0] * B[0][2] + A[0][1] * B[1][2] + A[0][2] * B[2][2],
                ],
                [
                    A[1][0] * B[0][0] + A[1][1] * B[1][0] + A[1][2] * B[2][0],
                    A[1][0] * B[0][1] + A[1][1] * B[1][1] + A[1][2] * B[2][1],
                    A[1][0] * B[0][2] + A[1][1] * B[1][2] + A[1][2] * B[2][2],
                ],
                [
                    A[2][0] * B[0][0] + A[2][1] * B[1][0] + A[2][2] * B[2][0],
                    A[2][0] * B[0][1] + A[2][1] * B[1][1] + A[2][2] * B[2][1],
                    A[2][0] * B[0][2] + A[2][1] * B[1][2] + A[2][2] * B[2][2],
                ],
            ];
        }

        static rotateAboutPivot(deltaYawRad: number, pivotXYmm: number[]): number[][] {
            let px = pivotXYmm[0];
            let py = pivotXYmm[1];
            return Odometry.matMul3(
                Odometry.matMul3(
                    Odometry.trans2(px, py),
                    Odometry.se2(Odometry.rot2(deltaYawRad), [0, 0])
                ),
                Odometry.trans2(-px, -py)
            );
        }

        static updateOdometry(TworldRobot: number[][], stepTransformationMatrix: number[][]): number[][] {
            return Odometry.matMul3(TworldRobot, stepTransformationMatrix);
        }

        static deg2rad(deg: number): number {
            return (deg * Math.PI) / 180.0;
        }

        static rad2deg(rad: number): number {
            return (rad * 180.0) / Math.PI;
        }

        static identity3(): number[][] {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ];
        }

        constructor(axisHalfDistanceMm: number = 25.0) {
            this.axisHalfDistanceMm = axisHalfDistanceMm;
            this.currentTransformation = Odometry.identity3();
            this.pedometer = 0;
        }

        update(transformationMatrix: number[][]): void {
            // Apply a general SE(2) step transform (e.g., external correction).
            this.currentTransformation = Odometry.updateOdometry(this.currentTransformation, transformationMatrix);
        }

        leftStep(yawAngleDeg: number): void {
            // Apply one walking step where the left leg is the support pivot.
            this.pedometer++;
            this.update(Odometry.rotateAboutPivot(Odometry.deg2rad(yawAngleDeg), [-this.axisHalfDistanceMm, 0.0]));
        }

        rightStep(yawAngleDeg: number): void {
            // Apply one walking step where the right leg is the support pivot.
            this.pedometer++;
            this.update(Odometry.rotateAboutPivot(Odometry.deg2rad(yawAngleDeg), [this.axisHalfDistanceMm, 0.0]));
        }

        getPosition(): { x_mm: number; y_mm: number; theta_deg: number } {
            // Return (x,y,theta) extracted from the SE(2) matrix.
            let xMm = this.currentTransformation[0][2];
            let yMm = this.currentTransformation[1][2];
            let thetaDeg = Odometry.rad2deg(Math.atan2(this.currentTransformation[1][0], this.currentTransformation[0][0]));
            return { x_mm: xMm, y_mm: yMm, theta_deg: thetaDeg };
        }

        reset(): void {
            this.currentTransformation = Odometry.identity3();
            this.pedometer = 0;
        }
    }

    /**
     * RoboVoice: converts any printable text to a pleasant robotic melody.
     *
     * Five algorithm layers:
     *   1. A-pentatonic pitch set    — 13 pitches (A2→A5), no dissonant intervals possible.
     *   2. Frequency-rank mapping    — top English letters map to A-family notes (440/880/220 Hz).
     *   3. Markov pitch smoothing    — output = prev×0.6 + target×0.4, prevents jarring leaps.
     *   4. Pitch contour             — vowels push pitch up; word boundaries pull it back to A4.
     *   5. Duration weighting        — vowels 140ms, frequent consonants 80ms, stops 45ms.
     *
     * Full printable ASCII coverage:
     *   Letters  → frequency-ranked pentatonic indices (see LETTER_INDEX).
     *   Digits   → descending scale 0(high)…9(low) — robotic counting feel.
     *   Punctuation → emotional effects:
     *     '!' → sharp A5 accent + contour reset (excitement)
     *     '?' → rising E4→A5 two-note glide (question intonation)
     *     '.' → low A3 + full contour reset (sentence end / calm)
     *     ',' → short rest + slight dip (brief pause)
     *     ';' ':' → medium rest + neutral (softer pause)
     *     '-' '—' → medium rest (em-dash / hyphen pause)
     *     '\'' → tiny glide, no reset (contraction — keep flow)
     *     '(' ')' → low G3 bracket tone (parenthetical aside)
     *     '@' '#' '$' '%' '&' '*' → sharp high accent (special char emphasis)
     *     '+' '=' → neutral mid C4 tone
     *     ' '     → rest + drift to A4 (word boundary)
     *   Remaining printable ASCII → mid default tone (C4).
     */
    export class RoboVoice {
        // A-pentatonic scale across 3 octaves, A-note heavy.
        // Intervals: Root(A), min3(C), M3(E), P5(G) — no tritones, all consonant.
        // prettier-ignore
        private static readonly SCALE: number[] = [
            110,  // [0]  A2
            131,  // [1]  C3
            165,  // [2]  E3
            196,  // [3]  G3
            220,  // [4]  A3  ← A-family
            262,  // [5]  C4
            330,  // [6]  E4
            392,  // [7]  G4
            440,  // [8]  A4  ← A-family · default neutral pitch
            523,  // [9]  C5
            659,  // [10] E5
            784,  // [11] G5
            880   // [12] A5  ← A-family · excitement peak
        ];

        // Letters → scale index by English frequency rank.
        // Rank 1-6 (E T A O I N, ~60% of all letters) → A-family indices {4,8,12}.
        // prettier-ignore
        private static readonly LETTER_INDEX: { [ch: string]: number } = {
            "e": 8, "t": 8, "a": 12, "o": 4, "i": 8, "n": 6,   // rank  1-6  → A-family
            "s": 9, "h": 7, "r": 10, "d": 9, "l": 7, "c": 10,  // rank  7-12 → C5/G4/E5
            "u": 9, "m": 7,                                          // rank 13-14
            "w": 5, "f": 6, "g": 5, "y": 6, "p": 3, "b": 5,   // rank 15-20 → C4/E4/G3
            "v": 3, "k": 6, "j": 2, "x": 3, "q": 1, "z": 0    // rank 21-26 → low tones
        };

        // Digits → descending scale indices: '0'=high, '9'=low (robotic counting feel).
        // prettier-ignore
        private static readonly DIGIT_INDEX: { [ch: string]: number } = {
            "0": 12, "1": 11, "2": 10, "3": 9, "4": 8,
            "5": 7, "6": 6, "7": 5, "8": 4, "9": 3
        };

        // Duration buckets (ms)
        private static readonly DUR_VOWEL = 140;  // a e i o u — voiced, sustained
        private static readonly DUR_COMMON = 80;   // n s r l m h — frequent consonants
        private static readonly DUR_STOP = 45;   // p b t k d g — short percussive stops
        private static readonly DUR_DIGIT = 100;  // digits — deliberate robotic count
        private static readonly DUR_REST = 90;   // space / word boundary

        private static readonly VOWELS = "aeiou";
        private static readonly STOPS = "pbtkdg";
        private static readonly COMMONS = "nsrlmh";

        // Markov pitch state (fractional scale index)
        private smoothIdx: number;
        // Intonation contour: rises on vowels, falls at boundaries
        private contourBias: number;

        constructor() {
            this.smoothIdx = 8;   // start at A4
            this.contourBias = 0;
        }

        /** Reset pitch state to neutral A4 (call before a new unrelated utterance). */
        public reset(): void {
            this.smoothIdx = 8;
            this.contourBias = 0;
        }

        private clamp(v: number, lo: number, hi: number): number {
            return v < lo ? lo : v > hi ? hi : v;
        }

        /**
         * Advance Markov state toward targetIdx and return the rounded output index.
         * Contour bias is updated based on vowel/consonant type.
         */
        private nextIdx(targetIdx: number, isVowel: boolean): number {
            if (isVowel) {
                this.contourBias = this.clamp(this.contourBias + 0.5, -2, 2);
            } else {
                this.contourBias *= 0.7;
            }
            this.smoothIdx = this.smoothIdx * 0.6 + (targetIdx + this.contourBias) * 0.4;
            return this.clamp(Math.round(this.smoothIdx), 0, RoboVoice.SCALE.length - 1);
        }

        /** Play one scale tone via the Markov smoother. */
        private playSmoothed(targetIdx: number, dur: number, isVowel: boolean = false): void {
            const idx = this.nextIdx(targetIdx, isVowel);
            music.playTone(RoboVoice.SCALE[idx], dur);
        }

        /** Play a direct (unsmoothed) tone at a fixed scale index. */
        private playDirect(scaleIdx: number, dur: number): void {
            this.smoothIdx = scaleIdx; // snap Markov state to this pitch
            music.playTone(RoboVoice.SCALE[scaleIdx], dur);
        }

        /** Drift Markov state back toward neutral A4 (index 8). */
        private driftToNeutral(weight: number = 0.3): void {
            this.smoothIdx = this.smoothIdx * (1 - weight) + 8 * weight;
            this.contourBias = this.clamp(this.contourBias - 1, -2, 2);
        }

        /** Duration for a letter character. */
        private letterDuration(ch: string): number {
            if (RoboVoice.VOWELS.indexOf(ch) >= 0) return RoboVoice.DUR_VOWEL;
            if (RoboVoice.STOPS.indexOf(ch) >= 0) return RoboVoice.DUR_STOP;
            if (RoboVoice.COMMONS.indexOf(ch) >= 0) return RoboVoice.DUR_COMMON;
            return 65;
        }

        /**
         * Speak text as a pleasant robotic melody.
         * Every printable ASCII character produces a musical event.
         * Plays synchronously (blocks until complete).
         */
        public say(text: string): void {
            const s = text.toLowerCase();
            for (let i = 0; i < s.length; i++) {
                const ch = s.charAt(i);

                // ── Letters ────────────────────────────────────────────
                const letterIdx = RoboVoice.LETTER_INDEX[ch];
                if (letterIdx !== undefined) {
                    const isVowel = RoboVoice.VOWELS.indexOf(ch) >= 0;
                    this.playSmoothed(letterIdx, this.letterDuration(ch), isVowel);
                    continue;
                }

                // ── Digits ─────────────────────────────────────────────
                const digitIdx = RoboVoice.DIGIT_INDEX[ch];
                if (digitIdx !== undefined) {
                    this.playSmoothed(digitIdx, RoboVoice.DUR_DIGIT, false);
                    continue;
                }

                // ── Punctuation & Symbols ──────────────────────────────
                if (ch === "!") {
                    // Excitement: sharp accent at A5, snap Markov up, then reset
                    this.playDirect(12, 180);           // A5 — peak excitement
                    music.rest(40);
                    this.driftToNeutral(0.5);

                } else if (ch === "?") {
                    // Question: rising two-note glide E4 → A5
                    this.playDirect(6, 80);             // E4
                    this.playDirect(12, 160);           // A5
                    this.driftToNeutral(0.4);

                } else if (ch === ".") {
                    // Full stop: low A3, full contour reset
                    this.playDirect(4, 150);            // A3 — calm, low
                    music.rest(60);
                    this.contourBias = 0;
                    this.smoothIdx = 8;                 // hard reset to A4

                } else if (ch === ",") {
                    // Comma: brief dip rest
                    this.driftToNeutral(0.2);
                    music.rest(60);

                } else if (ch === ";" || ch === ":") {
                    // Semi-colon / colon: medium neutral pause
                    this.driftToNeutral(0.3);
                    music.rest(75);

                } else if (ch === "-" || ch === "\u2014") {
                    // Hyphen / em-dash: deliberate pause
                    this.driftToNeutral(0.2);
                    music.rest(100);

                } else if (ch === "'") {
                    // Apostrophe: tiny glide, keep flow (contraction)
                    this.playSmoothed(this.clamp(Math.round(this.smoothIdx) + 1, 0, 12), 30, false);

                } else if (ch === "(" || ch === "[" || ch === "{") {
                    // Open bracket: drop to parenthetical low G3
                    this.playDirect(3, 60);             // G3

                } else if (ch === ")" || ch === "]" || ch === "}") {
                    // Close bracket: rise back to A4
                    this.playDirect(8, 60);             // A4

                } else if (ch === "@" || ch === "#" || ch === "$" ||
                    ch === "%" || ch === "&" || ch === "*") {
                    // Special symbols: sharp high accent C5
                    this.playDirect(9, 55);             // C5

                } else if (ch === "+" || ch === "=") {
                    // Neutral operators: plain C4
                    this.playSmoothed(5, 60, false);    // C4

                } else if (ch === "/" || ch === "\\") {
                    // Slash: quick ascending glide C4→E4
                    this.playDirect(5, 40);
                    this.playDirect(6, 40);

                } else if (ch === "<" || ch === ">") {
                    // Angle brackets: descending two-note G4→E4
                    this.playDirect(7, 50);
                    this.playDirect(6, 50);

                } else if (ch === "_") {
                    // Underscore: low sustained G3 (like a bass note)
                    this.playSmoothed(3, 100, false);

                } else if (ch === "^" || ch === "~") {
                    // Caret / tilde: gentle wobble G4→A4
                    this.playDirect(7, 50);
                    this.playDirect(8, 50);

                } else if (ch === "`") {
                    // Backtick: short low C3 accent
                    this.playDirect(1, 40);

                } else if (ch === "\"") {
                    // Double quote: two-note A4→A5 (opening/closing emphasis)
                    this.playDirect(8, 50);
                    this.playDirect(12, 50);

                } else if (ch === " ") {
                    // Word boundary: rest + drift toward A4
                    this.driftToNeutral(0.3);
                    music.rest(RoboVoice.DUR_REST);

                } else {
                    // Any remaining printable ASCII: neutral C4 tap
                    this.playSmoothed(5, 55, false);
                }
            }
        }

        /**
         * Translate a plain text string into ITU morse code notation.
         *
         * Output format:
         *   - Letters/digits are encoded as sequences of '.' and '-'.
         *   - Codes within a word are separated by a single space.
         *   - Words are separated by '  ' (double space).
         *   - Unrecognised characters are silently skipped.
         *
         * Example:
         *   toMorse("SOS")        → "... --- ..."
         *   toMorse("Hello")      → ".... . .-.. .-.. ---"
         *   toMorse("Hi 73")      → ".... ..  --... ...--"
         *
         * @param text  Plain text to encode (case-insensitive).
         * @returns     Morse code string ready to pass to morse() or talk().
         */
        public static toMorse(text: string): string {
            // ITU morse code table (A-Z, 0-9, common punctuation)
            // prettier-ignore
            const TABLE: { [ch: string]: string } = {
                "a": ".-", "b": "-...", "c": "-.-.", "d": "-..",
                "e": ".", "f": "..-.", "g": "--.", "h": "....",
                "i": "..", "j": ".---", "k": "-.-", "l": ".-..",
                "m": "--", "n": "-.", "o": "---", "p": ".--.",
                "q": "--.-", "r": ".-.", "s": "...", "t": "-",
                "u": "..-", "v": "...-", "w": ".--", "x": "-..-",
                "y": "-.--", "z": "--..",
                "0": "-----", "1": ".----", "2": "..---", "3": "...--",
                "4": "....-", "5": ".....", "6": "-....", "7": "--...",
                "8": "---..", "9": "----.",
                ".": ".-.-.-", ",": "--..--", "?": "..--..",
                "!": "-.-.--", "/": "-..-.", "-": "-....-",
                "(": "-.--.", ")": "-.--.-", "&": ".-...",
                ":": "---...", ";": "-.-.-.", "=": "-...-",
                "+": ".-.-.", "_": "..--.-", "\"": ".-..-.",
                "$": "...-..-", "@": ".--.-.", "'": ".----."
            };

            const words = text.toLowerCase().split(" ");
            const encodedWords: string[] = [];

            for (let w = 0; w < words.length; w++) {
                const word = words[w];
                const encodedChars: string[] = [];
                for (let c = 0; c < word.length; c++) {
                    const code = TABLE[word.charAt(c)];
                    if (code) encodedChars.push(code);
                }
                if (encodedChars.length > 0) {
                    encodedWords.push(encodedChars.join(" "));
                }
            }

            // Words joined by double space (ITU word gap marker)
            return encodedWords.join("  ");
        }

        /**
         * Detect whether a string is a morse code sequence.
         * A morse string contains only '.', '-', '/', ' ', and newline.
         * Must contain at least one '.' or '-' to qualify.
         */
        public static isMorse(text: string): boolean {
            let hasMorse = false;
            for (let i = 0; i < text.length; i++) {
                const ch = text.charAt(i);
                if (ch === "." || ch === "-") {
                    hasMorse = true;
                } else if (ch !== "/" && ch !== " " && ch !== "\n" && ch !== "\r") {
                    return false;  // non-morse character found
                }
            }
            return hasMorse;
        }

        /**
         * Play a morse code string using ITU-standard timing ratios.
         *
         * Timing (1 unit = unitMs, default 80ms):
         *   '.'  dit  → A5 tone for 1 unit
         *   '-'  dah  → A5 tone for 3 units
         *   (between symbols in same letter) → 1 unit rest
         *   '/'  or single ' ' (letter gap) → 3 unit rest
         *   '  ' double space (word gap)    → 7 unit rest
         *
         * Example: "... --- ..." plays SOS.
         * Example: ".--.--.".   plays a pattern directly.
         *
         * @param code  Morse string of '.', '-', '/', ' ' characters.
         * @param unitMs  Duration of one dit in milliseconds (default 80).
         */
        public morse(code: string, unitMs: number = 80): void {
            const DIT = unitMs;          // 1 unit
            const DAH = unitMs * 3;      // 3 units
            const SYM = unitMs;          // inter-symbol gap (1 unit)
            const LET = unitMs * 3;      // inter-letter gap (3 units)
            const WRD = unitMs * 7;      // inter-word gap (7 units)
            const FREQ = 880;             // A5 — classic morse tone

            let i = 0;
            while (i < code.length) {
                const ch = code.charAt(i);

                if (ch === ".") {
                    music.playTone(FREQ, DIT);
                    // inter-symbol rest unless next char is a letter boundary
                    const next = i + 1 < code.length ? code.charAt(i + 1) : "";
                    if (next === "." || next === "-") music.rest(SYM);
                    i++;

                } else if (ch === "-") {
                    music.playTone(FREQ, DAH);
                    const next = i + 1 < code.length ? code.charAt(i + 1) : "";
                    if (next === "." || next === "-") music.rest(SYM);
                    i++;

                } else if (ch === "/") {
                    // explicit letter/word separator
                    music.rest(LET);
                    i++;

                } else if (ch === " ") {
                    // single space = letter gap, double space = word gap
                    if (i + 1 < code.length && code.charAt(i + 1) === " ") {
                        music.rest(WRD);
                        i += 2;  // consume both spaces
                    } else {
                        music.rest(LET);
                        i++;
                    }

                } else {
                    i++;  // skip unrecognised characters
                }
            }
        }

        /**
         * Smart dispatcher: plays morse if the text looks like a morse sequence,
         * otherwise plays it as a melodic speech utterance via say().
         *
         * @param text  Any string — morse (e.g. "... --- ...") or natural language.
         * @param unitMs  Morse dit duration in ms (ignored for non-morse text).
         */
        public speak(text: string, unitMs: number = 80): void {
            if (RoboVoice.isMorse(text)) {
                this.morse(text, unitMs);
            } else {
                this.say(text);
            }
        }
    }

    /**
     * Kid-friendly action tokens. Used with start(action, steps).
     */
    export enum Action {
        //% block="walk"
        Walk = 0,
        //% block="walk backward"
        WalkBackward,
        //% block="turn left"
        TurnLeft,
        //% block="turn right"
        TurnRight,
        //% block="explore"
        Explore,
        //% block="dance"
        Dance,
        //% block="rest"
        Rest,
        //% block="sit"
        Sit,
        //% block="stand"
        Stand,
        //% block="kick"
        Kick,
        //% block="jump"
        Jump,
        //% block="laugh"
        Laugh,
        //% block="cry"
        Cry,
        //% block="scream"
        Scream,
        //% block="funny"
        Funny,
        //% block="blink"
        Blink,
        //% block="greet"
        Greet,
        //% block="stop"
        Stop
    }

    /**
     * RobotPu Class for MakeCode
     * Optimized with internal PCB and Parameters instances.
     */
    export class RobotPu {
        // Component Instances
        public pr: Parameters;
        public pcb: PCB;
        public sonar: HCSR04;
        public np: neopixel.Strip;
        public content: Content;
        public music: MusicLib;
        public odom: Odometry;
        public voice: RoboVoice;

        // Basic identification
        public name: string;
        public sn: string;
        public gst: number;

        // Movement & State
        public lastCmdTS: number;
        private fwdSpeed: number = 3;
        private bwdSpeed: number = -2;
        public walkSpeed: number = 0;
        public walkDirection: number = 0;
        private headPitchBias: number = 0;
        private headYawBias: number = 0;
        private alertLevel: number = 10;
        private alertScale: number = 0.9;
        private restState: number = 26;
        private sleepPoweredDown: boolean = false;

        // IMU & Balance
        private bodyPitch: number = 0;
        private bodyPitch2: number = 0;
        private bodyRoll: number = 0;
        private bodyRoll2: number = 0;
        private pth: number = 0;
        private rl: number = 0;
        private maxG: number = 1.0;
        private gThreshold: number = 2000;

        // State Tracking
        private fellCount: number = 0;
        private lastState: number = 0;
        private radioGroupID: number = 166;
        private trimIndex: number = 0;

        // Current dance state (sequence of state indices)
        private danceState: number[] = [0];

        // Predefined dance routines
        private danceDict: { [key: number]: number[] } = {
            14: [0, 15, 15, 0, 3, 5, 3],  // Forward-backward movement
            0: [0, 19, 0, 18, 0, 3],      // Side-to-side movement
            5: [3, 5, 2, 5, 3],           // Quick steps
            16: [17, 16, 17, 16, 17]      // Rocking motion
        };

        private danceSpeed: number = 1.0;           // Dance speed multiplier
        private lastLowBeat: number = 0;       // Timestamp of last low beat
        private lastHighBeat: number = 0;      // Timestamp of last high beat
        private danceYawWiggle: number = 12;     // Left/right wiggle angle (degrees)
        private dancePitchWiggle: number = 15;     // Up/down wiggle angle (degrees)

        // Balance & Tilt Offsets
        private leftTiltOffset: number = 0;         // Left tilt offset
        private rightTiltOffset: number = 0;         // Right tilt offset
        private maxRollCtrl: number = 15.0; // Max roll control authority

        /** Current exploration direction bias (-1.0 to 1.0) */
        private exploreDirection: number = 0.0;

        /** Current exploration speed command */
        private exploreSpeed: number = 0.0;

        /** Smoothed steering command for heading hold (-1.0 to 1.0) */
        private headingDirection: number = 0.0;

        private headingPid: PID = new PID();

        /** Index in the ep_dis array representing the clearest path */
        private epMaxI: number = 0;

        /** Distance threshold: Consider an obstacle "hit" if closer than this (cm) */
        private exploreDangerDistance: number = 6.8;

        /** Tilt offset applied during exploration maneuvers */
        private epOt: number = 0;

        /** Far threshold: Begin slowing down or planning turns if obstacle is within this (cm) */
        private exploreCautionDistance: number = 20;

        // Command Dictionary
        public cmdFuncDict: { [key: string]: (v: number) => void };
        // Define the State Dictionary
        private stateFuncDict: { [key: number]: () => void };
        // Action handlers for the unified action dispatcher (see startAction).
        // New actions can be added at runtime with registerAction().
        private actionFuncDict: { [key: number]: () => number };

        // beacon timeout
        public beaconTimeout: number = 2000;

        private lastLeftLegAngle: number = 0;
        private lastRightLegAngle: number = 0;

        // Action-token state for start/stop/isDone
        public currentAction: Action = Action.Stop;
        public lastAction: Action = Action.Stop;
        public actionDone: boolean = true;
        public actionRunning: boolean = false;

        constructor(sn: string, name: string = "peu") {
            // Initialize Core Components inside constructor
            this.pr = new Parameters();
            this.pcb = new PCB();

            this.sn = sn;
            this.name = name;
            this.gst = 0;
            this.lastCmdTS = control.millis();
            this.readConfig();

            // Hardware Setup
            this.sonar = new HCSR04(DigitalPin.P2, DigitalPin.P8);
            this.np = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB);
            this.content = new Content();
            this.music = new MusicLib();
            this.odom = new Odometry(25.0);
            this.voice = new RoboVoice();

            // Audio & Radio Setup
            radio.setGroup(this.radioGroupID);
            music.setVolume(255);

            // Initialize Command Dictionary
            this.cmdFuncDict = {
                "#puspeed": (v) => this.speed(v),
                "#puturn": (v) => this.turn(v),
                "#puroll": (v) => this.roll(v),
                "#pupitch": (v) => this.pitch(v),
                "#puB": (v) => this.button(v),
                "#pulogo": (v) => this.logo(v),
                "#purs": (v) => this.pose(v)
            };
            // We use arrow functions () => to ensure 'this' refers to the RobotPu instance
            this.stateFuncDict = {
                [-4]: () => this.trim(),
                [-3]: () => this.fall(),
                [-2]: () => this.fetal(),
                [0]: () => this.idle(),
                [1]: () => this.explore(),
                [2]: () => this.jump(),
                [3]: () => this.dance(),
                [4]: () => this.kick(),
                [5]: () => this.joystick()
            };

            // Unified action handlers. Extra channels (I2C, Bluetooth, radio)
            // can register additional actions with registerAction().
            this.actionFuncDict = {};
            this.registerAction(Action.Stop, () => { this.rest(); return 0; });
            this.registerAction(Action.Walk, () => { this.walkSpeed = this.fwdSpeed; this.walkDirection = 0; return this.walkItr(); });
            this.registerAction(Action.WalkBackward, () => { this.walkSpeed = this.bwdSpeed; this.walkDirection = 0; return this.walkItr(); });
            this.registerAction(Action.TurnLeft, () => { this.walkSpeed = this.fwdSpeed; this.walkDirection = -0.5; return this.walkItr(); });
            this.registerAction(Action.TurnRight, () => { this.walkSpeed = this.fwdSpeed; this.walkDirection = 0.5; return this.walkItr(); });
            this.registerAction(Action.Explore, () => this.explore());
            this.registerAction(Action.Dance, () => this.dance());
            this.registerAction(Action.Rest, () => this.rest());
            this.registerAction(Action.Kick, () => this.kick());
            this.registerAction(Action.Jump, () => this.jump());
            this.registerAction(Action.Laugh, () => { this.laugh(); return 0; });
            this.registerAction(Action.Cry, () => { this.cry(); return 0; });
            this.registerAction(Action.Scream, () => { this.scream(); return 0; });
            this.registerAction(Action.Funny, () => { this.funny(); return 0; });
            this.registerAction(Action.Blink, () => { this.pcb.blink(this.alertLevel); return 0; });
            this.registerAction(Action.Greet, () => { this.greet(); return 0; });
            this.registerAction(Action.Stand, () => this.stand());
            this.registerAction(Action.Sit, () => this.sit());

            this.pcb.eyesCtl(1);
            this.showChannel();
        }

        public start() {
            this.stand();
            this.resetOdom();
            this.pcb.speakerOff();
        }

        /**
         * Turn the speaker on, run a sound function, then turn it off to save power.
         * @param fn the sound-playing function to run
         */
        private withSpeaker(fn: () => void): void {
            this.pcb.speakerOn();
            fn();
            this.pcb.speakerOff();
        }

        public resetOdom() {
            this.lastLeftLegAngle = this.pcb.servoTarget[1];
            this.lastRightLegAngle = this.pcb.servoTarget[3];
            this.odom.reset();
        }

        public getBodyRoll(): number {
            return this.bodyRoll;
        }

        public getBodyPitch(): number {
            return this.bodyPitch;
        }

        public getMusicPeriod(): number {
            return this.music.period;
        }

        public getMusicTempo(): number {
            const p = this.music.period;
            if (p <= 0) return 0;
            return 60000 / p;
        }

        /**
         * Handles manual movement and stance control from a remote.
         * Ported from joystick() in Python.
         */
        public joystick(): number {
            // 1. If speed is near zero, handle stationary behavior
            if (Math.abs(this.walkSpeed) < 0.1) {
                // Smoothly move the head/body to match bias values
                // Servo 4 is waist/roll, Servo 5 is head/pitch
                this.pcb.servoStep(90 + this.headYawBias, 1, 4);
                this.pcb.servoStep(90 + this.headPitchBias, 1, 5);

                // 2. If the turn stick is pushed far left/right while standing, side-step
                if (Math.abs(this.walkDirection) > 0.9) {
                    return this.sideStep(this.walkDirection);
                }

                // Otherwise, stay in idle stance
                return 0;
                //return this.rest();
            } else {
                // 3. If there is speed, perform the balanced walk
                return this.walk(this.walkSpeed, this.walkDirection);
            }
        }

        /**
         * Executes a side-stepping (lateral) movement using specific state indices.
         * @param di Directional bias: positive for left, negative for right.
         */
        public sideStep(di: number): number {
            // 1. Select the gait state sequence based on direction
            // Python: [20, 22, 0, 19] if walkDirection > 0 else [18, 21, 23, 0]
            let sts = di > 0 ? [20, 22, 0, 19] : [18, 21, 23, 0];

            // 2. Reset the Control Vector to neutral
            // This clears any persistent tilt or pitch offsets
            this.setControlOffsets([0, 1, 2, 3, 4, 5], [0, 0, 0, 0, 0, 0]);

            // 3. Calculate movement speed based on forward speed multiplier
            let movementSpeed = di * this.fwdSpeed * 0.68;

            // 4. Execute the movement via the PCB engine
            // Parameters: states, syncList (0-3), syncSpeed, asyncList (4-5), asyncSpeed
            return this.pcb.move(
                this.pr,
                sts,
                [0, 1, 2, 3],
                movementSpeed,
                [4, 5, 6, 7, 8, 9],
                movementSpeed
            );
        }

        public showChannel() {
            basic.showNumber(this.radioGroupID);
        }

        public readConfig(): void {
            let storedSn = settings.readString("robotpu.sn");
            if (storedSn && storedSn.length > 0) {
                this.sn = storedSn;
            }
            let storedGroup = settings.readNumber("robotpu.group");
            if (!isNaN(storedGroup)) {
                this.radioGroupID = Math.round(storedGroup) % 256;
                if (this.radioGroupID < 0) this.radioGroupID += 256;
            }
            for (let i = 0; i < this.pr.dof; i++) {
                let v = settings.readNumber("robotpu.trim." + i);
                if (!isNaN(v)) {
                    this.pcb.servoTrim[i] = v;
                }
            }
        }

        public writeConfig(): void {
            settings.writeString("robotpu.sn", this.sn);
            settings.writeNumber("robotpu.group", this.radioGroupID);
            for (let i = 0; i < this.pcb.dof; i++) {
                settings.writeNumber("robotpu.trim." + i, this.pcb.servoTrim[i]);
            }
        }

        public talk(text: string): void {
            this.withSpeaker(() => {
                this.voice.reset();
                this.voice.speak(text);
            });
        }


        /**
         * Play a laughing sound effect. Call it when Robot PU feels happy
         */
        public laugh(): void {
            this.pcb.speakerOn();
            let count = 2 + Math.random() * 3;
            for (let index = 0; index < count; index++) {
                music.setVolume(255 - index * 30)
                music.play(music.createSoundExpression(
                    WaveShape.Sawtooth,
                    250 + Math.random() * 10,
                    700 + Math.random() * 10,
                    245 + Math.random() * 10,
                    50 + Math.random() * 10,
                    120 + Math.random() * 50, SoundExpressionEffect.Tremolo, InterpolationCurve.Curve), music.PlaybackMode.UntilDone)
                basic.pause(60 + Math.random() * 10)
            }
            this.pcb.speakerOff();
        }

        /**
         * Play a crying sound effect. Call it when Robot PU feels sad
         */
        public cry(): void {
            this.pcb.speakerOn();
            let count = 3 + Math.random() * 3;
            for (let i = 0; i < count; i++) {
                music.setVolume(Math.min(255, 125 + i * 40))
                music.play(
                    music.createSoundExpression(
                        WaveShape.Square,
                        500 + Math.random() * 10,    // start frequency
                        180 + Math.random() * 10,    // end frequency (drop down)
                        245 + Math.random() * 10,    // start volume
                        60 + Math.random() * 10,     // end volume (fade out)
                        400 + Math.random() * 200,    // duration (ms)
                        SoundExpressionEffect.Vibrato,
                        InterpolationCurve.Curve
                    ),
                    music.PlaybackMode.UntilDone
                )
                basic.pause(120 + Math.random() * 10)
            }
            this.pcb.speakerOff();
        }

        /**
         * Play a funny sound effect. Call it when Robot PU feels funny
         */
        public funny(): void {
            this.pcb.speakerOn();
            music.setVolume(255)
            music.play(music.createSoundExpression(
                WaveShape.Sawtooth,
                100 + Math.random() * 50,
                1000 + Math.random() * 10,
                245 + Math.random() * 10,
                27 + Math.random() * 10,
                2000 + Math.random() * 1000,
                SoundExpressionEffect.Tremolo,
                InterpolationCurve.Curve
            ), music.PlaybackMode.UntilDone)
            this.pcb.speakerOff();
        }

        /**
         * Play a screaming sound effect. Call it when Robot PU gets suprised
         */
        public scream(): void {
            this.pcb.speakerOn();
            music.setVolume(255)
            // weeweee
            music.play(
                music.createSoundExpression(
                    WaveShape.Sawtooth,
                    50 + Math.random() * 10,
                    1500 + Math.random() * 50,
                    235 + Math.random() * 20,
                    235 + Math.random() * 20,
                    300 + Math.random() * 100,
                    SoundExpressionEffect.Tremolo,
                    InterpolationCurve.Curve
                ),
                music.PlaybackMode.UntilDone
            );
            // WEEEEEEE
            music.play(
                music.createSoundExpression(
                    WaveShape.Sawtooth,
                    1200 + Math.random() * 30,
                    2500 + Math.random() * 50,
                    245 + Math.random() * 10,
                    245 + Math.random() * 10,
                    800 + Math.random() * 400,
                    SoundExpressionEffect.Tremolo,
                    InterpolationCurve.Curve
                ),
                music.PlaybackMode.UntilDone
            );
            this.pcb.speakerOff();
        }

        /*
            Walk with speed and direction which set internally
         */
        public walkItr(): number {
            return this.walk(this.walkSpeed, this.walkDirection);
        }

        /**
         * Generic action-step loop. Runs `run` until it returns 0 the requested
         * number of times. If completions is 0, it runs until the mode is no
         * longer API (i.e. stop() was called).
         */
        public doCompletions(run: () => number, completions: number): void {
            let done = 0;
            while ((completions <= 0 || done < completions) && this.gst == 6) {
                const rc = run();
                if (rc == 0) done += 1;
                this.lastCmdTS = control.millis();
                basic.pause(20);
            }
            this.actionDone = true;
            this.actionRunning = false;
            this.currentAction = Action.Stop;
        }

        /**
         * Register a custom action handler. The handler must return 0 when one
         * execution completes (or a non-zero status while still working on it).
         * Extra channels (I2C, Bluetooth, radio) and MakeCode extensions can add
         * new actions at runtime without touching the built-in set.
         * @param action the Action token (or any unique index) to register
         * @param run the handler function
         */
        public registerAction(action: Action, run: () => number): void {
            this.actionFuncDict[action] = run;
        }

        /**
         * Look up the handler for an Action token. Unknown actions run a no-op.
         */
        private actionRunner(action: Action): () => number {
            const run: (() => number) | undefined = this.actionFuncDict[action];
            return run === undefined ? () => 0 : run;
        }

        /**
         * Start an action token for a number of completions/steps.
         * Use 0 steps to keep it running until stop() is called.
         */
        public startAction(action: Action, steps: number): void {
            this.stopAction();
            this.gst = 6; // Mode.API
            this.currentAction = action;
            this.actionDone = false;
            this.actionRunning = true;
            this.lastCmdTS = control.millis();
            const run = this.actionRunner(action);
            control.runInParallel(() => {
                this.doCompletions(run, steps);
            });
            this.lastAction = action;
        }

        /**
         * Stop the current action and reset to rest/idle.
         */
        public stopAction(): void {
            this.gst = 0; // Rest/Idle
            this.walkSpeed = 0;
            this.walkDirection = 0;
            this.actionDone = true;
            this.actionRunning = false;
            this.lastAction = Action.Stop;
            this.currentAction = Action.Stop;

        }

        /**
         * Check if an action has finished (or was stopped).
         */
        public isActionDone(action: Action): boolean {
            return this.actionDone && this.lastAction == action;
        }

        /**
         * Triggers the balanced walking gait. Compute odometry for SLAM
         * @param sp Speed (positive for forward, negative for backward)
         * @param di Directional bias (-1.0 to 1.0)
         */
        public walk(sp: number, di: number): number {
            let ret = this.moveBalance(sp, di, this.pr.walkFwdStates, this.pr.walkBwdStates);
            if (ret == 0) {
                if (this.pcb.lastPos == 1) { // update left step odometry
                    this.odom.leftStep(this.pcb.servoTarget[1] - this.lastLeftLegAngle);
                    this.lastLeftLegAngle = this.pcb.servoTarget[1];
                    this.lastRightLegAngle = this.pcb.servoTarget[3];
                } else if (this.pcb.lastPos == 3) { // update right step odometry
                    this.odom.rightStep(this.pcb.servoTarget[3] - this.lastRightLegAngle);
                    this.lastLeftLegAngle = this.pcb.servoTarget[1];
                    this.lastRightLegAngle = this.pcb.servoTarget[3];
                }
                this.odom.pedometer += 1;
            }
            return ret;
        }

        /**
         * IMU Balance Calculations using this.pr and this.pcb
         */
        private balanceParam() {
            let ax = input.acceleration(Dimension.X);
            let ay = input.acceleration(Dimension.Y);
            let az = input.acceleration(Dimension.Z);

            this.maxG = Math.sqrt(ax * ax + ay * ay + az * az);
            this.pth = Math.atan2(ay, -az) * (180 / Math.PI);
            this.rl = Math.asin(ax / (this.maxG || 1)) * (180 / Math.PI);

            // Use this.pr and this.pcb for calculations
            let bd_p = this.pth + (this.pr.stateTargets[0][5] - this.pcb.servoTarget[5]);
            let servo_yaw = (this.pcb.servoTarget[4] - this.pr.stateTargets[0][4]) * (Math.PI / 180);
            // let servo_pitch = (this.pcb.servoTarget[5] - this.pr.stateTargets[0][5]) * (Math.PI / 180);

            this.bodyRoll = bd_p * Math.sin(servo_yaw) + this.rl * Math.cos(servo_yaw);
            this.bodyRoll2 = (this.bodyRoll + 9 * this.bodyRoll2) * 0.1;

            this.bodyPitch = bd_p * Math.cos(servo_yaw) - this.rl * Math.sin(servo_yaw);
            this.bodyPitch2 = (this.bodyPitch + 9 * this.bodyPitch2) * 0.1;
        }

        public setControlOffsets(indexList: number[], valueList: number[]) {
            let le = Math.min(indexList.length, valueList.length);
            for (let i = 0; i < le; i++) {
                this.pcb.servoCtrl[indexList[i]] = valueList[i]; // Reference internal pr
            }
        }

        public incrementControlOffsets(indexList: number[], valueList: number[], gain = 1.0) {
            let le = Math.min(indexList.length, valueList.length);
            for (let i = 0; i < le; i++) {
                this.pcb.servoCtrl[indexList[i]] += valueList[i] * gain; // Reference internal pr
            }
        }

        public moveBalance(sp: number, di: number,
            forwardStates: number[], backwardStates: number[]) {
            let sts = sp > 0 ? forwardStates : backwardStates;
            this.balanceParam();

            let leftTiltOffset = 0;
            let rightTiltOffset = 0;
            let lf = 0;

            if (this.pcb.pos < 2 || this.pcb.pos == 6) { // Reference internal PCB
                leftTiltOffset = Math.min(this.maxRollCtrl, Math.max(0.0, this.bodyRoll * 0.8 - this.pr.walkTilt));
                lf = -12 * di;
            } else {
                rightTiltOffset = Math.max(-this.maxRollCtrl, Math.min(0.0, this.bodyRoll * 0.8 + this.pr.walkTilt));
                lf = 12 * di;
            }

            let tiltOffset = leftTiltOffset + rightTiltOffset;
            sp /= 1.0 + 0.01 * (Math.abs(this.bodyRoll) + Math.abs(this.bodyPitch)) + Math.sqrt(Math.abs(tiltOffset * 0.5));

            this.setControlOffsets([0, 1, 2, 3, 4, 5],
                [tiltOffset, lf - tiltOffset, tiltOffset, -lf - tiltOffset, -40 * di - tiltOffset, Math.min(25.0, -2.0 * this.bodyPitch2)]);

            // Call internal servo move
            return this.pcb.move(this.pr, sts, [0, 1, 2, 3], sp, [4, 5, 6, 7, 8, 9], sp);
        }

        /**
         * Update robot states based on sensor inputs.
         * Ported from set_states() in Python.
         */
        public updateStates(): void {
            // 1. Fall detection using Accelerometer
            if (input.isGesture(Gesture.FreeFall)) {
                this.gst = -2; // Enter fall state
            }

            // 2. Handle automatic state transitions (Inactivity Timeout)
            if (this.gst > 0) { // If in an active state
                this.alertLevel = 10; // Reset alert level
                // 2-second timeout to return to idle
                if (control.millis() - this.lastCmdTS > this.beaconTimeout) {
                    this.gst = 0;
                }
            }

            // 3. Balance monitoring and recovery logic
            if (this.gst != -2) { // If not in protective fetal position
                // Check tilt thresholds (equivalent to bodyRoll2/bodyPitch2 in Python)
                if (Math.abs(this.bodyRoll2) > 75 || Math.abs(this.bodyPitch2) > 75) {
                    this.balanceParam(); // Recalculate IMU data
                    this.fellCount++;
                    this.pcb.numSteps = 0; // Reset step count on fall

                    if (this.fellCount > 16) {
                        this.gst = -3; // Enter "Help me" recovery state
                    }
                } else {
                    this.fellCount = 0;
                    // Return to previous state after standing up
                    if (this.gst == -3) {
                        this.gst = this.lastState;
                        this.talk("Thanks");
                    }
                }
            }
        }

        // Behavior States
        private idle() {
            if (Math.randomRange(0, 100) == 0) this.alertLevel *= this.alertScale;
            this.rest();
        }

        public rest(): number {
            this.balanceParam();
            for (let i = 0; i < this.pr.dof; i++) {
                this.pcb.servoCtrl[i] *= 0.99;
            }
            let rl = Math.min(35.0, Math.max(-35.0, this.bodyRoll2));
            if (Math.abs(rl) > 5) {
                this.setControlOffsets([0, 1, 2, 3, 4], [rl, rl * -1.0, rl, rl * -1.0, rl * -0.5]);
            }
            if (Math.abs(this.bodyPitch2) > 10) {
                this.setControlOffsets([5], [-this.bodyPitch2]);
            }
            let sl = input.soundLevel();
            this.pr.stateTargets[this.restState][5] = 90 - sl * 0.15;
            return this.pcb.move(this.pr, [this.restState], [0, 1, 2, 3, 4, 5], 1 + sl * 0.001,
                [6, 7, 8, 9], 0.5);
        }

        public trim(): void {
            this.pcb.servoMove(this.pr.stateTargets[25]);
        }

        /**
         * Handles the robot's behavior when it has fallen and cannot recover.
         * Ported from fall() in Python.
         */
        public fall(): void {
            // 1. Trigger the "Knight Rider" style eye flash effect
            this.pcb.flash();

            // 2. Randomly trigger a voice request for help (approx 1 in 500 cycles)
            if (Math.randomRange(0, 500) == 0) {
                // Use pxt-billy to speak the distress message
                this.talk("Help me stand up!");

                // 3. Publish a status code via radio for remote monitoring
                this.sendStatusCode("E2");
            }
        }

        /**
         * Set the robot to a compact fetal position for protection or power saving.
         * Ported from fetal() in Python.
         */
        public fetal(): void {
            // 1. Trigger the eye pulsing animation
            this.pcb.flash();

            // 2. 0.5% chance to shout for help (random.randint(0, 200) == 0)
            if (Math.randomRange(0, 200) == 0) {
                this.talk("Help me!");
            }

            // 3. Move to the Fetal State (Index 1)
            // states: [1], syncList: all servos [0-5], speed: 2.0, asyncList: none, asyncSp: 0.5
            this.pcb.move(this.pr, [1], [0, 1, 2, 3, 4, 5], 2.0, [6, 7, 8, 9], 0.5);
        }

        /**
         * Publishes a status or error code via radio.
         * @param code The status/error code string (e.g., "E2", "OK", "BATT").
         */
        public sendStatusCode(code: string): void {
            // 1. Construct the message string
            // Python equivalent: f"#puc:{self.sn}:{code}"
            let message = "#puc:" + this.sn + ":" + code;

            // 2. Send the message over the radio
            // This will be received by anything on the same radio group ID
            radio.sendString(message);
        }

        public s_code(code: string): void {
            this.sendStatusCode(code);
        }

        /**
         * Calculates exploration speed and direction based on sonar point-cloud.
         * Ported from set_explore_param() in Python.
         */
        private setExploreParam(): void {
            // 1. Check for obstacles in the "middle" view of the point cloud
            let mid_view = [this.pr.exploreDistance[this.pr.exploreMid1], this.pr.exploreDistance[this.pr.exploreMid2]];
            let obs_hcsr = Math.min(mid_view[0], mid_view[1]);

            let nd = 0; // New Direction variable

            // 2. Decision Logic based on distance thresholds
            if (obs_hcsr > this.exploreDangerDistance + this.exploreCautionDistance) {
                // Path is getting wide open: Look only at middle indices for turn direction
                // Python slice [mid1 : mid2+1]
                let slice = this.pr.exploreDistance.slice(this.pr.exploreMid1, this.pr.exploreMid2 + 1);
                nd = this.getTurnFromSonar(slice, 3);
            } else {
                // Path is clear: Look at the whole point cloud for a better direction
                nd = this.getTurnFromSonar(this.pr.exploreDistance, 5);
            }

            // 3. Overall minimum distance check
            obs_hcsr = Math.min(this.pr.exploreDistance[0], Math.min(this.pr.exploreDistance[1], Math.min(this.pr.exploreDistance[2], this.pr.exploreDistance[3])));
            let dis = obs_hcsr - this.exploreDangerDistance;

            // 4. Handle "Stuck" logic (if speed is negative)
            if (this.exploreSpeed < 0) {
                // Turn aggressively to escape the corner
                nd = nd > 0 ? 1 : -1;
                this.exploreDirection = (this.exploreDirection * 9 + nd) * 0.1; // Slow smoothing for escape

                dis -= 10 + Math.randomRange(-5, 0);

                // Low probability to shout for help via radio
                if (Math.randomRange(0, 400) == 0) {
                    this.talk(this.content.sentences[5]);
                    this.sendStatusCode("W1"); // Send Warning Code 1
                }
            } else {
                // Normal direction smoothing (Low pass filter)
                this.exploreDirection = (this.exploreDirection * 3 + nd) * 0.25;
            }

            // 5. Apply Low-pass filter to Speed
            let target_sp = 0;
            if (dis >= 0) {
                target_sp = Math.min(this.fwdSpeed, (dis + 5));
            } else {
                target_sp = Math.max(this.bwdSpeed, (dis - 5) * 0.6);
            }
            this.exploreSpeed = (this.exploreSpeed + target_sp) * 0.5;
        }

        /**
         * Map sonar distance readings to a steering direction for auto-pilot.
         * @param distances List of sonar distance readings from left to right
         * @param turnGain Scaling factor for turn intensity (default: 1.5)
         * @returns Steering direction between -1.0 (right) and 1.0 (left)
         */
        public getTurnFromSonar(distances: number[], turnGain: number = 1.5): number {
            // 1. Guard against empty arrays
            if (distances.length == 0) {
                return 0.0;
            }

            // 2. Calculate the total weight (total distance)
            let tw = 0;
            for (let d of distances) {
                tw += d;
            }

            // 3. If everything is zero (no readings), go straight
            if (tw == 0) {
                return 0.0;
            }

            // 4. Calculate Center of Mass (CM)
            let weighted_sum = 0;
            let count = distances.length;

            for (let i = 0; i < count; i++) {
                // Calculate normalized position from -1 (left) to 1 (right)
                // Python: i * 2 / (len(ep_dis) - 1) - 1
                let pos = (count > 1) ? (i * 2 / (count - 1) - 1) : 0;

                // Add weighted position to the sum
                weighted_sum += distances[i] * pos;
            }

            let cm = weighted_sum / tw;

            // 5. Apply turn gain and clamp between -1.0 and 1.0
            let d = cm * turnGain;
            return Math.max(-1.0, Math.min(1.0, d));
        }


        public sonarScan(): void {
            let targetIndex = this.pcb.pos < 2 ? 1 : 3;
            let angleValue = this.pcb.servoTarget[targetIndex];

            let distanceIndex = angleValue > 110 ? 0 :
                angleValue > 90 ? 1 :
                    angleValue > 70 ? 2 : 3;

            let currentSonar = this.sonar.distanceCm();
            this.pr.exploreDistance[distanceIndex] = (this.pr.exploreDistance[distanceIndex] + currentSonar) * 0.5;
        }

        /**
         * Autonomous exploration with obstacle point-cloud mapping.
         * Updates the distance array and adjusts movement parameters.
         */
        public explore(): number {
            this.sonarScan();

            // 4. Update the exploration speed (exploreSpeed) and direction (exploreDirection)
            this.setExploreParam();

            // 5. Execute the walk using exploration parameters
            return this.walk(this.exploreSpeed, this.exploreDirection);
        }

        /**
         * Walks to a target compass heading while maintaining obstacle avoidance.
         */
        public walkByCompass(targetHeadingDeg: number, kp: number = 0.02, maxDi: number = 1.0): number {
            // Keep the point-cloud updated so obstacle avoidance stays responsive.
            this.sonarScan();
            this.setExploreParam();
            let h = input.compassHeading();

            // Normalize heading to [0, 359] so the shortest-error math works even with out-of-range inputs.
            let th = Math.floor(targetHeadingDeg) % 360;
            if (th < 0) th += 360;

            let err = ((th - h + 540) % 360) - 180;

            let diCmd = kp * err + 0.5 * this.exploreDirection;
            if (diCmd > maxDi) diCmd = maxDi;
            if (diCmd < -maxDi) diCmd = -maxDi;

            this.headingDirection = (this.headingDirection * 3 + diCmd) * 0.25;

            return this.walk(this.exploreSpeed * 2, this.headingDirection);
        }

        public walkByCompassPID(targetHeadingDeg: number, kp: number = 0.02, ki: number = 0.0005, kd: number = 0.0, maxDi: number = 1.0, integralLimit: number = 0.0, resetPid: boolean = false): number {
            if (resetPid) this.headingPid.reset();
            this.headingPid.setGains(kp, ki, kd);

            this.sonarScan();
            this.setExploreParam();

            let h = input.compassHeading();

            let th = Math.floor(targetHeadingDeg) % 360;
            if (th < 0) th += 360;

            let err = ((th - h + 540) % 360) - 180;

            let pidOut = this.headingPid.update(err, control.millis(), integralLimit);

            let diCmd = pidOut + 0.5 * this.exploreDirection;
            if (diCmd > maxDi) diCmd = maxDi;
            if (diCmd < -maxDi) diCmd = -maxDi;

            this.headingDirection = (this.headingDirection * 3 + diCmd) * 0.25;

            return this.walk(this.exploreSpeed * 2, this.headingDirection);
        }

        /**
         * Executes a specific jumping sequence and manages the auxiliary jump servo.
         * Ported from jump() in Python.
         */
        public jump(): number {
            // 1. Execute the move sequence
            // states: [24, 14, 0, 0]
            // sync_servos (legs): [0, 1, 2, 3] at speed 3
            // async_servos (waist/head): [4, 5] at speed 2
            let md = this.pcb.move(this.pr, [24, 14, 0, 0], [0, 1, 2, 3, 6, 7, 8, 9], 3, [4, 5], 2);

            // 2. Check if move completed (md == 0) and gait is at the end (pos == 3)
            if (md == 0 && this.pcb.pos == 3) {
                // Transition to Joystick/Manual state
                this.gst = 5;
            }

            return md;
        }

        /**
         * Executes a kick by accelerating the forward walking gait.
         * Returns to joystick mode when the kick completes at specific gait positions.
         */
        public kick(): number {
            // 1. Execute the forward walk states at high speed
            // legs: [0, 1, 2, 3] at speed 3, body/head: [4, 5] at speed 2
            let md = this.pcb.move(
                this.pr,
                this.pr.boxingStates,
                [0, 1, 2, 3],
                3,
                [4, 5, 6, 7, 8, 9],
                2
            );

            // 2. Check if the movement step is finished (md == 0)
            // and ensure the gait has reached index 0 or 2 (strike positions)
            if (md == 0 && (this.pcb.pos == 0 || this.pcb.pos == 2 || this.pcb.pos >= this.pr.boxingStates.length)) {
                // Switch back to Joystick/Manual control state
                this.gst = 5;
            }

            return md;
        }

        /**
         * Set the robot to a neutral standing position.
         * Ported from stand() in Python.
         */
        public stand(): number {
            // 1. Execute transition to neutral state (Index 0)
            // states: [0]
            // syncList: all servos [0, 1, 2, 3, 4, 5]
            // syncSpeed: 2.0 (moderate speed)
            // asyncList: [] (none)
            // asyncSpeed: 0.5
            return this.pcb.move(
                this.pr,
                [0],
                [0, 1, 2, 3, 4, 5],
                2.0,
                [6, 7, 8, 9],
                0.5
            );
        }


        /**
         * Set the robot to a neutral standing position.
         * Ported from stand() in Python.
         */
        public sit(): number {
            // 1. Execute transition to neutral state (Index 0)
            // states: [0]
            // syncList: all servos [0, 1, 2, 3, 4, 5]
            // syncSpeed: 2.0 (moderate speed)
            // asyncList: [] (none)
            // asyncSpeed: 0.5
            return this.pcb.move(
                this.pr,
                [15],
                [0, 1, 2, 3, 4, 5],
                2.0,
                [6, 7, 8, 9],
                0.5
            );
        }


        /**
         * Monitors sensors to determine if the robot should exit sleep mode.
         * @returns 1 if the robot should wake up, 0 otherwise.
         */
        public checkWakeup(): number {
            // 1. Calculate tilt deltas (current vs filtered)
            let roll_delta = Math.abs(this.bodyRoll - this.bodyRoll2);
            let pitch_delta = Math.abs(this.bodyPitch - this.bodyPitch2);

            // 2. Check for "Wake Up" triggers:
            // - High acceleration (maxG > gThreshold)
            // - Loud sound detected
            // - Sudden tilt change > 20 degrees
            if (this.maxG > this.gThreshold ||
                input.soundLevel() > 128 || // Check if sound level is "loud" (0-255)
                roll_delta > 20 ||
                pitch_delta > 20) {

                this.alertLevel = 10; // Reset alert level to max
                return 1;        // Signal wake up
            }

            // 3. If alert level reaches 0, enter deeper sleep (state -1)
            if (this.alertLevel < 1) {
                this.gst = -1;
            }

            return 0; // Remain asleep
        }

        /**
         * Puts the robot into a low-power standby mode.
         * Ported from sleep() in Python.
         */
        public sleepMode(): void {
            // 1. Check for wake-up triggers first
            if (this.checkWakeup() == 1) {
                // Return to Idle/Standby state
                this.gst = 0;
                if (this.sleepPoweredDown) {
                    this.pcb.setServoPower(true);
                    this.sleepPoweredDown = false;
                }
                this.talk("I am awake"); // Optional feedback
                return;
            }

            // 2. Enter low-power sleep if not already powered down
            if (!this.sleepPoweredDown) {
                // Refresh IMU data and return to a neutral standing pose
                this.balanceParam();
                this.stand();

                // Turn off the 5x5 LED matrix eyes
                this.pcb.eyesCtl(0);

                // Clear the NeoPixel strip to save battery
                this.np.clear();
                this.np.show();

                // Turn servo power off to save power
                this.pcb.setServoPower(false);

                this.sleepPoweredDown = true;
            }
        }

        /**
         * Main state machine for robot behavior control.
         * Processes the current state (gst) and executes the corresponding behavior.
         */
        public stateMachine(): void {
            // 1. Execute the current state's behavior
            // Python: self.stateFuncDict.get(self.gst, self.sleep)()
            let behavior = this.stateFuncDict[this.gst];
            if (behavior) {
                behavior();
            }

            // 2. Handle blinking and state tracking
            if (this.gst >= 0 && this.gst <= 5) {
                // Update eye blink animation based on alert level (alertLevel)
                this.pcb.blink(this.alertLevel);

                // Remember last normal state for recovery (e.g., after a fall)
                this.lastState = this.gst;
            }
        }
        /**
         * Sing a note sequence string using the built-in music engine.
         * @param s The note sequence string, e.g. "C5 D E F G".
         */
        public sing(s: string): void {
            this.withSpeaker(() => {
                music.play(music.stringPlayable(s, 120), music.PlaybackMode.UntilDone);
            });
        }

        /**
         * Play a morse code string using ITU-standard timing.
         * @param code morse code string to play, e.g. "... --- ...".
         * @param unitMs duration of one dit in milliseconds.
         */
        public morse(code: string, unitMs: number = 80): void {
            this.withSpeaker(() => {
                this.voice.morse(code, unitMs);
            });
        }

        /**
         * Translate plain text to morse code and play it immediately.
         * @param text plain text to translate and play as morse.
         * @param unitMs duration of one dit in milliseconds.
         */
        public morseText(text: string, unitMs: number = 80): void {
            this.withSpeaker(() => {
                this.voice.morse(RoboVoice.toMorse(text), unitMs);
            });
        }

        /**
         * Play a sequence of tones using arrays of frequencies in Hz and durations in milliseconds.
         * Use frequency 0 for a rest.
         * @param frequencies tone frequencies in Hz.
         * @param durations tone durations in milliseconds.
         */
        public playToneSequenceMs(frequencies: number[], durations: number[]): void {
            this.withSpeaker(() => {
                const n = Math.min(frequencies ? frequencies.length : 0, durations ? durations.length : 0);
                for (let i = 0; i < n; i++) {
                    const dur = Math.max(0, Math.round(durations[i]));
                    const f = Math.round(frequencies[i]);
                    if (f <= 0) music.rest(dur);
                    else music.playTone(f, dur);
                }
            });
        }

        /**
         * Makes the robot greet using text-to-speech.
         * The robot will speak its serial number and name.
         */
        public greet(): void {
            // 1. Combine the identification strings
            this.talk("My name is " + this.sn + " " + this.name);
        }

        public stateTalk(): void {
            let words = [
                "Hello! I am " + this.sn + " " + this.name + ". ",
                this.content.cuteWords(),
                "Temperature is " + input.temperature() + " degree."
            ];
            this.talk(words[Math.randomRange(0, words.length - 1)]);
        }

        /**
         * Adjusts the radio group ID and updates the hardware settings.
         * @param i The amount to adjust the group ID by (positive or negative).
         */
        public incrGroupId(i: number): void {
            this.setGroupId(this.radioGroupID + i);
        }

        /**
         * Set the radio group ID and updates the hardware settings.
         * @param channel The channel to set the radio group ID to.
         */
        public setGroupId(channel: number): void {
            // 1. Calculate the new group ID with 0-255 wrapping logic
            this.radioGroupID = (channel) % 256;

            // 2. Handle negative results from the modulo (JavaScript specific)
            if (this.radioGroupID < 0) {
                this.radioGroupID += 256;
            }

            // 3. Update the native radio hardware group
            radio.setGroup(this.radioGroupID);

            // 4. Update the 5x5 LED display to show the new channel
            this.showChannel();
        }

        /**
         * Returns the current radio group/channel (0..255).
         */
        public getGroupId(): number {
            return this.radioGroupID;
        }

        /**
         * Returns the forward max speed scalar.
         */
        public getFwdMaxSpeed(): number {
            return this.fwdSpeed;
        }

        /**
         * Sets the forward max speed scalar.
         */
        public setFwdMaxSpeed(v: number): void {
            this.fwdSpeed = v;
        }

        /**
         * Returns the backward max speed scalar.
         */
        public getBwdMaxSpeed(): number {
            return this.bwdSpeed;
        }

        /**
         * Sets the backward max speed scalar.
         */
        public setBwdMaxSpeed(v: number): void {
            this.bwdSpeed = v;
        }
        /**
         * Generates a random LED light show on the robot's NeoPixel strip.
         * Ported from random_light() in Python.
         */
        private randomLight(): void {
            // 1. Loop through the 4 pixels on the robot's strip
            for (let p = 0; p < 4; p++) {
                // 2. Generate random RGB values (0-128 for moderate brightness)
                let red = Math.randomRange(0, 128);
                let green = Math.randomRange(0, 128);
                let blue = Math.randomRange(0, 128);

                // 3. Set the color for the specific pixel
                // Use neopixel.rgb to combine the values into a single color object
                this.np.setPixelColor(p, neopixel.rgb(red, green, blue));
            }

            // 4. Push the updated colors to the hardware
            this.np.show();
        }
        /**
         * Makes the robot dance with self-balance based on sound analysis.
         */
        public dance(): number {
            let ts = control.millis();
            let ms = input.soundLevel();

            // 1. Check for a musical beat using the MusicLib helper
            let il = this.music.isABeat(ts, ms, 1.005);

            // 2. High-beat logic: Pulse LEDs and flip wiggle direction
            if (ts - this.lastHighBeat > this.music.period * 0.5) {
                this.danceYawWiggle *= -1;
                this.dancePitchWiggle *= -1;
                this.randomLight(); // Trigger NeoPixel animation
                this.lastHighBeat = ts;
            }

            // 3. Low-beat logic: Change the dance move routine
            if (il && (ts - this.lastLowBeat > this.music.period * Math.randomRange(8, 16))) {
                // Pick a new move from the approved dance state list
                this.danceState = [this.pr.danceOkStates[Math.randomRange(0, this.pr.danceOkStates.length - 1)]];
                this.lastLowBeat = ts;
            }

            // 4. Balance and tilt compensation
            this.balanceParam();
            let ft = Math.min(12.0, Math.max(-12.0, this.rl * 0.8 + this.danceYawWiggle * 0.2));
            if (Math.abs(ft) < 8) {
                ft = 0;
            }
            let lt = ft + this.danceYawWiggle;

            // 5. Apply control vectors to servos
            // Servo 5 (head/body pitch) reacts to sound volume
            this.setControlOffsets([0, 1, 2, 3, 4, 5],
                [ft, lt, ft, lt, this.rl, this.dancePitchWiggle - ms * 0.001]);

            // 6. Dynamic speed adjustment
            this.danceSpeed = Math.min(1.5, this.danceSpeed * 1.015);
            if (this.maxG > 1800) { // If shaking too hard, slow down
                this.danceSpeed *= 0.9;
            }

            // 7. Execute the movement via the PCB instance
            return this.pcb.move(this.pr, this.danceState, [0, 1, 2, 3],
                this.danceSpeed, [4, 5, 6, 7, 8, 9], this.danceSpeed);
        }

        // Command Handlers
        public speed(v: number) {
            if (v > 0.2) {
                this.walkSpeed = v * this.fwdSpeed;
                this.gst = 5;
            } else if (v < -0.2) {
                this.walkSpeed = -v * this.bwdSpeed;
                this.gst = 5;
            } else {
                this.walkSpeed = 0;
            }
        }
        public turn(v: number) { this.walkDirection = (this.walkDirection * 4 + v) * 0.2; }
        public roll(v: number) { this.headYawBias = (v + this.headYawBias) * 0.5; }
        public pitch(v: number) { this.headPitchBias = (v * -1 + this.headPitchBias) * 0.5; }
        public button(v: number) {
            if (v == 0) {
                this.gst = 0;
                this.headPitchBias = 0;
                this.headYawBias = 0;
                this.talk("Rest!");
            } else if (v == 1) {
                if (this.gst == -4) {
                    this.adjustTrim(-1);
                } else {
                    this.talk("Exploring");
                    this.exploreSpeed = 3.0;
                    this.exploreDirection = 0.0;
                    this.gst = 1;
                }
            } else if (v == 2) {
                if (this.gst == -4) {
                    this.setTrimIndex(this.trimIndex + 1);
                } else {
                    this.gst = 2;
                }
            } else if (v == 3) {
                if (this.gst == -4) {
                    this.setTrimIndex(this.trimIndex - 1);
                } else {
                    this.talk("Dance!");
                    this.danceSpeed = 1.5;
                    this.gst = 3;
                }
            } else if (v == 4) {
                if (this.gst == -4) {
                    this.adjustTrim(1);
                } else {
                    this.gst = 4;
                }
            }
        }

        public logo(v: number) {
            this.stateTalk();
        }

        public pose(v: number) { this.restState = v; this.gst = 0; }

        public setTrim(index: number, value: number) {
            this.pcb.servoTrim[index] = value
        }

        public setTrimIndex(index: number): void {
            this.trimIndex = index % this.pcb.dof;
            if (this.trimIndex < 0) this.trimIndex = this.pcb.dof - 1;
            this.showTrimIndex();
        }

        public adjustTrim(delta: number): void {
            this.pcb.servoTrim[this.trimIndex] += delta;
            this.showTrimIndex();
            this.trim();
            serial.writeLine("trims: " + this.pcb.servoTrim.join(","))
        }

        public beginTrimCalibration(): void {
            this.gst = -4;
            this.showTrimIndex();
        }

        public toggleServoTrim(): void {
            if (this.gst == -4) {
                this.saveTrimCalibration();
            } else {
                this.beginTrimCalibration();
            }
            basic.pause(1000)
        }

        public saveTrimCalibration(): void {
            this.writeConfig();
            this.stand();
            this.talk("Saved!");
            this.gst = 0;
            this.showChannel();
        }

        private showTrimIndex(): void {
            basic.showNumber(this.trimIndex + 1);
        }

        /**
         * Run the robot's calibration routine.
         */
        public calibrate() {
            // 1. Move to calibration position
            this.pcb.servoMove(this.pr.stateTargets[25]);

            // 2. Flashes the eyes three times for visual feedback
            for (let i = 0; i < 3; i++) {
                this.pcb.flash(1020);  // Bright flash
                basic.pause(500); // In MakeCode, sleep(500) is basic.pause(500)
            }

            // 3. Turn eyes on and return to neutral position
            this.pcb.eyesCtl(1);
            this.pcb.servoMove(this.pr.stateTargets[0]);
            basic.pause(2000);
        }

        public runKeyValueCommand(key: string, v: number) {
            this.runKeyValueCMD(key, v);
        }

        public runKeyValueCMD(key: string, v: number) {
            this.lastCmdTS = control.millis();

            // 3. Look up the function in the dictionary
            let action = this.cmdFuncDict[key];

            // 4. If the function exists, execute it (the "noop" equivalent)
            if (action) {
                action(v)
            }
        }

        public runStringCommand(s: string) {
            this.runStrCMD(s);
        }

        public runStrCMD(s: string) {
            // 1. Update the timestamp of the last received command
            this.lastCmdTS = control.millis()

            // 2. Process #put: Text-to-Speech
            if (s.substr(0, 4) == "#put") {
                this.talk(s.substr(4));
            }

            // 3. Process #pus: Buffered Singing (6 segments)
            else if (s.substr(0, 4) == "#pus") {
                // Assume s_list is an array of strings defined in the class
                this.sing(s.substr(4));
            }

            // 4. Process #puhi: Greeting
            else if (s.substr(0, 5) == "#puhi") {
                this.talk("My friend " + s.substr(5) + " is here")
                this.sendStatusCode("ACK")
            }

            // 5. Process #pun: Name/Serial Update
            else if (s.substr(0, 4) == "#pun") {
                this.sn = s.substr(4);
                this.greet();
            }
        }
    }


} // namespace robotPuPro
