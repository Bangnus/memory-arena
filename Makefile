.PHONY: help dev start stop restart logs build clean db-reset db-migrate db-seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up -d

start: ## Start production environment
	docker compose --env-file .env.docker up -d

stop: ## Stop all containers
	docker compose -f docker-compose.dev.yml down
	docker compose down

restart: ## Restart all containers
	$(MAKE) stop
	$(MAKE) start

logs: ## View logs
	docker compose -f docker-compose.dev.yml logs -f

build: ## Build all images
	docker compose -f docker-compose.dev.yml build

clean: ## Remove all containers and volumes
	docker compose -f docker-compose.dev.yml down -v
	docker compose down -v
	docker system prune -f

db-reset: ## Reset database
	docker compose -f docker-compose.dev.yml exec backend npx prisma migrate reset --force

db-migrate: ## Run database migrations
	docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

db-seed: ## Seed database
	docker compose -f docker-compose.dev.yml exec backend npx prisma db seed

frontend-logs: ## View frontend logs
	docker compose -f docker-compose.dev.yml logs -f frontend

backend-logs: ## View backend logs
	docker compose -f docker-compose.dev.yml logs -f backend

db-logs: ## View database logs
	docker compose -f docker-compose.dev.yml logs -f postgres

run-local: ## Run NestJS + Next.js locally on Windows in development mode (DB & Ngrok in Docker, apps locally)
	docker compose up -d postgres ngrok --no-deps
	cd apps/backend && npx prisma migrate deploy
	cmd.exe /c start cmd /k "echo Starting Backend... && cd apps/backend && npm run start:dev"
	cmd.exe /c start cmd /k "echo Starting Frontend... && cd apps/frontend && npm run dev"

run-local-prod: ## Build & Run NestJS + Next.js locally on Windows in production mode (Fresh DB reset & clean start)
	docker compose up -d postgres ngrok --no-deps
	cd apps/backend && npx prisma migrate reset --force && npm run build
	cd apps/frontend && npm run build
	cmd.exe /c start cmd /k "echo Starting Backend (Production)... && cd apps/backend && npm run start:prod"
	cmd.exe /c start cmd /k "echo Starting Frontend (Production)... && cd apps/frontend && npm run start"

status: ## Check the status of all local services
	@powershell -Command "Write-Host '=== Services Status ===' -ForegroundColor Cyan; Write-Host '1. Database (Postgres): ' -NoNewline; if (docker compose ps postgres --format json 2>$$null | Select-String 'running') { Write-Host 'RUNNING' -ForegroundColor Green } else { Write-Host 'STOPPED' -ForegroundColor Red }; Write-Host '2. Backend (Port 3000): ' -NoNewline; if (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) { Write-Host 'RUNNING' -ForegroundColor Green } else { Write-Host 'STOPPED' -ForegroundColor Red }; Write-Host '3. Frontend (Port 3001): ' -NoNewline; if (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue) { Write-Host 'RUNNING' -ForegroundColor Green } else { Write-Host 'STOPPED' -ForegroundColor Red }; Write-Host '4. Ngrok (Port 4040):    ' -NoNewline; if (Get-NetTCPConnection -LocalPort 4040 -ErrorAction SilentlyContinue) { Write-Host 'RUNNING' -ForegroundColor Green } else { Write-Host 'STOPPED' -ForegroundColor Red }; Write-Host '=======================' -ForegroundColor Cyan"
