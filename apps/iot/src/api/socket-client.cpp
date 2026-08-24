#include "socket-client.h"
#include "../config/config.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>
#include <WiFi.h>

SocketClient socketClient;

static SocketClient* instance = nullptr;
static unsigned long lastDisconnectTime = 0;
static const unsigned long RECONNECT_DELAY_MS = 5000; // Wait 5s before reconnect

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    if (instance) {
        instance->handleEvent(type, payload, length);
    }
}

void SocketClient::init() {
    instance = this;
    connected = false;
    
    socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=3&transport=websocket");
    socketIO.onEvent(socketIOEvent);
    
    Serial.printf("[SOCKET] Init -> %s:%d (EIO=3)\n", BACKEND_HOST, BACKEND_PORT);
}

void SocketClient::loop() {
    if (!wifiManager.isConnected()) return;
    
    // Don't reconnect too fast after disconnect (prevent WiFi crash)
    if (!connected) {
        unsigned long now = millis();
        if (lastDisconnectTime > 0 && (now - lastDisconnectTime) < RECONNECT_DELAY_MS) {
            return; // Still in cooldown
        }
        if (lastDisconnectTime > 0) {
            Serial.println("[SOCKET] Reconnecting...");
            socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=3&transport=websocket");
            lastDisconnectTime = 0;
        }
    }
    
    socketIO.loop();
}

void SocketClient::disconnect() {
    connected = false;
    socketIO.disconnect();
}

bool SocketClient::isConnected() {
    return connected;
}

void SocketClient::emit(const String& event, const String& payload) {
    if (!connected) return;
    String msg = "[\"" + event + "\"," + payload + "]";
    socketIO.sendEVENT(msg.c_str());
}

void SocketClient::onEvent(SocketEventCallback callback) {
    eventCallback = callback;
}

void SocketClient::sendHeartbeat() {
    JsonDocument doc;
    doc["deviceId"] = DEVICE_ID;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["status"] = "ONLINE";
    String payload;
    serializeJson(doc, payload);
    emit("device:heartbeat", payload);
}

void SocketClient::sendButtonPress(int playerNumber, const String& color) {
    JsonDocument doc;
    doc["playerNumber"] = playerNumber;
    doc["color"] = color;
    String payload;
    serializeJson(doc, payload);
    emit("game:press", payload);
}

void SocketClient::submitInput(const String& sessionId, int round,
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
    emit("game:input", payload);
}

void SocketClient::signalStart() {
    emit("device:start", "{}");
}

void SocketClient::signalModeChange(int mode) {
    JsonDocument doc;
    doc["mode"] = mode;
    String payload;
    serializeJson(doc, payload);
    emit("device:mode", payload);
}

void SocketClient::setDifficulty(const String& difficulty) {
    JsonDocument doc;
    doc["difficulty"] = difficulty;
    String payload;
    serializeJson(doc, payload);
    emit("session:difficulty", payload);
}

void SocketClient::sendSystemReset() {
    emit("system:reset", "{}");
}

void SocketClient::sendDbReset() {
    emit("system:db_reset", "{}");
}

void SocketClient::handleEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[SOCKET] Disconnected at %lu ms (heap:%d rssi:%d)\n", millis(), ESP.getFreeHeap(), WiFi.RSSI());
            connected = false;
            lastDisconnectTime = millis();
            break;
            
        case sIOtype_CONNECT:
            Serial.printf("[SOCKET] Connected at %lu ms (heap:%d)\n", millis(), ESP.getFreeHeap());
            connected = true;
            lastDisconnectTime = 0;
            // Start time sync
            emit("time:sync", String("{\"clientTime\":") + millis() + "}");
            break;
            
        case sIOtype_EVENT: {
            String payloadStr = String((char*)payload, length);
            
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payloadStr);
            if (!error && doc.is<JsonArray>()) {
                JsonArray arr = doc.as<JsonArray>();
                if (arr.size() >= 1) {
                    String eventName = arr[0].as<String>();
                    String eventData = "{}";
                    if (arr.size() >= 2) {
                        serializeJson(arr[1], eventData);
                    }
                    
                    if (eventCallback) {
                        eventCallback(eventName, eventData);
                    }
                }
            }
            break;
        }
        
        case sIOtype_ERROR:
            Serial.printf("[SOCKET] Error: %s\n", payload);
            break;
            
        default:
            break;
    }
}
