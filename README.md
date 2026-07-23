backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── common/
│   ├── config/
│   ├── gateway/
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── game/
│   │   ├── leaderboard/
│   │   ├── line/
│   │   └── player/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
└── AGENTS.md



reflex-arena/

│
├── frontend/
│
├── backend/
│
├── iot/
│
├── docs/
│   ├── api/
│   ├── database/
│   ├── images/
│   ├── circuit/
│   └── meeting/
│
├── docker/
│
├── .gitignore
│
├── README.md
│
└── LICENSE



Tech Stack
Frontend
Next.js 15
React 19
TypeScript
Tailwind CSS v4
shadcn/ui
TanStack Query
Axios
Socket.IO Client
React Hook Form
Zod
Framer Motion
Lucide React
Backend
NestJS
Prisma
PostgreSQL
Socket.IO
Passport
JWT
LINE Login
Swagger
class-validator
Docker (ภายหลัง)
IoT
ESP32 Dev Module
Arduino Framework
HTTP REST API
ArduinoJson
Hardware
ESP32
RGB LED / WS2812B
Push Button × 8
Buzzer
Display



Player
│
├── id
├── lineId
├── displayName
├── pictureUrl
└── createdAt

Game
│
├── id
├── difficulty
├── winnerId
├── loserId
└── createdAt

Round
│
├── id
├── gameId
├── round
├── ledColor
├── winnerId
├── reactionTime
└── createdAt

Statistics
│
├── playerId
├── win
├── lose
├── totalGame
├── bestReaction
└── averageReaction




docs/
├── requirements.md       # รายละเอียดความต้องการของระบบ
├── use-case.md           # Use Case Diagram และคำอธิบาย
├── er-diagram.md         # ER Diagram และโครงสร้างฐานข้อมูล
├── api-spec.md           # เอกสาร REST API
├── sequence-diagram.md   # ลำดับการทำงานของระบบ
├── hardware.md           # รายการอุปกรณ์และการต่อวงจร
├── deployment.md         # วิธีติดตั้งและรันระบบ
└── ui-flow.md            # Flow ของหน้าจอและการใช้งาน



Frontend (Next.js)
        │
Socket.IO / REST
        │
Backend (NestJS)
        │
REST
        │
ESP32




memory-arena/
│
├── apps/
│   ├── frontend/          # Next.js
│   ├── backend/           # NestJS
│   └── firmware/          # ESP32 (PlatformIO)
│
├── packages/
│   └── shared/
│       ├── enums/
│       ├── types/
│       ├── dto/
│       ├── constants/
│       ├── socket/
│       └── api/
│
├── docs/
│   ├── game-spec.md
│   ├── database-spec.md
│   ├── backend-architecture.md
│   ├── game-engine.md
│   ├── api-spec.md
│   ├── socket-spec.md
│   ├── esp32-protocol.md
│   ├── state-machine.md
│   └── coding-standard.md
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── README.md


Project Overview

Architecture

Features

Screenshots

Hardware

Software

Installation

Folder Structure

Tech Stack

API

License

Authors