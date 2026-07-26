#include "socket-client.h"
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
    
    socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&transport=websocket");
    socketIO.onEvent(socketIOEvent);
    
    Serial.printf("[SOCKET] Init -> %s:%d\n", BACKEND_HOST, BACKEND_PORT);
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
            socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&transport=websocket");
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
