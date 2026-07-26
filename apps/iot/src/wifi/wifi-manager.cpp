#include "wifi-manager.h"
#include "../config/config.h"
#include <time.h>

WifiManager wifiManager;

static const char* NTP_SERVER = "pool.ntp.org";
static const long NTP_GMT_OFFSET_SEC = 0;   // UTC
static const int NTP_DAYLIGHT_OFFSET_SEC = 0;

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

bool WifiManager::isTimeSynced() {
    return timeSynced;
}

void WifiManager::loop() {
    bool currentConnected = isConnected();
    
    if (currentConnected && !wasConnected) {
        WiFi.setSleep(false);
        Serial.println("WiFi Connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        wasConnected = true;

        // Start NTP time sync
        configTime(NTP_GMT_OFFSET_SEC, NTP_DAYLIGHT_OFFSET_SEC, NTP_SERVER);
    } else if (!currentConnected && wasConnected) {
        Serial.println("WiFi Disconnected!");
        wasConnected = false;
        timeSynced = false;
    }

    // Check if NTP time is valid (year >= 2025)
    if (!timeSynced && wasConnected) {
        time_t now;
        time(&now);
        struct tm* timeinfo = localtime(&now);
        if (timeinfo->tm_year >= (2025 - 1900)) {
            timeSynced = true;
            Serial.printf("[NTP] Time synced: %s", ctime(&now));
        }
    }
}
