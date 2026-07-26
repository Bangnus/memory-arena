#pragma once

#include <Arduino.h>
#include <SocketIOClient.h>
#include "../config/config.h"

// Callback type for socket events
typedef void (*SocketEventCallback)(const String& event, const String& payload);

class SocketClient {
public:
    void init();
    void loop();
    void disconnect();
    
    bool isConnected();
    
    // Send events to server
    void emit(const String& event, const String& payload);
    
    // Register callback for incoming events
    void onEvent(SocketEventCallback callback);
    
    // Reconnect
    void reconnect();

private:
    SocketIOClient client;
    SocketEventCallback eventCallback = nullptr;
    bool connected = false;
    unsigned long lastReconnectAttempt = 0;
    
    void handleEvent(const String& event, const String& payload);
};

extern SocketClient socketClient;
