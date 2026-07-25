# AGENTS.md

# Memory Arena Backend

## Overview

This package contains the backend services for Memory Arena.

Backend is the source of truth for the entire system.

Frontend and IoT must never implement business logic.

Backend is responsible for

- Authentication
- Authorization
- Session Management
- Game Engine
- Match Result
- Leaderboard
- Statistics
- Database
- Realtime Communication

---

# Technology Stack

Framework

- NestJS

Language

- TypeScript

ORM

- Prisma

Database

- PostgreSQL

Authentication

- LINE Login
- JWT

Realtime

- Socket.IO

Validation

- class-validator
- class-transformer

Configuration

- @nestjs/config

Documentation

- Swagger

---

# Architecture

Use Domain-Based Structure.

```

src/

modules/

auth/

game/

player/

leaderboard/

history/

admin/

common/

config/

database/

prisma/

socket/

```

Never organize by file type.

Never create folders like

controllers/

services/

dto/

at root level.

Everything belongs inside its module.

---

# Responsibilities

Backend owns

Authentication

Game Session

Memory Sequence

Winner Calculation

Score

Best of 3

Statistics

Leaderboard

Database

Realtime Events

IoT Communication

Frontend Communication

Backend NEVER

renders UI

stores hardware state permanently

controls LEDs

reads hardware buttons

---

# Module Responsibilities

Auth

- LINE Login
- JWT
- Access Token
- Logout

Player

- Profile
- Statistics
- Avatar
- Display Name

Game

- Session
- Match
- Round
- Sequence
- Difficulty
- Winner

Leaderboard

- Ranking
- Wins
- Average Time
- Best Time

History

- Match History

Admin

- Reset
- Dashboard
- Export

Socket

- Realtime Events

---

# Game Rules

Game Type

Memory Battle

Players

2

Match

Best of 3

Difficulty

Easy

Medium

Hard

Difficulty affects only

Sequence Length

Display Speed

Backend generates the sequence.

IoT must never generate sequence independently.

Backend is always source of truth.

---

# Match Flow

Create Session

↓

Player Login

↓

Player Ready

↓

Difficulty Selected

↓

Generate Sequence

↓

Send Sequence to ESP32

↓

Notify Frontend

↓

Receive Player Results

↓

Determine Winner

↓

Update Score

↓

Repeat Until Winner

↓

Save Match

↓

Update Leaderboard

↓

Broadcast Result

---

# Memory Sequence

Use server-side random generation.

Store generated sequence.

Never regenerate during same round.

Possible colors

RED

BLUE

GREEN

YELLOW

---

# Round Rules

Correct Sequence

Round Win

Wrong Sequence

Immediate Round Lose

Both Wrong

Restart Round

No Input

Restart Round

---

# Difficulty

Easy

Sequence Length

3

Display Speed

800ms

Medium

Sequence Length

4

Display Speed

500ms

Hard

Sequence Length

6

Display Speed

300ms

---

# REST API

Use REST for

Authentication

CRUD

History

Leaderboard

Admin

Statistics

Never use REST for realtime game updates.

---

# Socket.IO

Socket Events

game:start

game:countdown

game:sequence

game:round-result

game:score

game:finished

leaderboard:update

admin:reset

Never poll for realtime data.

---

# IoT Communication

ESP32 communicates through REST API.

Example

POST

/game/round

POST

/game/start

GET

/game/session

GET

/game/sequence

Backend validates every request.

---

# Authentication

Only LINE Login.

No username/password.

Issue JWT.

Store Player.

Auto Logout after game.

---

# JWT

Access Token only.

Never expose secrets.

Never hardcode JWT secret.

---

# Database

Prisma ORM

Never use raw SQL unless necessary.

Always use Prisma Client.

---

# Prisma Models

Player

Game

Round

Leaderboard

Session

Statistics

AdminLog

---

# DTO

Every request

must use DTO.

Never accept plain object.

Always validate.

---

# Validation

class-validator

Examples

IsUUID

IsEnum

IsString

IsBoolean

Min

Max

Never trust client input.

---

# Error Handling

Throw NestJS Exceptions.

BadRequestException

UnauthorizedException

ForbiddenException

NotFoundException

ConflictException

InternalServerErrorException

Never return plain strings.

---

# Logging

Use NestJS Logger.

Log

Game Start

Game End

Login

Admin Reset

Errors

Never log secrets.

---

# Environment Variables

DATABASE_URL

JWT_SECRET

LINE_CHANNEL_ID

LINE_CHANNEL_SECRET

LINE_CALLBACK_URL

FRONTEND_URL

Never hardcode values.

---

# Services

Keep services small.

One responsibility.

Never create God Service.

---

# Controllers

Controllers

only

Validate

Call Service

Return Response

No business logic.

---

# Repository

Use Prisma Service.

Avoid duplicate queries.

---

# Constants

Create

constants/

game.ts

socket.ts

difficulty.ts

colors.ts

api.ts

---

# Enums

Difficulty

Color

RoundStatus

MatchStatus

PlayerStatus

SocketEvent

Never use string literals repeatedly.

---

# Naming

Modules

PascalCase

Files

kebab-case

DTO

SomethingDto

Entities

SomethingEntity

---

# Swagger

Every endpoint

must have

Summary

Description

Response

DTO

Example

---

# Testing

Design services for unit testing.

Use dependency injection.

Avoid static functions.

---

# Admin

Route

/admin

Features

Reset Leaderboard

Reset Statistics

Delete Match History

Delete Sessions

Export CSV

Export JSON

Admin Logs

Never expose admin routes publicly.

---

# Statistics

Store

Wins

Losses

Games Played

Best Time

Average Time

Perfect Games

Fastest Round

Longest Match

---

# Leaderboard

Sort by

Wins

Then

Best Average Time

Realtime update via Socket.IO.

---

# Reset

Admin reset removes

Game Sessions

Leaderboard

Statistics

History

Players remain.

---

# AI Instructions

Before generating code

1. Read root AGENTS.md
2. Follow Domain-Based Structure
3. Keep services modular
4. Use DTO everywhere
5. Use Prisma
6. Backend owns business logic
7. Never move logic to frontend
8. Never move logic to ESP32

Always generate production-ready NestJS code.