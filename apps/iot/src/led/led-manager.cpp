#include "led-manager.h"

LedManager ledManager;

void LedManager::init() {
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_LED_BLUE, OUTPUT);
    turnOffAll();
}

void LedManager::turnOffAll() {
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_BLUE, LOW);
}

void LedManager::turnOn(LedColor color) {
    turnOffAll();
    switch (color) {
        case LedColor::RED:  digitalWrite(PIN_LED_RED, HIGH); break;
        case LedColor::BLUE: digitalWrite(PIN_LED_BLUE, HIGH); break;
        case LedColor::ALL:
            digitalWrite(PIN_LED_RED, HIGH);
            digitalWrite(PIN_LED_BLUE, HIGH);
            break;
        default: break;
    }
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
            animationStep = (animationStep + 1) % 2;
            switch(animationStep) {
                case 0: turnOn(LedColor::RED); break;
                case 1: turnOn(LedColor::BLUE); break;
            }
        }
    }
}
