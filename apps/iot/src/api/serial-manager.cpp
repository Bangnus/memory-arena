#include "serial-manager.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"

SerialManager serialManager;

void SerialManager::init() {
    Serial.begin(115200);
    Serial.println("SYS:READY_USB");
}

void SerialManager::loop() {
    while (Serial.available() > 0) {
        String line = Serial.readStringUntil('\n');
        line.trim();
        if (line.length() > 0) {
            parseIncomingLine(line);
        }
    }
}

void SerialManager::sendButtonPress(const String& btnName) {
    Serial.println("BTN:" + btnName);
}

void SerialManager::sendRestart() {
    Serial.println("RESTART");
}

void SerialManager::sendEvent(const String& eventName, const String& data) {
    if (data.length() > 0) {
        Serial.println("EVT:" + eventName + ":" + data);
    } else {
        Serial.println("EVT:" + eventName);
    }
}

void SerialManager::parseIncomingLine(const String& line) {
    if (line == "RESET") {
        ledManager.turnOffAll();
        buzzerManager.playReset();
    } else if (line.startsWith("LED:")) {
        String colorStr = line.substring(4);
        if (colorStr == "RED") ledManager.turnOn(LedColor::RED);
        else if (colorStr == "GREEN") ledManager.turnOn(LedColor::GREEN);
        else if (colorStr == "BLUE") ledManager.turnOn(LedColor::BLUE);
        else if (colorStr == "YELLOW") ledManager.turnOn(LedColor::YELLOW);
        else if (colorStr == "ALL") ledManager.turnOn(LedColor::ALL);
        else if (colorStr == "OFF") ledManager.turnOffAll();
    } else if (line.startsWith("BEEP")) {
        buzzerManager.play(BuzzerSound::BEEP);
    }
}
