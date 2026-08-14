#include "led-manager.h"
#include "../expander/pcf8575-manager.h"

LedManager ledManager;

void LedManager::init() {
    turnOffAll();
}

void LedManager::turnOffAll() {
    // If Active-LOW: HIGH (1) turns off LED. All 16 pins set to LED_OFF_STATE.
    if (LED_OFF_STATE == HIGH) {
        ioExpander.write16(0xFFFF);
    } else {
        ioExpander.write16(0x0000);
    }
}

void LedManager::turnOnMain(LedColor color) {
    // Turn off main LEDs first
    ioExpander.writePin(PCF_LED_MAIN_RED, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_MAIN_GREEN, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_MAIN_BLUE, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_MAIN_YELLOW, LED_OFF_STATE);

    switch (color) {
        case LedColor::RED:
            ioExpander.writePin(PCF_LED_MAIN_RED, LED_ON_STATE);
            break;
        case LedColor::GREEN:
            ioExpander.writePin(PCF_LED_MAIN_GREEN, LED_ON_STATE);
            break;
        case LedColor::BLUE:
            ioExpander.writePin(PCF_LED_MAIN_BLUE, LED_ON_STATE);
            break;
        case LedColor::YELLOW:
            ioExpander.writePin(PCF_LED_MAIN_YELLOW, LED_ON_STATE);
            break;
        case LedColor::ALL:
            ioExpander.writePin(PCF_LED_MAIN_RED, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_MAIN_GREEN, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_MAIN_BLUE, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_MAIN_YELLOW, LED_ON_STATE);
            break;
        default: break;
    }
}

void LedManager::turnOnPlayer1(LedColor color) {
    ioExpander.writePin(PCF_LED_P1_RED, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P1_GREEN, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P1_BLUE, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P1_YELLOW, LED_OFF_STATE);

    switch (color) {
        case LedColor::RED:
            ioExpander.writePin(PCF_LED_P1_RED, LED_ON_STATE);
            break;
        case LedColor::GREEN:
            ioExpander.writePin(PCF_LED_P1_GREEN, LED_ON_STATE);
            break;
        case LedColor::BLUE:
            ioExpander.writePin(PCF_LED_P1_BLUE, LED_ON_STATE);
            break;
        case LedColor::YELLOW:
            ioExpander.writePin(PCF_LED_P1_YELLOW, LED_ON_STATE);
            break;
        case LedColor::ALL:
            ioExpander.writePin(PCF_LED_P1_RED, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P1_GREEN, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P1_BLUE, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P1_YELLOW, LED_ON_STATE);
            break;
        default: break;
    }
}

void LedManager::turnOnPlayer2(LedColor color) {
    ioExpander.writePin(PCF_LED_P2_RED, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P2_GREEN, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P2_BLUE, LED_OFF_STATE);
    ioExpander.writePin(PCF_LED_P2_YELLOW, LED_OFF_STATE);

    switch (color) {
        case LedColor::RED:
            ioExpander.writePin(PCF_LED_P2_RED, LED_ON_STATE);
            break;
        case LedColor::GREEN:
            ioExpander.writePin(PCF_LED_P2_GREEN, LED_ON_STATE);
            break;
        case LedColor::BLUE:
            ioExpander.writePin(PCF_LED_P2_BLUE, LED_ON_STATE);
            break;
        case LedColor::YELLOW:
            ioExpander.writePin(PCF_LED_P2_YELLOW, LED_ON_STATE);
            break;
        case LedColor::ALL:
            ioExpander.writePin(PCF_LED_P2_RED, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P2_GREEN, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P2_BLUE, LED_ON_STATE);
            ioExpander.writePin(PCF_LED_P2_YELLOW, LED_ON_STATE);
            break;
        default: break;
    }
}

void LedManager::turnOn(LedColor color) {
    turnOffAll();
    // Turn on across Main, P1, and P2
    turnOnMain(color);
    turnOnPlayer1(color);
    turnOnPlayer2(color);
}

void LedManager::startBlinking() {
    currentAnimation = Animation::BLINKING;
    animationStep = 0;
    lastUpdate = millis();
}

void LedManager::startCycling() {
    currentAnimation = Animation::CYCLING;
    animationStep = 0;
    lastUpdate = millis();
}

void LedManager::stopAnimation() {
    currentAnimation = Animation::NONE;
    turnOffAll();
}

void LedManager::loop() {
    if (currentAnimation == Animation::NONE) return;

    unsigned long now = millis();

    if (currentAnimation == Animation::BLINKING) {
        if (now - lastUpdate >= 1000) {
            lastUpdate = now;
            animationStep = !animationStep;
            if (animationStep) {
                turnOn(LedColor::ALL);
            } else {
                turnOffAll();
            }
        }
    } else if (currentAnimation == Animation::CYCLING) {
        if (now - lastUpdate >= 300) {
            lastUpdate = now;
            animationStep = (animationStep + 1) % 4;
            switch(animationStep) {
                case 0: turnOn(LedColor::RED); break;
                case 1: turnOn(LedColor::GREEN); break;
                case 2: turnOn(LedColor::BLUE); break;
                case 3: turnOn(LedColor::YELLOW); break;
            }
        }
    }
}
