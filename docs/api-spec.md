# REST API Specification
Version 1.0

---

# Overview

The Backend exposes REST APIs for

- Frontend
- ESP32
- Admin

Every response must follow the same format.

---

# Response Format

Success

{
    "success": true,
    "message": "OK",
    "data": {}
}

Failure

{
    "success": false,
    "message": "Error Message",
    "errors": []
}

---

# API Version

/api/v1

Example

/api/v1/auth/line

---

# Authentication

Public

POST

/auth/line

Description

Login with LINE.

Request

{
    "code": "LINE_AUTHORIZATION_CODE"
}

Response

{
    "token": "...",
    "player": {}
}

---

GET

/auth/me

Header

Authorization

Bearer Token

Response

Current Player

---

POST

/auth/logout

Invalidate token.

---

# Session

GET

/session

Description

Return current game session.

---

POST

/session/player

Description

Register player into current session.

Request

{
    "playerNumber":1
}

Response

Session

---

POST

/session/difficulty

Description

Select difficulty.

Request

{
    "difficulty":"MEDIUM"
}

Only available before game starts.

---

POST

/session/start

Description

Start Match.

Requirements

2 Players

Difficulty Selected

---

POST

/session/reset

Description

Reset current session.

Admin Only

---

# Game

GET

/game/current

Current game state.

---

GET

/game/sequence

ESP32 requests current sequence.

Response

{
    "sequence":[
        "RED",
        "GREEN",
        "BLUE"
    ],
    "displaySpeed":500
}

---

POST

/game/input

Description

ESP32 submits both players input.

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
        "time":2150
    },
    "player2":{
        "input":[
            "RED",
            "GREEN",
            "YELLOW"
        ],
        "time":1988
    }
}

Response

{
    "winner":1,
    "player1Score":1,
    "player2Score":0,
    "nextRound":2
}

---

GET

/game/result

Return current match result.

---

# Match

GET

/matches

Return all matches.

Pagination

Supported.

---

GET

/matches/:id

Return single match.

Includes

Players

Rounds

Winner

Duration

---

# Leaderboard

GET

/leaderboard

Response

[
    {
        "rank":1,
        "displayName":"John",
        "wins":12,
        "games":15,
        "winRate":80
    }
]

---

# Statistics

GET

/statistics

Return

Games

Rounds

Average Time

Most Played Difficulty

Best Time

---

# History

GET

/history

Return all match history.

Supports pagination.

Supports filtering.

---

# Device

GET

/device/status

ESP32 checks backend.

Response

ONLINE

---

POST

/device/heartbeat

Heartbeat every 30 seconds.

Request

{
    "deviceId":"ESP32-001"
}

---

# Admin

POST

/admin/reset

Description

Delete

Current Session

Match History

Leaderboard Cache

Statistics Cache

Response

Success

---

POST

/admin/export

Description

Export match history.

CSV

JSON

---

GET

/admin/dashboard

Return

Players

Matches

Statistics

Device Status

---

# Health

GET

/health

Return

Database

Socket

Memory

CPU

Uptime

Version

---

# HTTP Status

200

Success

201

Created

400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

500

Internal Error

---

# Validation

Use DTO

Use class-validator

Reject invalid enum

Reject missing fields

Reject invalid UUID

Reject invalid session

---

# Rate Limit

Auth

10/minute

Admin

20/minute

Game

Unlimited

Device

Unlimited

---

# Swagger

Every endpoint must contain

Description

Example Request

Example Response

Validation Rules

Authentication Requirement

Error Response

---

# AI Instructions

Never return raw Prisma models.

Always use DTO.

Always validate requests.

Never expose internal database structure.

Always document new APIs.

Use REST naming conventions.

Keep controllers thin.

Business logic belongs in services.




🔥 ปรับปรุง API ให้รองรับอนาคต

ผมแนะนำให้ ESP32 ไม่เรียกหลาย API ระหว่างเกม

แทนที่จะเป็น

GET /sequence

POST /input

GET /result

GET /next-round

ใช้แค่

POST /game/play

แล้วส่งข้อมูลรอบทั้งหมดทีเดียว เช่น

{
  "sessionId": "...",
  "round": 1,
  "player1": {
    "input": ["RED", "GREEN", "BLUE"],
    "time": 2150
  },
  "player2": {
    "input": ["RED", "GREEN", "YELLOW"],
    "time": 1988
  }
}

Backend จะตอบกลับว่า

{
  "roundWinner": 1,
  "matchScore": {
    "player1": 1,
    "player2": 0
  },
  "matchFinished": false,
  "nextSequence": ["GREEN", "BLUE", "RED"],
  "displaySpeed": 500
}

ข้อดีคือ

ESP32 เรียก API เพียงครั้งเดียวต่อรอบ
ลด Latency
ลดจำนวน Request
Firmware ง่ายขึ้น
ถ้าอนาคตเปลี่ยนกติกา Backend เปลี่ยน Response ได้โดยไม่ต้องเพิ่ม Endpoint ใหม่