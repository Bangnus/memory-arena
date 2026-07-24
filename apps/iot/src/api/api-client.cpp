#include "api-client.h"
#include "../config/config.h"
#include "../wifi/wifi-manager.h"
#include <HTTPClient.h>

ApiClient apiClient;

void ApiClient::init() {
    // Nothing special to init here
}

void ApiClient::loop() {
    if (!wifiManager.isConnected()) return;
    
    unsigned long now = millis();
    if (now - lastHeartbeat >= 30000) { // 30 seconds
        sendHeartbeat();
        lastHeartbeat = now;
    }
}

String ApiClient::httpGet(const char* endpoint) {
    if (!wifiManager.isConnected()) return "";
    
    HTTPClient http;
    String url = String(BACKEND_URL) + endpoint;
    http.begin(url);
    http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
    http.setTimeout(HTTP_TIMEOUT_MS);
    
    int httpCode = http.GET();
    String payload = "";
    
    if (httpCode > 0) {
        payload = http.getString();
    } else {
        Serial.printf("[HTTP] GET %s failed, error: %s\n", endpoint, http.errorToString(httpCode).c_str());
    }
    http.end();
    return payload;
}

String ApiClient::httpPost(const char* endpoint, const String& payload) {
    if (!wifiManager.isConnected()) return "";
    
    HTTPClient http;
    String url = String(BACKEND_URL) + endpoint;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
    http.setTimeout(HTTP_TIMEOUT_MS);
    
    int httpCode = http.POST(payload);
    String response = "";
    
    if (httpCode > 0) {
        response = http.getString();
    } else {
        Serial.printf("[HTTP] POST %s failed, error: %s\n", endpoint, http.errorToString(httpCode).c_str());
    }
    http.end();
    return response;
}

void ApiClient::sendHeartbeat() {
    JsonDocument doc;
    doc["deviceId"] = DEVICE_ID;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["status"] = "ONLINE";
    
    String payload;
    serializeJson(doc, payload);
    
    httpPost("/device/status", payload);
}

bool ApiClient::checkBackendStatus() {
    String res = httpGet("/device/status");
    return res.length() > 0;
}

bool ApiClient::getCurrentState(GameStateData& state) {
    String res = httpGet("/game/session");
    if (res.length() == 0) return false;
    
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, res);
    if (error) return false;
    
    state.status = doc["status"].as<String>();
    state.difficulty = doc["difficulty"].as<String>();
    state.round = doc["round"] | 1;
    return true;
}

bool ApiClient::getSequence(GameSequenceData& seq) {
    String res = httpGet("/game/sequence");
    if (res.length() == 0) return false;
    
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, res);
    if (error) return false;
    
    seq.round = doc["round"] | 1;
    seq.displaySpeed = doc["displaySpeed"] | 500;
    
    JsonArray arr = doc["sequence"].as<JsonArray>();
    seq.length = 0;
    for (JsonVariant v : arr) {
        if (seq.length < MAX_SEQUENCE_LENGTH) {
            seq.sequence[seq.length++] = v.as<String>();
        }
    }
    return true;
}

bool ApiClient::submitInput(String sessionId, int round, const PlayerInputData& p1, const PlayerInputData& p2, RoundResultData& res) {
    JsonDocument doc;
    doc["sessionId"] = sessionId;
    doc["round"] = round;
    
    JsonObject player1 = doc["player1"].to<JsonObject>();
    JsonArray p1Inputs = player1["input"].to<JsonArray>();
    for (int i=0; i<p1.length; i++) p1Inputs.add(p1.inputs[i]);
    player1["time"] = p1.time;
    
    JsonObject player2 = doc["player2"].to<JsonObject>();
    JsonArray p2Inputs = player2["input"].to<JsonArray>();
    for (int i=0; i<p2.length; i++) p2Inputs.add(p2.inputs[i]);
    player2["time"] = p2.time;
    
    String payload;
    serializeJson(doc, payload);
    
    String responseStr = httpPost("/game/input", payload);
    if (responseStr.length() == 0) return false;
    
    JsonDocument resDoc;
    if (deserializeJson(resDoc, responseStr)) return false;
    
    res.roundWinner = resDoc["roundWinner"] | 0;
    res.player1Score = resDoc["player1Score"] | 0;
    res.player2Score = resDoc["player2Score"] | 0;
    res.matchFinished = resDoc["matchFinished"] | false;
    res.nextRound = resDoc["nextRound"] | 0;
    
    return true;
}
