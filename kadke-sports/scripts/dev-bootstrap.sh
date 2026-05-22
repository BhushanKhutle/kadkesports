#!/usr/bin/env bash
# Kadke Sports — dev bootstrap
set -e

echo "🏏 Kadke Sports — dev bootstrap"

if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not installed. Install: npm i -g pnpm@8"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 Created .env from example — review JWT secrets and Razorpay keys."
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Postgres + Redis + MinIO..."
docker compose up -d postgres redis minio minio-bucket-init

echo "⏳ Waiting for Postgres..."
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-kadke}" >/dev/null 2>&1; do
  sleep 1
done

echo "🗄  Running Prisma migrations..."
pnpm --filter backend prisma migrate deploy

echo "🌱 Seeding database..."
pnpm --filter backend prisma db seed

echo ""
echo "✅ Done!"
echo ""
echo "   Run:  pnpm dev"
echo ""
echo "   Frontend → http://localhost:3000"
echo "   API      → http://localhost:4000/api"
echo "   Swagger  → http://localhost:4000/api/docs"
echo "   MinIO    → http://localhost:9001  (minioadmin / minioadmin)"
echo ""
echo "   Admin → admin@kadkesports.com / Admin@123"
echo "   User  → user@kadkesports.com  / User@123"
