#pragma once

#include <Arduino.h>
#include <SocketIOclient.h>
#include "../config/config.h"

// Callback type for socket events
typedef void (*SocketEventCallback)(const String& event, const String& payload);

class SocketClient {
public:
    void init();
    void loop();
    void disconnect();
    void handleEvent(socketIOmessageType_t type, uint8_t * payload, size_t length);
    
    bool isConnected();
    
    // Send events to server
    void emit(const String& event, const String& payload);
    
    // Register callback for incoming events
    void onEvent(SocketEventCallback callback);

private:
    SocketIOclient socketIO;
    SocketEventCallback eventCallback = nullptr;
    bool connected = false;
};

extern SocketClient socketClient;
