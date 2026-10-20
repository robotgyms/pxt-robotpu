declare namespace robotpuWatchdog {
    /**
     * Arm the nRF hardware watchdog. Once started it cannot be stopped;
     * if feed() is not called for timeoutSeconds the chip hard-resets.
     * Used to recover the board when a wedged I2C slave makes the codal
     * TWI driver spin without yielding.
     */
    //% shim=robotpuWatchdog::start
    function start(timeoutSeconds: number): void;

    /**
     * Reload the hardware watchdog counter.
     */
    //% shim=robotpuWatchdog::feed
    function feed(): void;
}

declare namespace robotpuBus {
    /**
     * True if the bounded TWIM driver is available (always on hardware,
     * false in the simulator).
     */
    //% shim=robotpuBus::hasBoundedI2C
    function hasBoundedI2C(): boolean;

    /**
     * Bounded I2C write on the shared robot bus. Returns DEVICE_OK (0) on
     * success, DEVICE_I2C_ERROR after ~50 ms if the transaction never
     * completes. Never spins without yielding.
     */
    //% shim=robotpuBus::i2cWrite
    function i2cWrite(addr: number, buf: Buffer, repeated: boolean): number;

    /**
     * Bounded I2C read on the shared robot bus. Returns the received
     * buffer, or an empty buffer if the transaction timed out.
     */
    //% shim=robotpuBus::i2cRead
    function i2cRead(addr: number, len: number, repeated: boolean): Buffer;
}
