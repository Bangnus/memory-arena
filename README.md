# Memory Arena

A two-player IoT memory game built for exhibition and portfolio purposes.

## Project Overview

Players authenticate using LINE Login via a Next.js web application. The game hardware is controlled by an ESP32 running Arduino Framework with PlatformIO. Backend services are implemented using NestJS and PostgreSQL.

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
