# Memory Arena

A two-player IoT memory game built for exhibition and portfolio purposes.

## Project Overview

Players authenticate using LINE Login via a Next.js web application. The game hardware is controlled by an ESP32 running Arduino Framework with PlatformIO. Backend services are implemented using NestJS and PostgreSQL.

## Game Rules & Mechanics (กติกาการเล่นเกม)

Memory Battle is a fast-paced cognitive arcade game supporting **4 colors** (แดง / Red, เขียว / Green, น้ำเงิน / Blue, เหลือง / Yellow) played in a **Best of 3** rounds match format.

### Difficulty Modes (ระดับความยาก)
Adjustable using physical control buttons before starting a game:
* **Easy:** Sequence of 3 steps, flashing at 1.0s interval.
* **Medium:** Sequence of 4 steps, flashing at 0.75s interval.
* **Hard:** Sequence of 6 steps, flashing at 0.5s interval.

### Round Rules & Edge Cases (เงื่อนไขและกรณีพิเศษ)
1. **Sequence Phase:** Players must watch the sequence and cannot input answers. Button presses during this phase are ignored.
2. **Input Phase:** Once sequence display is complete, players reproduce the exact color sequence. Instant LED feedback glows when pressing buttons.
3. **Winner Decision (Tie Breaker):** If both players enter the correct sequence, **the player who finished the sequence faster wins the round** (calculated in milliseconds).
4. **Instant Strike Out:** If a player inputs a wrong color, they immediately lose the round.
5. **No Input / Timeout:** Players have **15 seconds** to input. If the timer expires or both players input incorrectly (Double Fault), the round is voided and restarted with a new sequence.
6. **Early Termination:** If one player inputs the correct sequence and has guaranteed a win, the round finishes immediately without waiting for the slower player.
7. **Game Reset (Restart):** Pressing the physical **RESTART** button immediately clears the active session and redirects the web interface to the login screen for a fresh start.

## Architecture

```
Frontend (Next.js)
        │
Socket.IO / REST
        │
Backend (NestJS)
        │
REST
        │
ESP32
```

## Tech Stack

### Frontend
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Socket.IO Client

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT + LINE Login
- Swagger

### IoT
- ESP32 Dev Module
- Arduino Framework
- PlatformIO

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PlatformIO (for IoT development)

### Development with Docker

1. Clone the repository
```bash
git clone <repository-url>
cd Memory-Battle
```

2. Start development environment
```bash
make dev
```

3. Run database migrations
```bash
make db-migrate
```

4. Access the application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Swagger docs: http://localhost:3000/api

### Production with Docker

1. Create environment file
```bash
cp .env.docker .env
# Edit .env with your production values
```

2. Start production environment
```bash
make start
```

## Docker Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment |
| `make start` | Start production environment |
| `make stop` | Stop all containers |
| `make restart` | Restart all containers |
| `make logs` | View logs |
| `make build` | Build all images |
| `make clean` | Remove all containers and volumes |
| `make db-reset` | Reset database |
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed database |

## Folder Structure

```
Memory-Battle/
├── apps/
│   ├── frontend/          # Next.js 15
│   ├── backend/           # NestJS + Prisma
│   └── iot/               # ESP32 PlatformIO
├── packages/
│   └── shared/            # Shared types, DTOs, constants
├── docs/                  # Documentation
├── docker-compose.yml     # Production Docker
├── docker-compose.dev.yml # Development Docker
├── Makefile               # Docker commands
└── README.md
```

## Environment Variables

See `.env.docker` for available configuration options.

## License

MIT

## Authors

Nus Peerapat
