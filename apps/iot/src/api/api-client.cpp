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
    
    WiFiClient client;
    // Removed client.setTimeout(5) to fix read Timeout error
    HTTPClient http;
    String url = String(BACKEND_URL) + endpoint;
    http.begin(client, url);
    http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
    http.addHeader("Connection", "close");
    http.setTimeout(HTTP_TIMEOUT_MS);
    
    Serial.printf("[HTTP] GET %s\n", url.c_str());
    int httpCode = http.GET();
    String payload = "";
    
    if (httpCode > 0) {
        payload = http.getString();
        Serial.printf("[HTTP] GET Response Code: %d, Payload: %s\n", httpCode, payload.c_str());
    } else {
        Serial.printf("[HTTP] GET %s failed, error: %s\n", endpoint, http.errorToString(httpCode).c_str());
    }
    http.end();
    return payload;
}

String ApiClient::httpPost(const char* endpoint, const String& payload) {
    if (!wifiManager.isConnected()) return "";
    
    WiFiClient client;
    // Removed client.setTimeout(5) to fix read Timeout error
    HTTPClient http;
    String url = String(BACKEND_URL) + endpoint;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
    http.addHeader("Connection", "close");
    http.setTimeout(HTTP_TIMEOUT_MS);
    
    Serial.printf("[HTTP] POST %s, Payload: %s\n", url.c_str(), payload.c_str());
    int httpCode = http.POST(payload);
    String response = "";
    
    if (httpCode > 0) {
        response = http.getString();
        Serial.printf("[HTTP] POST Response Code: %d, Data: %s\n", httpCode, response.c_str());
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

    httpPost("/device/heartbeat", payload);
}

bool ApiClient::checkBackendStatus() {
    String res = httpGet("/device/status");
    return res.length() > 0;
}

bool ApiClient::getCurrentState(GameStateData& state) {
    String res = httpGet("/game/current");
    if (res.length() == 0) return false;

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, res);
    if (error) return false;

    JsonObject data = doc["data"];
    if (data.isNull()) return false;

    state.id = data["id"].as<String>();
    state.status = data["status"].as<String>();
    state.difficulty = data["difficulty"].as<String>();
    state.round = data["currentRound"] | 1;
    return true;
}

bool ApiClient::getSequence(GameSequenceData& seq) {
    String res = httpGet("/game/sequence");
    if (res.length() == 0) return false;

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, res);
    if (error) return false;

    JsonObject data = doc["data"];
    if (data.isNull()) return false;

    seq.sessionId = data["sessionId"].as<String>();
    seq.round = data["round"] | 1;
    seq.displaySpeed = data["displaySpeed"] | 500;

    JsonArray arr = data["sequence"].as<JsonArray>();
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

    JsonObject data = resDoc["data"];
    if (data.isNull()) return false;

    res.roundWinner = data["roundWinner"] | 0;
    res.player1Score = data["player1Score"] | 0;
    res.player2Score = data["player2Score"] | 0;
    res.matchFinished = data["matchFinished"] | false;
    res.nextRound = data["nextRound"] | 0;

    return true;
}

bool ApiClient::startGame() {
    String response = httpPost("/session/start", "{}");
    return response.length() > 0;
}

bool ApiClient::signalStart() {
    String response = httpPost("/device/start", "{}");
    return response.length() > 0;
}
