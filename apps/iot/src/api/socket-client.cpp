#include "socket-client.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>
#include <WiFi.h>

SocketClient socketClient;

// Static event handler for SocketIOclient
static SocketClient* instance = nullptr;

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    if (instance) {
        instance->handleEvent(type, payload, length);
    }
}

void SocketClient::init() {
    instance = this;
    
    // Setup Socket.IO client
    socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&transport=websocket");
    socketIO.onEvent(socketIOEvent);
    
    Serial.printf("[SOCKET] Connecting to %s:%d\n", BACKEND_HOST, BACKEND_PORT);
}

void SocketClient::loop() {
    if (!wifiManager.isConnected()) return;
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
    // Socket.IO message format: ["event",{payload}]
    String msg = "[\"" + event + "\"," + payload + "]";
    socketIO.sendEVENT(msg.c_str());
}

void SocketClient::onEvent(SocketEventCallback callback) {
    eventCallback = callback;
}

void SocketClient::handleEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[SOCKET] Disconnected (heap:%d rssi:%d)\n", ESP.getFreeHeap(), WiFi.RSSI());
            connected = false;
            break;
            
        case sIOtype_CONNECT:
            Serial.printf("[SOCKET] Connected (heap:%d)\n", ESP.getFreeHeap());
            connected = true;
            break;
            
        case sIOtype_EVENT: {
            String payloadStr = String((char*)payload, length);
            
            // Parse Socket.IO event: ["event_name", {data}]
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
                    
                    // Forward to game engine callback
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
