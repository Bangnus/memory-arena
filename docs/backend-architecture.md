# Backend Architecture
Version 1.0

---

# Overview

The Backend is the Game Controller.

It is the single source of truth.

All business logic must exist only in the backend.

The backend communicates with

- Next.js Frontend
- ESP32 Firmware
- PostgreSQL

Communication

Frontend

↓

REST API

↓

NestJS

↓

Socket.IO

↓

Frontend

ESP32

↓

REST API

↓

NestJS

↓

Response

---

# Responsibilities

Backend owns

- LINE Login
- JWT
- Session Management
- Memory Sequence
- Round Logic
- Match Logic
- Winner Calculation
- Leaderboard
- Statistics
- Admin
- Socket.IO

Backend never

Display UI

Control LEDs

Read Buttons

Play Sounds

---

# Project Structure

src/

    app.module.ts

    main.ts

    common/

        constants/

        decorators/

        dto/

        enums/

        exceptions/

        filters/

        guards/

        interceptors/

        interfaces/

        pipes/

        utils/

    config/

        app.config.ts

        auth.config.ts

        database.config.ts

        game.config.ts

    database/

        prisma/

            prisma.module.ts

            prisma.service.ts

    modules/

        auth/

        player/

        session/

        game/

        match/

        leaderboard/

        history/

        admin/

        socket/

---

# Module Responsibilities

Auth

LINE Login

JWT

Authentication

----------------------------------

Player

Player Profile

Player Information

----------------------------------

Session

Current Game

Players Ready

Difficulty

Current State

----------------------------------

Game

Sequence Generator

Round Validation

Winner

Score

Game Engine

----------------------------------

Match

Save Finished Match

History

----------------------------------

Leaderboard

Statistics

Ranking

----------------------------------

History

Match History

----------------------------------

Admin

Reset

Export

Dashboard

----------------------------------

Socket

Realtime Events

---

# Dependency Flow

Controller

↓

Service

↓

Prisma

Never skip layers.

Never access Prisma directly inside Controllers.

---

# State Machine

WAITING

↓

LOGIN

↓

READY

↓

COUNTDOWN

↓

SHOW_SEQUENCE

↓

PLAYER_INPUT

↓

ROUND_RESULT

↓

NEXT_ROUND

↓

MATCH_RESULT

↓

RESET

↓

WAITING

The Session module controls the current state.

Only SessionService can change state.

---

# Session Rules

Only one active session.

Players

Exactly two.

Difficulty

Selected once.

Cannot change during match.

Session deleted after match.

---

# Game Flow

Create Session

↓

Player1 Login

↓

Player2 Login

↓

Select Difficulty

↓

Countdown

↓

Generate Sequence

↓

Send Sequence to ESP32

↓

ESP32 Displays

↓

ESP32 Receives Inputs

↓

Submit Inputs

↓

Backend Validation

↓

Round Result

↓

Repeat

↓

Match Finished

↓

Save Match

↓

Delete Session

---

# Sequence Generator

Backend generates sequence.

Never use client-generated sequence.

Possible Colors

RED

GREEN

BLUE

YELLOW

Sequence Length

Easy

3

Medium

4

Hard

6

Random Algorithm

Use secure random.

Never repeat predictable patterns.

---

# Winner Calculation

Rule

Correct Sequence

↓

Completion Time

↓

Winner

If only one player is correct

That player wins.

If both wrong

Restart Round.

---

# Validation Flow

Receive Inputs

↓

Validate Length

↓

Validate Order

↓

Validate Time

↓

Determine Winner

↓

Update Score

↓

Broadcast Result

---

# Best of 3

Player1 Wins

2

↓

Finish

OR

Player2 Wins

2

↓

Finish

Maximum Rounds

3

---

# Socket.IO Events

Client Connected

↓

session:update

↓

countdown:start

↓

sequence:show

↓

player:progress

↓

round:finished

↓

match:finished

↓

leaderboard:update

↓

system:reset

---

# REST APIs

Authentication

/auth/line

Player

/player/me

Session

/session

/session/login

/session/start

/session/reset

Game

/game/sequence

/game/input

/game/result

Match

/match

/match/:id

Leaderboard

/leaderboard

History

/history

Admin

/admin/reset

/admin/export

---

# Error Handling

Use NestJS Exceptions.

400

Bad Request

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

500

Internal Server Error

Never return plain strings.

---

# Transactions

Use Prisma Transaction

Create Match

↓

Create MatchPlayers

↓

Create Rounds

↓

Delete Session

Commit together.

Rollback on failure.

---

# DTO Rules

Every request

Must use DTO.

Validation

class-validator

Never accept raw objects.

---

# Services

Every module

Controller

↓

Service

↓

Repository (Prisma)

Keep services small.

One responsibility only.

---

# Logging

NestJS Logger

Log

Login

Session

Round

Match

Admin

Errors

Never log JWT.

Never log secrets.

---

# Configuration

Environment Variables

DATABASE_URL

JWT_SECRET

LINE_CHANNEL_ID

LINE_CHANNEL_SECRET

LINE_CALLBACK_URL

FRONTEND_URL

DEVICE_SECRET

APP_PORT

---

# Security

Validate every request.

Sanitize every input.

Protect Admin routes.

Never expose internal errors.

JWT required for protected APIs.

---

# API Version

/api/v1

Future versions

/api/v2

---

# Health Check

/health

Returns

Database

Socket

Memory

Uptime

---

# Shutdown

Graceful Shutdown

Close Socket

Close Prisma

Stop accepting requests.

---

# Development Order

1

Database

↓

2

Prisma

↓

3

Auth

↓

4

Session

↓

5

Game

↓

6

Socket

↓

7

Leaderboard

↓

8

History

↓

9

Admin

---

# AI Instructions

Always explain

Folder

Files

Responsibilities

before writing code.

Generate production-ready NestJS.

Follow SOLID.

Follow Clean Architecture.

Never place business logic inside controllers.

Backend is always the Game Controller.




🔥 ผมมีข้อเสนอปรับสถาปัตยกรรมให้ "มืออาชีพ" ขึ้นอีก

หลังจากออกแบบทั้งหมด ผมคิดว่า Game Module ไม่ควรเป็น Service เดียว

ให้แยกเป็น Engine เลย

modules/game/

game.controller.ts

game.module.ts

services/

    game.service.ts

    game-engine.service.ts ⭐

    sequence.service.ts

    validator.service.ts

    scoring.service.ts

    timer.service.ts

    state-machine.service.ts ⭐

dto/

interfaces/

types/

constants/
หน้าที่แต่ละ Service
game-engine.service.ts → ควบคุมการไหลของเกมทั้งหมด
sequence.service.ts → สร้างลำดับสี
validator.service.ts → ตรวจว่าผู้เล่นกดถูกหรือผิด
scoring.service.ts → คิดคะแนนและผู้ชนะ
timer.service.ts → จัดการเวลาและ Timeout
state-machine.service.ts → จัดการ State ของเกม (WAITING → LOGIN → READY → ...)