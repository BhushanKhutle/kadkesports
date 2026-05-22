# 🏏 Kadke Sports — Enterprise Ecommerce Platform

A production-ready, cloud-native, 3-tier ecommerce platform for a premium Indian sports brand.

```
┌──────────────────────────────────────────────────────────────┐
│  Presentation Tier  │  Application Tier  │  Data Tier        │
│  Next.js 15 + React │  NestJS + Prisma   │  PostgreSQL       │
│  Tailwind + Framer  │  REST + Swagger    │  Redis (cache)    │
│  Redux Toolkit      │  JWT + RBAC        │  MinIO (objects)  │
└──────────────────────────────────────────────────────────────┘
                        Kubernetes (EKS / DOKS / k3s / Minikube)
```

## 📦 Tech Stack

| Layer            | Stack                                                       |
| ---------------- | ----------------------------------------------------------- |
| **Frontend**     | Next.js 15, React 18, TypeScript, Tailwind, Framer Motion   |
| **State**        | Redux Toolkit, RTK Query, Zustand (UI state)                |
| **Backend**      | NestJS 10, TypeScript, Prisma 5, REST, OpenAPI/Swagger      |
| **Database**     | PostgreSQL 16, Prisma ORM                                   |
| **Cache**        | Redis 7                                                     |
| **Storage**      | MinIO (S3-compatible)                                       |
| **Payments**     | Razorpay                                                    |
| **Auth**         | JWT (access + refresh), Google OAuth, RBAC                  |
| **DevOps**       | Docker, Kubernetes, Helm, GitHub Actions, Kustomize         |
| **Observability**| Prometheus, Grafana, Loki, Fluent Bit                       |
| **Testing**      | Jest, Supertest, Playwright                                 |

## 🗂️ Monorepo Structure

```
kadke-sports/
├── apps/
│   ├── frontend/          # Next.js 15 storefront + admin
│   └── backend/           # NestJS API + Prisma
├── packages/
│   ├── ui/                # Shared UI primitives
│   └── config/            # Shared eslint/tsconfig
├── k8s/                   # Raw Kubernetes manifests (Kustomize)
│   ├── base/
│   └── overlays/
│       ├── dev/
│       └── prod/
├── helm/                  # Helm charts (production deploy)
│   └── kadke-sports/
├── .github/workflows/     # CI/CD pipelines
├── scripts/               # Dev / deploy helpers
├── docs/                  # Architecture, API, deployment guides
└── docker-compose.yml     # Local full-stack environment
```

## 🚀 Quick Start

### 1. Local dev with Docker Compose
```bash
git clone <repo>
cd kadke-sports
cp .env.example .env
docker compose up -d
# Frontend → http://localhost:3000
# Backend  → http://localhost:4000  (Swagger at /api/docs)
# MinIO    → http://localhost:9001
# Postgres → localhost:5432
```

### 2. Local dev without Docker
```bash
# Install deps
pnpm install

# Backend
cd apps/backend
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev

# Frontend (new terminal)
cd apps/frontend
pnpm dev
```

### 3. Deploy to Kubernetes
```bash
# Minikube / k3s / EKS / DOKS
helm install kadke ./helm/kadke-sports -n kadke --create-namespace
# Or via Kustomize
kubectl apply -k k8s/overlays/prod
```

## 🏗️ Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design, request flow, scaling story, and security model.

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing](docs/CONTRIBUTING.md)

## 🛡️ Features

**Storefront**
- Responsive mobile-first UI with dark/light mode
- Product search, filters, sorting, related products
- Cart, wishlist, checkout with Razorpay
- Reviews & ratings
- SEO: sitemap, robots.txt, OpenGraph, structured data
- Google OAuth + email/password login

**Admin Panel**
- Product/category CRUD with image uploads
- Inventory & order management
- Coupon engine
- Analytics dashboard
- Audit logs

**Platform**
- JWT auth + refresh tokens + RBAC
- Helmet, rate limiting, input validation, XSS/SQLi protection
- Horizontal Pod Autoscaling (HPA)
- Prometheus metrics + Grafana dashboards
- Centralized logs (Loki + Fluent Bit)
- Health & readiness probes
- Rolling updates with zero downtime

## 📜 License

MIT
