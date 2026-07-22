# AGENTS.md

# Memory Arena IoT Firmware

## Overview

This package contains the firmware for Memory Arena.

Target Board

ESP32 Dev Module

Framework

Arduino Framework

IDE

PlatformIO

The ESP32 controls only the hardware.

It never owns business logic.

The backend is always the source of truth.

---

# Responsibilities

ESP32 is responsible for

- Button Input
- LED Output
- Buzzer
- Memory Sequence Display
- Player Input Detection
- Timer
- WiFi
- REST API Communication

ESP32 must NEVER

- calculate leaderboard
- authenticate users
- store permanent data
- calculate match winner
- store statistics

---

# Hardware

Board

ESP32 Dev Module

Components

8 Player Buttons

Player 1

RED

BLUE

GREEN

YELLOW

Player 2

RED

BLUE

GREEN

YELLOW

Control Buttons

START

NEXT

PREVIOUS

NeoPixel Ring

WS2812B

Buzzer

Active Buzzer

---

# Libraries

WiFi

HTTPClient

ArduinoJson

Adafruit NeoPixel

Preferences

Do not introduce unnecessary libraries.

---

# Folder Structure

src/

main.cpp

config/

api/

button/

led/

buzzer/

game/

wifi/

display/

utils/

Never place all logic inside main.cpp.

---

# Module Responsibilities

Button

Read buttons

Interrupt

Debounce

LED

NeoPixel

Animations

Display sequence

Buzzer

Game sounds

WiFi

Connection

Reconnect

API

HTTP Client

REST

Game

State Machine

Timer

Sequence playback

Utils

Shared helper functions

---

# Coding Rules

Use C++

Use classes

Keep modules independent

Avoid global variables

Never duplicate code

Maximum function

40 lines

Maximum file

300 lines

Split responsibilities.

---

# Timing

Never use delay()

Always use millis()

Firmware must always remain responsive.

---

# State Machine

Use enum class.

States

BOOT

CONNECT_WIFI

WAIT_SERVER

SELECT_MODE

WAIT_PLAYERS

COUNTDOWN

SHOW_SEQUENCE

PLAYER_INPUT

ROUND_RESULT

GAME_RESULT

RESET

Only one state may be active.

Transitions must be explicit.

---

# Button Rules

Use hardware interrupts.

Debounce correctly.

Ignore repeated presses.

Buttons are disabled while

Sequence is displaying.

Buttons become active only after

Display sequence has finished.

---

# Memory Game

Backend sends

Sequence

Difficulty

Display Speed

ESP32 displays sequence exactly.

Never generate sequence locally.

Never modify sequence.

---

# Sequence Display

Example

RED

↓

GREEN

↓

BLUE

↓

OFF

Only after sequence finishes

Player input becomes active.

---

# Player Input

Accept input

Only after sequence display.

Store

Player

Button

Timestamp

Order

Immediately send completed sequence to backend.

Do not calculate winner locally.

---

# Wrong Input

Continue recording until player fails.

Report

Wrong Position

Current Progress

Elapsed Time

Backend determines round result.

---

# LED

Use WS2812B

Animations

Boot

Waiting

Countdown

Sequence

Correct

Wrong

Winner

Idle

Do not hardcode colors.

Use constants.

---

# Buzzer

Functions

playBoot()

playCountdown()

playCorrect()

playWrong()

playWinner()

playReset()

Never mix buzzer logic with game logic.

---

# WiFi

Reconnect automatically.

Retry every

5 seconds.

Never freeze firmware.

---

# REST API

GET

/game/session

GET

/game/sequence

POST

/game/input

POST

/game/status

POST

/device/status

Never block forever waiting for HTTP.

Always timeout.

---

# JSON

Use ArduinoJson.

Never manually concatenate JSON strings.

---

# Configuration

Create

config.h

Store

WiFi SSID

WiFi Password

Backend URL

Timeout

Device Name

Never hardcode elsewhere.

---

# Constants

Create

constants.h

Game states

LED colors

GPIO Pins

Timeouts

Animation Speeds

Never use magic numbers.

---

# GPIO

Keep all GPIO mapping inside one file.

Example

pins.h

Never spread pin definitions.

---

# Error Handling

Handle

WiFi Lost

Backend Offline

HTTP Timeout

Invalid Response

Button Failure

Reconnect automatically.

Never reboot endlessly.

---

# Logging

Serial only.

Log

WiFi

API

State

Button

Errors

No excessive logging.

---

# Performance

Never allocate memory repeatedly.

Reuse buffers.

Avoid String where possible.

Prefer constexpr.

---

# Naming

Classes

PascalCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Enums

PascalCase

Files

kebab-case

---

# API Client

Create ApiClient class.

Methods

connect()

getSession()

getSequence()

submitInput()

sendHeartbeat()

Do not use HTTP directly in main.cpp.

---

# Button Manager

Create ButtonManager.

Responsibilities

Interrupt

Debounce

Input Buffer

Player Detection

No game logic.

---

# LED Manager

Create LedManager.

Responsibilities

Animation

Sequence

Color Mapping

Brightness

No game logic.

---

# Game Engine

Create GameEngine.

Responsible for

Current State

Current Sequence

Player Progress

Round Flow

Timers

No HTTP.

No LED implementation.

Only coordinate modules.

---

# Main.cpp

main.cpp must only

Initialize

Modules

Loop

State Update

Never implement business logic.

---

# Testing

Each module should be independently testable.

Avoid tightly coupled code.

---

# AI Instructions

Before generating code

1. Read root AGENTS.md

2. Read iot/AGENTS.md

3. Never put everything in main.cpp

4. Use State Machine

5. Use millis()

6. Use Interrupt

7. Keep firmware modular

8. Backend owns game rules

Always generate production-ready firmware.