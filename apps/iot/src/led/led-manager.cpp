#include "led-manager.h"

LedManager ledManager;

void LedManager::init() {
    pinMode(PIN_LED_MAIN_RED, OUTPUT);
    pinMode(PIN_LED_MAIN_GREEN, OUTPUT);
    pinMode(PIN_LED_MAIN_BLUE, OUTPUT);
    pinMode(PIN_LED_MAIN_YELLOW, OUTPUT);
    turnOffAll();
}

void LedManager::turnOffAll() {
    digitalWrite(PIN_LED_MAIN_RED, LED_OFF_STATE);
    digitalWrite(PIN_LED_MAIN_GREEN, LED_OFF_STATE);
    digitalWrite(PIN_LED_MAIN_BLUE, LED_OFF_STATE);
    digitalWrite(PIN_LED_MAIN_YELLOW, LED_OFF_STATE);
}

void LedManager::turnOnMain(LedColor color) {
    turnOffAll();

    switch (color) {
        case LedColor::RED:
            digitalWrite(PIN_LED_MAIN_RED, LED_ON_STATE);
            break;
        case LedColor::GREEN:
            digitalWrite(PIN_LED_MAIN_GREEN, LED_ON_STATE);
            break;
        case LedColor::BLUE:
            digitalWrite(PIN_LED_MAIN_BLUE, LED_ON_STATE);
            break;
        case LedColor::YELLOW:
            digitalWrite(PIN_LED_MAIN_YELLOW, LED_ON_STATE);
            break;
        case LedColor::ALL:
            digitalWrite(PIN_LED_MAIN_RED, LED_ON_STATE);
            digitalWrite(PIN_LED_MAIN_GREEN, LED_ON_STATE);
            digitalWrite(PIN_LED_MAIN_BLUE, LED_ON_STATE);
            digitalWrite(PIN_LED_MAIN_YELLOW, LED_ON_STATE);
            break;
        default: 
            break;
    }
}

void LedManager::turnOnPlayer1(LedColor color) {
    // Player 1 LEDs are hardware-coupled with button presses (no direct GPIO control needed)
}

void LedManager::turnOnPlayer2(LedColor color) {
    // Player 2 LEDs are hardware-coupled with button presses (no direct GPIO control needed)
}

void LedManager::turnOn(LedColor color) {
    turnOnMain(color);
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

