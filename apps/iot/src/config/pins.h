#pragma once

// LED Pins (8 LEDs - 4 per player: Red, Green, Blue, Yellow)
constexpr int PIN_LED_P1_RED = 2;
constexpr int PIN_LED_P1_GREEN = 5;
constexpr int PIN_LED_P1_BLUE = 4;
constexpr int PIN_LED_P1_YELLOW = 12;

constexpr int PIN_LED_P2_RED = 15;
constexpr int PIN_LED_P2_GREEN = 33;
constexpr int PIN_LED_P2_BLUE = 32;
constexpr int PIN_LED_P2_YELLOW = 14;

// Backward Compatibility Aliases for 2-color modes
constexpr int PIN_LED_RED = 2;
constexpr int PIN_LED_BLUE = 4;

// Player 1 Color Buttons (4 buttons: Red, Green, Blue, Yellow)
constexpr int PIN_P1_RED = 16;
constexpr int PIN_P1_GREEN = 18;
constexpr int PIN_P1_BLUE = 17;
constexpr int PIN_P1_YELLOW = 19;

// Player 2 Color Buttons (4 buttons: Red, Green, Blue, Yellow)
constexpr int PIN_P2_RED = 21;
constexpr int PIN_P2_GREEN = 23;
constexpr int PIN_P2_BLUE = 22;
constexpr int PIN_P2_YELLOW = 25;

// Control Buttons (4 Buttons: START, NEXT, PREV, RESTART)
constexpr int PIN_BTN_START = 14; // Input-only pin 34 (10k pullup) or 14
constexpr int PIN_BTN_NEXT = 26;
constexpr int PIN_BTN_PREV = 27;
constexpr int PIN_BTN_RESTART = 39; // Restart Game Button (Input-only pin 39, 10k pullup)

// Buzzer
constexpr int PIN_BUZZER = 13;
