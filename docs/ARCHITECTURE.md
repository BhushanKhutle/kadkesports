# Kadke Sports — Architecture

## 1. System Overview

Kadke Sports is a 3-tier cloud-native ecommerce platform:

```
                   ┌──────────────────┐
   Users  ────►    │   NGINX Ingress  │  ───►  TLS termination, routing
                   └────────┬─────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│  Frontend  │      │  Backend   │      │   MinIO    │
│  Next.js   │◄────►│  NestJS    │◄────►│  S3 store  │
│  (3 pods)  │      │  (3 pods)  │      └────────────┘
└────────────┘      └─────┬──────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌──────────┐
        │Postgres │ │  Redis  │ │ Razorpay │
        │  (STS)  │ │ (cache) │ │ (extern) │
        └─────────┘ └─────────┘ └──────────┘
```

## 2. Tiers

### Presentation Tier — Next.js 15 (App Router)
- Server Components for SEO-critical pages (PLP, PDP, home)
- Client Components for interactive widgets (cart, checkout, search)
- ISR (Incremental Static Regeneration) for product pages — 60s revalidation
- Image optimization via `next/image` + MinIO CDN
- Tailwind + Framer Motion for visuals
- Redux Toolkit for global state (cart, user, wishlist)

### Application Tier — NestJS
- Modular monolith — each domain (auth, products, orders, ...) is a NestJS module
- Prisma as the data-access layer
- Class-validator + class-transformer for DTO validation
- Swagger/OpenAPI auto-generated at `/api/docs`
- BullMQ workers for async jobs (email, image processing) — optional
- Stateless: any pod can serve any request

### Data Tier
- **PostgreSQL** — single source of truth. Deployed as StatefulSet with PVC.
- **Redis** — session + product/category cache. TTL-based invalidation + pub/sub for cache busts.
- **MinIO** — product images and user uploads. S3 API compatible.

## 3. Request Flow (PDP example)

```
Browser  ──GET /product/cricket-bat-pro──►  Ingress
                                            │
                                            ▼
                                       Next.js pod (server component)
                                            │
                                            ▼ axios
                                       NestJS pod (GET /products/:slug)
                                            │
                                  ┌─────────┴────────┐
                                  ▼                  ▼
                            Redis cache?      → MISS → Postgres
                                  │                  │
                                  ▼                  ▼
                            Return product      Cache & return
```

## 4. Security

| Concern              | Control                                                   |
| -------------------- | --------------------------------------------------------- |
| Authentication       | JWT access (15min) + refresh (7d) rotated on each refresh |
| Authorization        | RBAC via `@Roles()` guard; `USER` / `ADMIN`              |
| Transport            | TLS at ingress; mTLS optional via service mesh           |
| Input validation     | class-validator on every DTO                              |
| SQL injection        | Prisma parameterized queries (no raw SQL in app code)    |
| XSS                  | React auto-escaping + Helmet CSP headers                  |
| Rate limiting        | Nest Throttler (100 req/min/IP global, stricter on auth)  |
| Secrets              | Kubernetes Secrets (sealed-secrets in prod)               |
| Password storage     | bcrypt (12 rounds)                                        |
| Payments             | Razorpay-hosted; server verifies signature                |

## 5. Scaling

- **Horizontal**: HPA on CPU + RPS for frontend & backend (min 2, max 20 pods)
- **Vertical**: VPA recommendations for stateful workloads
- **Cache**: Redis cluster mode in prod
- **DB**: Read replicas via Patroni/Crunchy; Prisma `replicaUrl` driver
- **Static assets**: CloudFront / Cloudflare in front of MinIO bucket

## 6. Observability

```
┌─────────┐ scrape metrics  ┌────────────┐
│ Pods    │ ──────────────► │ Prometheus │ ─► Grafana
└─────────┘                 └────────────┘
                                                     ┌─────────┐
┌─────────┐  stdout         ┌────────────┐           │ Grafana │
│ Pods    │ ──────────────► │ Fluent Bit │ ─► Loki ──┤  panels │
└─────────┘                 └────────────┘           └─────────┘
```

- `/health` (liveness), `/health/ready` (readiness) on backend & frontend
- `/metrics` Prometheus endpoint exposed on each pod
- Structured JSON logs with correlation IDs
- Dashboards: API latency p95/p99, error rate, DB pool, cache hit rate, business KPIs (orders/min, revenue)

## 7. Resilience

- Liveness + readiness probes
- PodDisruptionBudget (min 2 available)
- Rolling updates: maxSurge=1, maxUnavailable=0
- Graceful shutdown (NestJS `enableShutdownHooks`)
- Circuit breaker on Razorpay calls (opossum)
- Retries with exponential backoff on transient DB errors

## 8. CI/CD

```
git push ──► GitHub Actions
              ├─ lint
              ├─ test (jest + supertest)
              ├─ build images (frontend, backend)
              ├─ push to GHCR
              └─ deploy
                  ├─ dev: auto on develop
                  └─ prod: manual approval on main
```
