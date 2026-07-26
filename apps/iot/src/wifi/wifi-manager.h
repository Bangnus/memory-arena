#pragma once

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
public:
    void init();
    void loop();
    bool isConnected();
    bool isTimeSynced();

private:
    unsigned long lastReconnectAttempt = 0;
    bool wasConnected = false;
    bool timeSynced = false;
};

extern WifiManager wifiManager;
