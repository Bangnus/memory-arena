#include "socket-client.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>

SocketClient socketClient;

// Server event handler
void socketIOEvent(socketIOClient::clientDataType_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case sIOtype_DISCONNECT:
            Serial.println("[SOCKET] Disconnected");
            socketClient.disconnect();
            break;
        case sIOtype_CONNECT:
            Serial.println("[SOCKET] Connected");
            // Join game namespace
            socketClient.emit("join", "{\"room\":\"game\"}");
            break;
        case sIOtype_EVENT: {
            // Parse event name and payload
            String payloadStr = String((char*)payload);
            
            // Socket.IO events come as JSON array: ["event_name", {data}]
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payloadStr);
            if (!error && doc.is<JsonArray>()) {
                JsonArray arr = doc.as<JsonArray>();
                if (arr.size() >= 1) {
                    String eventName = arr[0].as<String>();
                    String eventData = "";
                    if (arr.size() >= 2) {
                        serializeJson(arr[1], eventData);
                    }
                    socketClient.emit(eventName, eventData);
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

void SocketClient::init() {
    // Set up event handler
    client.onEvent(socketIOEvent);
    
    // Connect to server
    reconnect();
}

void SocketClient::loop() {
    if (!wifiManager.isConnected()) return;
    
    // Check connection and reconnect if needed
    if (!connected) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 5000) { // Reconnect every 5 seconds
            lastReconnectAttempt = now;
            reconnect();
        }
        return;
    }
    
    // Handle incoming data
    client.monitor();
}

void SocketClient::reconnect() {
    Serial.printf("[SOCKET] Connecting to %s:%d\n", BACKEND_HOST, BACKEND_PORT);
    
    if (client.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&transport=polling")) {
        Serial.println("[SOCKET] Connection initiated");
    } else {
        Serial.println("[SOCKET] Failed to initiate connection");
    }
}

void SocketClient::disconnect() {
    connected = false;
    client.disconnect();
}

bool SocketClient::isConnected() {
    return connected;
}

void SocketClient::emit(const String& event, const String& payload) {
    if (!connected) return;
    
    // Socket.IO emit format: ["event_name", {data}]
    String json = "[\"" + event + "\"," + payload + "]";
    client.sendEvent(json.c_str());
}

void SocketClient::onEvent(SocketEventCallback callback) {
    eventCallback = callback;
}

void SocketClient::handleEvent(const String& event, const String& payload) {
    if (eventCallback) {
        eventCallback(event, payload);
    }
}
