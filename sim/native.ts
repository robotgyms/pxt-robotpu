namespace pxsim.robotpuWatchdog {
    // The hardware WDT does not exist in the simulator. These no-ops keep
    // pxsim.robotpuWatchdog defined — a missing namespace throws a raw
    // TypeError that MakeCode try/catch cannot intercept.
    export function start(timeoutSeconds: number): void { }
    export function feed(): void { }
}

namespace pxsim.robotpuBus {
    // No real TWIM exists in the simulator; report the bounded driver as
    // absent so the worker falls back to the stock pins.i2c* shims.
    export function hasBoundedI2C(): boolean {
        return false;
    }
    export function i2cWrite(addr: number, buf: RefBuffer, repeated: boolean): number {
        pins.i2cWriteBuffer(addr, buf, repeated);
        return 0;
    }
    export function i2cRead(addr: number, len: number, repeated: boolean): RefBuffer {
        return pins.i2cReadBuffer(addr, len, repeated);
    }
}
