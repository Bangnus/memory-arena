#ifndef CONSTANTS_H
#define CONSTANTS_H

// Game States
enum class GameState {
  BOOT,
  CONNECT_WIFI,
  WAIT_SERVER,
  SELECT_MODE,
  WAIT_PLAYERS,
  COUNTDOWN,
  SHOW_SEQUENCE,
  PLAYER_INPUT,
  ROUND_RESULT,
  GAME_RESULT,
  RESET
};

// LED Colors
#define COLOR_RED 0xFF0000
#define COLOR_BLUE 0x0000FF
#define COLOR_GREEN 0x00FF00
#define COLOR_YELLOW 0xFFFF00
#define COLOR_OFF 0x000000

// Timeouts (ms)
#define DEBOUNCE_DELAY 50
#define SEQUENCE_DELAY 800
#define COUNTDOWN_DELAY 1000

// GPIO Pins
#define PIN_LED_DATA 5
#define PIN_BUZZER 18

// Player 1 Buttons
#define PIN_P1_RED 2
#define PIN_P1_BLUE 3
#define PIN_P1_GREEN 4
#define PIN_P1_YELLOW 15

// Player 2 Buttons
#define PIN_P2_RED 16
#define PIN_P2_BLUE 17
#define PIN_P2_GREEN 21
#define PIN_P2_YELLOW 22

// Control Buttons
#define PIN_START 23
#define PIN_NEXT 25
#define PIN_PREVIOUS 26

#endif // CONSTANTS_H
