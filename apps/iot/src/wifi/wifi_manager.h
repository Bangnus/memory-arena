#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
public:
  WifiManager(const char* ssid, const char* password);
  bool connect();
  bool isConnected();
  void reconnect();
  void loop();

private:
  const char* ssid_;
  const char* password_;
  unsigned long lastReconnectAttempt_;
  bool connected_;
};

#endif // WIFI_MANAGER_H
