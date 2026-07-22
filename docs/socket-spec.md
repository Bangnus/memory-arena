# Socket.IO Specification
Version 1.0

---

# Overview

Socket.IO is responsible for all realtime communication.

Only Backend can emit game events.

Frontend never emits business events.

ESP32 does NOT use Socket.IO.

ESP32 communicates via REST API only.

---

# Namespace

/game

Example

ws://localhost:3001/game

---

# Connection

Client Connected

↓

Authenticate JWT

↓

Join Session Room

↓

Receive Initial State

---

# Rooms

Only one active room.

Example

session:current

Future

session:001

session:002

device:001

admin

---

# Event Naming

Use lowercase.

Use colon separator.

Examples

session:update

countdown:start

round:start

round:end

match:end

leaderboard:update

---

# Session Events

session:update

Description

Current session changed.

Payload

{
    "status":"READY",
    "player1":"John",
    "player2":"Jane",
    "difficulty":"MEDIUM",
    "round":1
}

---

session:reset

Description

Current session deleted.

Payload

{}

---

# Countdown

countdown:start

Payload

{
    "seconds":3
}

Frontend displays

3

2

1

GO

---

# Round

round:start

Payload

{
    "round":1
}

---

sequence:show

Description

Frontend displays sequence.

Payload

{
    "sequence":[
        "RED",
        "GREEN",
        "BLUE"
    ],
    "speed":500
}

The frontend only displays.

Never validates.

---

input:enabled

Payload

{
    "enabled":true
}

---

player:progress

Description

Optional realtime animation.

Payload

{
    "player":1,
    "correct":2
}

---

round:result

Payload

{
    "winner":1,
    "player1Score":1,
    "player2Score":0,
    "nextRound":2
}

---

# Match

match:end

Payload

{
    "winner":{
        "displayName":"John",
        "pictureUrl":"..."
    },
    "score":"2-1",
    "duration":65234
}

---

# Leaderboard

leaderboard:update

Payload

[
    {
        "rank":1,
        "displayName":"John",
        "wins":12
    }
]

---

# History

history:update

Payload

{
    "matchId":"..."
}

---

# Device

device:connected

Payload

{
    "deviceId":"ESP32-001"
}

---

device:disconnected

Payload

{
    "deviceId":"ESP32-001"
}

---

# Admin

admin:reset

Payload

{}

Frontend returns

Waiting Screen

---

# Error

error

Payload

{
    "code":"SESSION_NOT_FOUND",
    "message":"Current session not found."
}

---

# Connection Lifecycle

Connect

↓

Authenticate

↓

Join Room

↓

Receive Session

↓

Receive Events

↓

Disconnect

---

# Event Order

session:update

↓

countdown:start

↓

sequence:show

↓

input:enabled

↓

round:result

↓

session:update

↓

countdown:start

Repeat...

↓

match:end

↓

leaderboard:update

↓

session:reset

---

# Frontend Rules

Frontend never calculates

Winner

Leaderboard

Statistics

Game State

Everything comes from Backend.

---

# Backend Rules

Backend is the only event producer.

Backend owns game state.

Backend validates every event.

---

# AI Instructions

Use Socket.IO Gateway.

Never emit events inside Controllers.

Only Services may emit events.

Keep event names consistent.

Use DTO for every payload.




⭐ ผมอยากปรับอีกจุด (แนะนำมาก)

จากที่ออกแบบทั้งหมด ผมคิดว่า Frontend ไม่ควรมี State ของเกมเอง

เช่น อย่าทำแบบนี้

const [gameState, setGameState] = useState("PLAYING");

แต่ให้ใช้แนวคิดนี้แทน

Backend

↓

Socket.IO

↓

Current Session State

↓

Frontend Render

เช่น Backend ส่ง

{
  "status": "COUNTDOWN"
}

Frontend ก็ Render หน้า Countdown

ถ้าส่ง

{
  "status": "SHOW_SEQUENCE"
}

Frontend ก็ Render Sequence

ถ้าส่ง

{
  "status": "MATCH_RESULT"
}

Frontend ก็ Render Winner

ข้อดี
Frontend ไม่มี Business Logic
Refresh หน้าเว็บแล้วกลับมาที่สถานะปัจจุบันได้
ลด Bug เรื่อง State ไม่ตรงกัน
รองรับหลายหน้าจอได้ในอนาคต