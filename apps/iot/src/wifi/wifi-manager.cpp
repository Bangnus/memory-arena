#include "wifi-manager.h"
#include "../config/config.h"

WifiManager wifiManager;

void WifiManager::init() {
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    WiFi.setAutoReconnect(true);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    lastReconnectAttempt = millis();
}

bool WifiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WifiManager::loop() {
    bool currentConnected = isConnected();
    
    if (currentConnected && !wasConnected) {
        WiFi.setSleep(false);
        Serial.println("WiFi Connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        wasConnected = true;
    } else if (!currentConnected && wasConnected) {
        Serial.println("WiFi Disconnected!");
        wasConnected = false;
    }
}
