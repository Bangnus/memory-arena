#pragma once
#include <Arduino.h>

// =================================================================
// 1. I2C Configuration (PCF8575 I/O Expander 16 Channels)
// =================================================================
constexpr int PIN_I2C_SDA = 21;
constexpr int PIN_I2C_SCL = 22;
constexpr uint8_t PCF8575_I2C_ADDR = 0x20; // Default address (A0, A1, A2 -> GND)

// LED Logic Level (Active-LOW: LOW=ON, HIGH=OFF)
constexpr uint8_t LED_ON_STATE  = LOW;  // PCF8575 sinks current best on LOW
constexpr uint8_t LED_OFF_STATE = HIGH;

// =================================================================
// 2. PCF8575 Pins (P0 - P15): หลอดไฟ LED รวม 12 ดวง (สำรอง 4 ช่อง)
// =================================================================
// --- 2.1 ไฟหลักตรงกลางสำหรับแสดงโจทย์ (Main Sequence LEDs - 4 ดวง) ---
constexpr uint8_t PCF_LED_MAIN_RED    = 0;
constexpr uint8_t PCF_LED_MAIN_GREEN  = 1;
constexpr uint8_t PCF_LED_MAIN_BLUE   = 2;
constexpr uint8_t PCF_LED_MAIN_YELLOW = 3;

// --- 2.2 ไฟแสดงสถานะ/ผลลัพธ์ Player 1 (4 ดวง) ---
constexpr uint8_t PCF_LED_P1_RED      = 4;
constexpr uint8_t PCF_LED_P1_GREEN    = 5;
constexpr uint8_t PCF_LED_P1_BLUE     = 6;
constexpr uint8_t PCF_LED_P1_YELLOW   = 7;

// --- 2.3 ไฟแสดงสถานะ/ผลลัพธ์ Player 2 (4 ดวง) ---
constexpr uint8_t PCF_LED_P2_RED      = 8;
constexpr uint8_t PCF_LED_P2_GREEN    = 9;
constexpr uint8_t PCF_LED_P2_BLUE     = 10;
constexpr uint8_t PCF_LED_P2_YELLOW   = 11;

// ขาสำรองบน PCF8575 (P12 - P15)
constexpr uint8_t PCF_RESERVED_12     = 12;
constexpr uint8_t PCF_RESERVED_13     = 13;
constexpr uint8_t PCF_RESERVED_14     = 14;
constexpr uint8_t PCF_RESERVED_15     = 15;

// =================================================================
// 3. ESP32 Direct GPIOs: ปุ่มกดเกม 8 ปุ่ม (Internal Pull-Up ต่อลง GND)
// =================================================================
// Player 1 Color Buttons (4 ปุ่ม)
constexpr int PIN_P1_RED    = 16;
constexpr int PIN_P1_BLUE   = 17;
constexpr int PIN_P1_GREEN  = 18;
constexpr int PIN_P1_YELLOW = 19;

// Player 2 Color Buttons (4 ปุ่ม)
constexpr int PIN_P2_RED    = 23;
constexpr int PIN_P2_GREEN  = 25;
constexpr int PIN_P2_BLUE   = 26;
constexpr int PIN_P2_YELLOW = 27;

// =================================================================
// 4. ESP32 Direct GPIOs: ปุ่มควบคุม 4 ปุ่ม (Internal Pull-Up ต่อลง GND)
// =================================================================
constexpr int PIN_BTN_START   = 32;
constexpr int PIN_BTN_NEXT    = 33;
constexpr int PIN_BTN_PREV    = 4;
constexpr int PIN_BTN_RESTART = 5;

// =================================================================
// 5. Buzzer
// =================================================================
constexpr int PIN_BUZZER = 13;
