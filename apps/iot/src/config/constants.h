#pragma once

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

enum class LedColor {
    NONE = 0,
    RED,
    BLUE,
    ALL
};

enum class ButtonType {
    NONE = 0,
    P1_RED, P1_BLUE,
    P2_RED, P2_BLUE,
    CTRL_START
};

constexpr int MAX_SEQUENCE_LENGTH = 20;
constexpr unsigned long HTTP_TIMEOUT_MS = 1000;
constexpr unsigned long DEBOUNCE_DELAY_MS = 150;
constexpr unsigned long INPUT_TIMEOUT_MS = 15000;
