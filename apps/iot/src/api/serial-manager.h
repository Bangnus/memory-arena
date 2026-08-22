#pragma once

#include <Arduino.h>

class SerialManager {
public:
    void init();
    void loop();
    void sendButtonPress(const String& btnName);
    void sendRestart();
    void sendInput(const String& sessionId, int round,
                   const String& p1Inputs, int p1Time,
                   const String& p2Inputs, int p2Time);
    void sendEvent(const String& eventName, const String& data = "");
    void sendHeartbeat();

private:
    void parseIncomingLine(const String& line);
    unsigned long lastHeartbeatTime = 0;
};

extern SerialManager serialManager;
