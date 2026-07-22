# ESP32 Communication Protocol
Version 1.0

---

# Overview

ESP32 is a Game Terminal.

Backend is the Game Controller.

ESP32 never owns business logic.

ESP32 only

- Displays LEDs
- Reads Buttons
- Plays Sounds
- Measures Input Time
- Sends Raw Data

Backend owns

- Game Rules
- Session
- Match
- Sequence
- Winner
- Score
- Database

Communication

REST API

JSON

HTTP

---

# Device Information

Device Name

ESP32-001

Protocol

HTTP

Data Format

JSON

Character Encoding

UTF-8

---

# Device Lifecycle

Boot

↓

Connect WiFi

↓

Connect Backend

↓

Idle

↓

Waiting Session

↓

Receive Commands

↓

Play Game

↓

Send Results

↓

Idle

---

# Boot

ESP32 boots.

↓

Connect WiFi

↓

GET /device/status

If backend available

↓

Idle

Else

Retry every 5 seconds.

---

# Heartbeat

Every

30 seconds

POST

/device/heartbeat

Request

{
    "deviceId":"ESP32-001",
    "firmwareVersion":"1.0.0",
    "status":"ONLINE"
}

Response

{
    "success":true
}

---

# Waiting

ESP32 waits for Backend.

No local game.

No random generation.

Buttons disabled.

LED Idle Animation.

---

# Start Match

ESP32 requests

GET

/game/current

Backend Response

{
    "status":"COUNTDOWN",
    "difficulty":"MEDIUM",
    "round":1
}

ESP32 changes state.

---

# Sequence Request

GET

/game/sequence

Response

{
    "round":1,
    "displaySpeed":500,
    "sequence":[
        "RED",
        "GREEN",
        "BLUE",
        "YELLOW"
    ]
}

ESP32 never modifies sequence.

---

# Sequence Display

ESP32 displays

RED

↓

GREEN

↓

BLUE

↓

YELLOW

↓

OFF

Buttons remain disabled.

---

# Input Enabled

After sequence display

Buttons become enabled.

Start Timer.

---

# Input Capture

Player 1

RED

GREEN

BLUE

Player 2

RED

GREEN

YELLOW

ESP32 stores

Button

Timestamp

Player

Order

No validation.

---

# Submit Result

POST

/game/input

Request

{
    "sessionId":"...",
    "round":1,

    "player1":{

        "input":[
            "RED",
            "GREEN",
            "BLUE"
        ],

        "time":2154

    },

    "player2":{

        "input":[
            "RED",
            "GREEN",
            "YELLOW"
        ],

        "time":1983

    }

}

Backend validates.

---

# Backend Response

{
    "roundWinner":1,

    "player1Score":1,

    "player2Score":0,

    "matchFinished":false,

    "nextRound":2
}

ESP32 updates display.

---

# Match Finished

Backend

{
    "matchFinished":true,

    "winner":1,

    "score":"2-1"
}

ESP32

Winner Animation

↓

Buzzer

↓

Reset

↓

Idle

---

# Button Rules

Buttons Disabled

BOOT

WAITING

COUNTDOWN

SHOW_SEQUENCE

Buttons Enabled

PLAYER_INPUT

Buttons Disabled Again

MATCH_RESULT

RESET

---

# LED Rules

BOOT

Rainbow Animation

WAITING

Breathing White

COUNTDOWN

3

2

1

GO

SHOW_SEQUENCE

Display Colors

PLAYER_INPUT

Idle White

ROUND_RESULT

Winner Flash

MATCH_RESULT

Rainbow Celebration

RESET

Fade Out

---

# Buzzer Rules

Boot

Short

Countdown

Beep

Correct

High Tone

Wrong

Low Tone

Winner

Victory Melody

Reset

Short

---

# Time Measurement

Timer Starts

Immediately after

Sequence Finished.

Timer Stops

Last Button Press.

Unit

Milliseconds

---

# Errors

WiFi Lost

Reconnect

Backend Offline

Retry

HTTP Timeout

Retry

Invalid JSON

Ignore

Button Failure

Log Error

Never restart endlessly.

---

# Retry Policy

GET

3 retries

POST

3 retries

Heartbeat

Retry next interval

---

# Configuration

config.h

Contains

WiFi SSID

WiFi Password

Backend URL

Device ID

HTTP Timeout

LED Brightness

---

# Security

Device Secret

Header

X-DEVICE-KEY

Every request

Must include

Device Key

Backend validates.

---

# Future Expansion

Protocol supports

Tournament

Endless

Time Attack

Mirror Mode

without firmware redesign.

---

# AI Instructions

Never generate random sequences.

Never calculate winners.

Never calculate scores.

Never store permanent data.

Always trust Backend.

Keep firmware modular.

Use millis().

Avoid delay().

Use State Machine.

Use Interrupts.

Use classes.

Never place all logic inside main.cpp.