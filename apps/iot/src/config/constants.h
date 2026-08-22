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
    GREEN,
    BLUE,
    YELLOW,
    ALL
};

enum class ButtonType {
    NONE = 0,
    P1_RED, P1_GREEN, P1_BLUE, P1_YELLOW,
    P2_RED, P2_GREEN, P2_BLUE, P2_YELLOW,
    CTRL_START, CTRL_NEXT, CTRL_PREV, CTRL_RESTART
};

constexpr int MAX_SEQUENCE_LENGTH = 20;
constexpr unsigned long HTTP_TIMEOUT_MS = 1000;
constexpr unsigned long DEBOUNCE_DELAY_MS = 65;
constexpr unsigned long INPUT_TIMEOUT_MS = 15000;
