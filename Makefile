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
