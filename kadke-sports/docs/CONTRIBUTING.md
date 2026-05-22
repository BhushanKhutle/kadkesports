# Contributing — Kadke Sports

## Dev setup
```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis minio
pnpm --filter backend prisma migrate dev
pnpm --filter backend prisma db seed
pnpm dev   # runs frontend & backend in parallel
```

## Conventions

- **Branches**: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`
- **Commits**: Conventional Commits — `feat(cart): apply coupon at checkout`
- **PRs**: target `develop`; squash-merge to `main` triggers prod deploy
- **Tests**: every new module gets a `*.spec.ts` unit test; critical flows get an `*.e2e-spec.ts`
- **Code style**: Prettier + ESLint (Nest preset). Run `pnpm lint` before pushing.
- **DB changes**: always via `prisma migrate dev` — never edit migrations by hand.

## Module template (NestJS)
```
src/modules/<feature>/
  ├── <feature>.module.ts
  ├── <feature>.controller.ts
  ├── <feature>.service.ts
  ├── <feature>.dto.ts
  └── <feature>.service.spec.ts
```

Inject `PrismaService` for DB. Use `@Public()` for public routes, `@Roles(Role.ADMIN)` for admin.

## Frontend conventions

- **Server Components by default**; mark interactive ones `'use client'`
- Use `next/image` for all images
- Style with Tailwind utilities; avoid inline styles
- Keep components small (<150 LOC) and colocate per route

## Release

```bash
# Bump version (Helm + package.json)
pnpm version <patch|minor|major>
git tag v$(node -p "require('./package.json').version")
git push --tags
```
