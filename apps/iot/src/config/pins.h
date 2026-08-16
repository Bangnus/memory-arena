#pragma once
#include <Arduino.h>

// =================================================================
// 1. ESP32 Direct GPIOs: Main Sequence LEDs (4 direct pins)
// =================================================================
constexpr int PIN_LED_MAIN_RED    = 21;
constexpr int PIN_LED_MAIN_GREEN  = 22;
constexpr int PIN_LED_MAIN_BLUE   = 14;
constexpr int PIN_LED_MAIN_YELLOW = 15;

// LED Logic Level (Active-HIGH for direct GPIO: HIGH=ON, LOW=OFF)
constexpr uint8_t LED_ON_STATE  = HIGH;
constexpr uint8_t LED_OFF_STATE = LOW;

// =================================================================
// 2. ESP32 Direct GPIOs: Player Buttons (8 pins, Active-LOW)
// =================================================================
// Player 1 Color Buttons (4 pins)
constexpr int PIN_P1_RED    = 16;
constexpr int PIN_P1_BLUE   = 17;
constexpr int PIN_P1_GREEN  = 18;
constexpr int PIN_P1_YELLOW = 19;

// Player 2 Color Buttons (4 pins)
constexpr int PIN_P2_RED    = 23;
constexpr int PIN_P2_GREEN  = 25;
constexpr int PIN_P2_BLUE   = 26;
constexpr int PIN_P2_YELLOW = 27;

// =================================================================
// 3. ESP32 Direct GPIOs: Control Buttons (4 pins, Active-LOW)
// =================================================================
constexpr int PIN_BTN_START   = 32;
constexpr int PIN_BTN_NEXT    = 33;
constexpr int PIN_BTN_PREV    = 4;
constexpr int PIN_BTN_RESTART = 5;

// =================================================================
// 4. ESP32 Direct GPIO: Buzzer (1 pin)
// =================================================================
constexpr int PIN_BUZZER = 13;

