#include "pcf8575-manager.h"

PCF8575Manager ioExpander;

PCF8575Manager::PCF8575Manager() : pcf(PCF8575_I2C_ADDR) {}

bool PCF8575Manager::init() {
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    if (!pcf.begin()) {
        Serial.println("[PCF8575] ERROR: Failed to detect PCF8575 at address 0x20!");
        isReady = false;
        return false;
    }
    isReady = true;
    Serial.println("[PCF8575] Initialized successfully at address 0x20.");
    
    // Set default initial state for all 16 pins
    setAllHigh();
    return true;
}

void PCF8575Manager::writePin(uint8_t pin, uint8_t value) {
    if (!isReady) return;
    pcf.write(pin, value);
}

uint8_t PCF8575Manager::readPin(uint8_t pin) {
    if (!isReady) return HIGH;
    return pcf.read(pin);
}

void PCF8575Manager::write16(uint16_t mask) {
    if (!isReady) return;
    pcf.write16(mask);
}

uint16_t PCF8575Manager::read16() {
    if (!isReady) return 0xFFFF;
    return pcf.read16();
}

void PCF8575Manager::setAllHigh() {
    write16(0xFFFF);
}

void PCF8575Manager::setAllLow() {
    write16(0x0000);
}
