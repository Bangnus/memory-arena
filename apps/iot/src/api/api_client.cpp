#include "api_client.h"

ApiClient::ApiClient(const char* baseUrl) : baseUrl_(baseUrl) {}

bool ApiClient::connect() {
  // TODO: Implement connection check
  return true;
}

String ApiClient::getSession() {
  // TODO: Implement GET /game/session
  return "{}";
}

String ApiClient::getSequence() {
  // TODO: Implement GET /game/sequence
  return "{}";
}

bool ApiClient::submitInput(const char* input) {
  // TODO: Implement POST /game/input
  return true;
}

bool ApiClient::sendHeartbeat() {
  // TODO: Implement POST /device/status
  return true;
}

bool ApiClient::sendDeviceStatus() {
  // TODO: Implement POST /device/status
  return true;
}

String ApiClient::makeRequest(const char* method, const char* endpoint, const char* body) {
  // TODO: Implement HTTP request
  return "{}";
}
