#include "pxt.h"
#include "nrf.h"

// Hardware watchdog for the shared robot I2C worker.
//
// codal's NRF52I2C::waitForStop busy-waits with no fiber yield, and its
// LASTTX errata workaround can reset the timeout counter forever when a
// slave holds SCL low after the last byte (STOPPED never arrives). That
// infinite spin starves the whole cooperative scheduler: every fiber dies,
// the software watchdogs never fire, and no panic is raised.
//
// The nRF WDT runs on the 32.768 kHz LFCLK and cannot be stopped once
// started, so it recovers the board from any such spin by hard-resetting.

static bool wdtStarted = false;

namespace robotpuWatchdog {

//%
void start(int timeoutSeconds) {
    if (wdtStarted)
        return;
    if (timeoutSeconds <= 0)
        timeoutSeconds = 15;
    // The WDT clocks from LFCLK — make sure the source is actually running;
    // starting an already-running LFCLK is harmless.
    NRF_CLOCK->TASKS_LFCLKSTART = 1;
    NRF_WDT->CRV = 32768 * (uint32_t)timeoutSeconds;
    NRF_WDT->RREN = WDT_RREN_RR0_Enabled << WDT_RREN_RR0_Pos;
    NRF_WDT->TASKS_START = 1;
    NRF_WDT->RR[0] = WDT_RR_RR_Reload;
    wdtStarted = true;
}

//%
void feed() {
    if (wdtStarted)
        NRF_WDT->RR[0] = WDT_RR_RR_Reload;
}

}
