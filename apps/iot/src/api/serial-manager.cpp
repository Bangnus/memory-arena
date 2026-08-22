#include "serial-manager.h"
#include "../config/config.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../game/game-engine.h"

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

void SerialManager::sendInput(const String& sessionId, int round,
                              const String& p1Inputs, int p1Time,
                              const String& p2Inputs, int p2Time) {
    JsonDocument doc;
    doc["sessionId"] = sessionId;
    doc["round"] = round;
    
    JsonDocument p1Doc;
    deserializeJson(p1Doc, p1Inputs);
    doc["player1"]["input"] = p1Doc;
    doc["player1"]["time"] = p1Time;
    
    JsonDocument p2Doc;
    deserializeJson(p2Doc, p2Inputs);
    doc["player2"]["input"] = p2Doc;
    doc["player2"]["time"] = p2Time;
    
    String payload;
    serializeJson(doc, payload);
    Serial.println("EVT:game:input:" + payload);
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
        gameEngine.handleSocketEvent("system:reset", "{}");
    } else if (line.startsWith("EVT:")) {
        int jsonStart = line.indexOf('{', 4);
        if (jsonStart == -1) jsonStart = line.indexOf('[', 4);

        if (jsonStart != -1) {
            int eventEnd = jsonStart;
            if (eventEnd > 4 && line.charAt(eventEnd - 1) == ':') {
                eventEnd--;
            }
            String eventName = line.substring(4, eventEnd);
            String payload = line.substring(jsonStart);
            gameEngine.handleSocketEvent(eventName, payload);
        } else {
            String eventName = line.substring(4);
            gameEngine.handleSocketEvent(eventName, "{}");
        }
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
