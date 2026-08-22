#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../config/pins.h"

class LedManager {
public:
    void init();
    void turnOffAll();
    
    void turnOn(LedColor color);
    void turnOnMain(LedColor color);
    void turnOnPlayer1(LedColor color);
    void turnOnPlayer2(LedColor color);

    void loop();
    
    void startBlinking();
    void startCycling();
    void startSteadyOn();
    void stopAnimation();

private:
    unsigned long lastUpdate = 0;
    int animationStep = 0;
    enum class Animation { NONE, BLINKING, CYCLING, STEADY_ON } currentAnimation = Animation::NONE;
};

extern LedManager ledManager;
