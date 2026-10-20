#include "pxt.h"
#include "nrf.h"
#include "NRF52I2C.h"
#include "codal_target_hal.h"

using namespace codal;

// Bounded I2C transactions for the shared robot bus.
//
// codal's NRF52I2C::waitForStop busy-waits on EVENTS_STOPPED with
// target_wait_us(10) — no fiber yield — and its silicon-errata workaround
// resets the timeout counter every iteration while EVENTS_LASTTX is
// latched. When a slave holds SCL low after the last byte (STOPPED can
// never be generated), that turns a 10 s timeout into an infinite
// non-yielding spin that starves the entire cooperative scheduler.
//
// These functions replicate codal's TWIM transaction sequence on the same
// peripheral instance, but the errata poke never resets `locked`, so the
// wait is hard-bounded (~50 ms). On timeout the bus is recovered: a forced
// RESUME+STOP first, then TWIM disable + GPIO bus clear + re-enable if the
// STOP still cannot complete.
//
// Result: a stretched transaction returns DEVICE_I2C_ERROR instead of
// freezing the board.

#define ROBOTPU_I2C_TIMEOUT10US 5000 // ~50 ms bound on a transaction
#define ROBOTPU_I2C_STOP10US 1000    // ~10 ms for a forced STOP

namespace {

// Reach codal's protected TWIM handle. uBit.i2c owns the only I2C bus in
// the system; NRF52I2CAccess has identical member layout, so the protected
// p_twim can be read through it.
class NRF52I2CAccess : public codal::NRF52I2C {
  public:
    static NRF_TWIM_Type *twim(codal::NRF52I2C &i2c) {
        return reinterpret_cast<NRF52I2CAccess &>(i2c).p_twim;
    }
};

NRF_TWIM_Type *robotTwim() { return NRF52I2CAccess::twim(uBit.i2c); }

int waitForStopBounded(NRF_TWIM_Type *p_twim, nrf_twim_event_t evt) {
    int res = DEVICE_OK;
    int locked = 0;

    while (!nrf_twim_event_check(p_twim, evt)) {
        if (nrf_twim_event_check(p_twim, NRF_TWIM_EVENT_ERROR) ||
            locked > ROBOTPU_I2C_TIMEOUT10US) {
            auto err = p_twim->ERRORSRC;
            p_twim->ERRORSRC = err;

            nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_ERROR);
            nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_RESUME);
            nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_STOP);
            res = DEVICE_I2C_ERROR;

            bool stopped = false;
            for (int i = 0; i < ROBOTPU_I2C_STOP10US; i++) {
                target_wait_us(10);
                if (nrf_twim_event_check(p_twim, NRF_TWIM_EVENT_STOPPED)) {
                    stopped = true;
                    break;
                }
            }

            // The slave is still holding the bus: drop the peripheral (pins
            // revert to GPIO), bit-bang SCL until the slave releases SDA,
            // then bring the TWIM back. PSEL/FREQUENCY survive disable, so
            // the pin binding is preserved.
            if (!stopped) {
                nrf_twim_disable(p_twim);
                uBit.i2c.clearBus();
                nrf_twim_enable(p_twim);
            }
            break;
        }

        locked++;
        if (p_twim->EVENTS_TXSTARTED && p_twim->TXD.MAXCNT == 0 &&
            locked >= 100) {
            res = DEVICE_OK;
            break;
        }

        // Same silicon-errata workaround as codal — the SHORTS chain can
        // miss triggering the TASK under interrupt load — but poked at ~1 ms
        // cadence and NEVER resetting locked, so the timeout stays armed.
        if (locked >= 100 && (locked % 100) == 0 && p_twim->EVENTS_LASTTX &&
            (p_twim->SHORTS & NRF_TWIM_SHORT_LASTTX_SUSPEND_MASK) &&
            !p_twim->EVENTS_SUSPENDED) {
            p_twim->TASKS_SUSPEND = 1;
        }

        if (locked >= 100 && (locked % 100) == 0 && p_twim->EVENTS_LASTTX &&
            (p_twim->SHORTS & NRF_TWIM_SHORT_LASTTX_STOP_MASK) &&
            !p_twim->EVENTS_STOPPED) {
            p_twim->TASKS_STOP = 1;
        }
        target_wait_us(10);
    }

    return res;
}

int writeRaw(uint16_t address, uint8_t *data, int len, bool repeated) {
    NRF_TWIM_Type *p_twim = robotTwim();
    if (!p_twim)
        return DEVICE_I2C_ERROR;

    nrf_twim_address_set(p_twim, address & 0x7F);

    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_STOPPED);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_ERROR);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_LASTTX);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_LASTRX);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_TXSTARTED);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_RXSTARTED);

    nrf_twim_tx_buffer_set(p_twim, data, len);

    if (repeated)
        nrf_twim_shorts_set(p_twim, NRF_TWIM_SHORT_LASTTX_SUSPEND_MASK);
    else
        nrf_twim_shorts_set(p_twim, NRF_TWIM_SHORT_LASTTX_STOP_MASK);

    nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_STARTTX);

    if (p_twim->EVENTS_SUSPENDED) {
        nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_RESUME);
        nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_SUSPENDED);
    }

    return waitForStopBounded(
        p_twim, repeated ? NRF_TWIM_EVENT_SUSPENDED : NRF_TWIM_EVENT_STOPPED);
}

int readRaw(uint16_t address, uint8_t *data, int len, bool repeated) {
    NRF_TWIM_Type *p_twim = robotTwim();
    if (!p_twim)
        return DEVICE_I2C_ERROR;

    nrf_twim_address_set(p_twim, address & 0x7F);

    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_STOPPED);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_ERROR);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_LASTTX);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_LASTRX);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_TXSTARTED);
    nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_RXSTARTED);

    nrf_twim_rx_buffer_set(p_twim, data, len);

    if (!repeated)
        nrf_twim_shorts_set(p_twim, NRF_TWIM_SHORT_LASTRX_STOP_MASK);

    nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_STARTRX);

    if (p_twim->EVENTS_SUSPENDED) {
        nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_RESUME);
        nrf_twim_event_clear(p_twim, NRF_TWIM_EVENT_SUSPENDED);
    }

    if (!repeated)
        return waitForStopBounded(p_twim, NRF_TWIM_EVENT_STOPPED);

    int r = waitForStopBounded(p_twim, NRF_TWIM_EVENT_LASTRX);
    if (r != DEVICE_OK)
        return r;
    nrf_twim_task_trigger(p_twim, NRF_TWIM_TASK_SUSPEND);
    return waitForStopBounded(p_twim, NRF_TWIM_EVENT_SUSPENDED);
}

} // namespace

namespace robotpuBus {

//%
bool hasBoundedI2C() { return robotTwim() != NULL; }

//%
int i2cWrite(int addr, ManagedBuffer buf, bool repeated) {
    return writeRaw(addr, buf.getBytes(), buf.length(), repeated);
}

//%
ManagedBuffer i2cRead(int addr, int len, bool repeated) {
    if (len <= 0 || len > 255)
        return ManagedBuffer();
    ManagedBuffer buf(len);
    if (readRaw(addr, buf.getBytes(), len, repeated) != DEVICE_OK)
        return ManagedBuffer();
    return buf;
}

}
