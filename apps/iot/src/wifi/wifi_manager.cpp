#include "wifi_manager.h"

WifiManager::WifiManager(const char* ssid, const char* password)
  : ssid_(ssid), password_(password), lastReconnectAttempt_(0), connected_(false) {}

bool WifiManager::connect() {
  WiFi.begin(ssid_, password_);
  // TODO: Implement connection with timeout
  return true;
}

bool WifiManager::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void WifiManager::reconnect() {
  if (millis() - lastReconnectAttempt_ > 5000) {
    lastReconnectAttempt_ = millis();
    WiFi.begin(ssid_, password_);
  }
}

void WifiManager::loop() {
  if (!isConnected()) {
    reconnect();
  }
}
