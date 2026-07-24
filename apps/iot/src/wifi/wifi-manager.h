#pragma once

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
public:
    void init();
    void loop();
    bool isConnected();

private:
    unsigned long lastReconnectAttempt = 0;
    bool wasConnected = false;
};

extern WifiManager wifiManager;
