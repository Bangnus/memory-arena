#pragma once

#include <Arduino.h>
#include <Wire.h>
#include <PCF8575.h>
#include "../config/pins.h"

class PCF8575Manager {
public:
    PCF8575Manager();
    bool init();

    void writePin(uint8_t pin, uint8_t value);
    uint8_t readPin(uint8_t pin);

    void write16(uint16_t mask);
    uint16_t read16();

    void setAllHigh();
    void setAllLow();

private:
    PCF8575 pcf;
    bool isReady = false;
};

extern PCF8575Manager ioExpander;
