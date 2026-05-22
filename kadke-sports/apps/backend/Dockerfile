# ─── Stage 1: Build ──────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN apk add --no-cache openssl libc6-compat

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ─── Stage 2: Production ─────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache curl tini openssl libc6-compat && \
    addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER nodeusr
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/main.js"]
