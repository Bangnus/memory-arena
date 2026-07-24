วิธี Build Docker
Development (มี hot reload)
# 1. เริ่ม services ทั้งหมด
make dev
# 2. รัน database migrations
make db-migrate
# 3. ดู logs
make logs
Production
# 1. Build images
docker compose --env-file .env.docker build
# 2. เริ่ม services
docker compose --env-file .env.docker up -d
# 3. รัน database migrations
docker compose exec backend npx prisma migrate deploy
Manual Commands (ไม่ใช้ Make)
# Development
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
# Production
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
docker compose exec backend npx prisma migrate deploy
ตรวจสอบสถานะ
# ดู containers ที่รันอยู่
docker ps
# ดู logs
docker compose -f docker-compose.dev.yml logs -f
# หยุดทั้งหมด
make stop