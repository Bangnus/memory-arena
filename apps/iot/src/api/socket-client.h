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
    
    // Game-specific emit methods
    void sendHeartbeat();
    void sendButtonPress(int playerNumber, const String& color);
    void submitInput(const String& sessionId, int round, 
                     const String& p1Inputs, int p1Time,
                     const String& p2Inputs, int p2Time);
    void signalStart();
    void signalModeChange(int mode);
    void setDifficulty(const String& difficulty);
    void sendSystemReset();
    
    // Register callback for incoming events
    void onEvent(SocketEventCallback callback);

private:
    SocketIOclient socketIO;
    SocketEventCallback eventCallback = nullptr;
    bool connected = false;
};

extern SocketClient socketClient;
