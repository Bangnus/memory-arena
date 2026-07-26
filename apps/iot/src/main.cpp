#include <Arduino.h>
#include "led/led-manager.h"
#include "button/button-manager.h"
#include "buzzer/buzzer.h"
#include "wifi/wifi-manager.h"
#include "api/api-client.h"
#include "api/socket-client.h"
#include "game/game-engine.h"

void setup() {
    Serial.begin(115200);
    Serial.println("Memory Arena ESP32 Starting...");
    
    // Initialize hardware drivers
    ledManager.init();
    buttonManager.init();
    buzzerManager.init();
    
    // Initialize network and game logic
    wifiManager.init();
    apiClient.init();
    gameEngine.init();
    
    Serial.println("Initialization complete.");
}

void loop() {
    gameEngine.loop();
}