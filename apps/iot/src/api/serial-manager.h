#pragma once

#include <Arduino.h>

class SerialManager {
public:
    void init();
    void loop();
    void sendButtonPress(const String& btnName);
    void sendRestart();
    void sendEvent(const String& eventName, const String& data = "");
    void sendHeartbeat();

private:
    void parseIncomingLine(const String& line);
    unsigned long lastHeartbeatTime = 0;
};

extern SerialManager serialManager;
