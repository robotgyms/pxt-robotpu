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
