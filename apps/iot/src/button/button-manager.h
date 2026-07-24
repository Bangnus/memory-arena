#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../config/pins.h"

struct ButtonEvent {
    ButtonType button;
    unsigned long timestamp;
};

class ButtonManager {
public:
    void init();
    void enablePlayerButtons();
    void disablePlayerButtons();
    
    bool hasEvent();
    ButtonEvent popEvent();

    bool isUpPressed();
    bool isDownPressed();
    bool isStartPressed();

    void handleInterrupt(uint8_t pin);

private:
    static void IRAM_ATTR isrHandler();
    void setupPin(uint8_t pin);
};

extern ButtonManager buttonManager;
