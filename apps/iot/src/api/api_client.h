#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

class ApiClient {
public:
  ApiClient(const char* baseUrl);
  bool connect();
  String getSession();
  String getSequence();
  bool submitInput(const char* input);
  bool sendHeartbeat();
  bool sendDeviceStatus();

private:
  String baseUrl_;
  HTTPClient http_;
  String makeRequest(const char* method, const char* endpoint, const char* body = nullptr);
};

#endif // API_CLIENT_H
