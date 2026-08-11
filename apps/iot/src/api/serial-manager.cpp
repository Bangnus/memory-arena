#include "serial-manager.h"
#include "../config/config.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"

// Heartbeat interval over USB Serial so the backend can track device online status.
// Keep it well below the backend's 30s online threshold (DeviceService).
constexpr unsigned long USB_HEARTBEAT_INTERVAL_MS = 10000UL;

SerialManager serialManager;

void SerialManager::init() {
    Serial.begin(115200);
    Serial.println("SYS:READY_USB");
    lastHeartbeatTime = millis();
    sendHeartbeat(); // Immediate presence signal so the frontend sees the device quickly
}

void SerialManager::loop() {
    while (Serial.available() > 0) {
        String line = Serial.readStringUntil('\n');
        line.trim();
        if (line.length() > 0) {
            parseIncomingLine(line);
        }
    }

    // Periodic heartbeat over USB Serial (works in WiFi mode too when plugged in)
    unsigned long now = millis();
    if (now - lastHeartbeatTime >= USB_HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatTime = now;
        sendHeartbeat();
    }
}

void SerialManager::sendButtonPress(const String& btnName) {
    Serial.println("BTN:" + btnName);
}

void SerialManager::sendRestart() {
    Serial.println("RESTART");
}

void SerialManager::sendHeartbeat() {
    Serial.println("HB:" + String(DEVICE_ID));
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
