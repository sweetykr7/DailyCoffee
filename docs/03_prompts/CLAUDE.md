# CLAUDE.md — AI Agent Rules for DailyCoffee Project

> This file is the **contract** between the AI agent and this codebase.
> Read this FIRST before touching any file. No exceptions.

---

## 🎯 Project in One Line

**DailyCoffee** = 커피 온라인 쇼핑몰 (coffeecg.com 클론, 브랜드명만 변경)
Full-stack e-commerce: Next.js frontend + Express/Node.js backend + PostgreSQL + Docker Compose

---

## 📍 Key Paths

| What | Path |
|------|------|
| Project brief | `docs/00_context/PROJECT_BRIEF.md` |
| Architecture | `docs/00_context/ARCHITECTURE.md` |
| Decisions log | `docs/00_context/DECISIONS.md` |
| Glossary | `docs/00_context/GLOSSARY.md` |
| Feature specs | `docs/01_specs/` |
| Local dev guide | `docs/02_runbooks/local-dev.md` |
| Frontend source | `src/frontend/` |
| Backend source | `src/backend/` |

---

## ⚙️ Tech Stack (FIXED — do not change without updating DECISIONS.md)

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express 5, TypeScript
- **Database**: PostgreSQL 16 (via Docker)
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens), bcrypt
- **File Storage**: Local (Docker volume) → swap to S3 in prod
- **Container**: Docker Compose (3 services: frontend, backend, db)
- **Package Manager**: pnpm (both front and back)

---

## 📐 Coding Rules

### General
- **Language**: TypeScript everywhere. No `any` without a comment explaining why.
- **Naming**: camelCase (variables/functions), PascalCase (components/classes), SCREAMING_SNAKE (env vars)
- **Korean/English**: UI strings in Korean, code/variables in English
- **Error handling**: Always handle errors explicitly. No silent catches.
- **Comments**: Explain *why*, not *what*. Korean comments are fine.

### Frontend (Next.js)
- App Router only. No Pages Router.
- Server Components by default; Client Components only when needed (mark with `'use client'`)
- Tailwind for styling. No inline styles. No CSS modules unless Tailwind falls short.
- Fetch from backend via `src/frontend/lib/api.ts` — centralized API client
- All pages must be responsive (mobile-first)
- Images: use `next/image` always
- Forms: React Hook Form + Zod validation

### Backend (Express)
- Route files in `src/backend/src/routes/`
- Controllers in `src/backend/src/controllers/`
- Services in `src/backend/src/services/` (business logic lives here)
- Middleware in `src/backend/src/middleware/`
- All routes return `{ success: boolean, data?: any, error?: string }`
- Validate all request bodies with Zod
- Use Prisma for all DB queries — no raw SQL unless performance-critical

### Database
- Migrations via Prisma (`pnpm prisma migrate dev`)
- Seed data in `src/backend/prisma/seed.ts`
- Never delete migration files

---

## 🚫 Forbidden

- No `console.log` in production code (use proper logger)
- No hardcoded secrets or URLs — use `.env`
- No `any` without justification
- No skipping error handling
- No direct DB queries in routes (use services)
- Don't break Docker Compose — test before committing

---

## ✅ Before Every Commit

1. TypeScript compiles without errors
2. No obvious runtime errors
3. Docker services start (`docker-compose up`)
4. Update relevant spec/runbook if you changed something significant

## 🚀 Git Push 규칙

- **기능 단위로 커밋 + push** — 한 번에 다 하지 말고, 완성된 기능마다 바로
- `git push origin main` 커밋 직후 실행 (post-commit hook이 자동으로 push함)
- Push 순서 예시:
  1. `feat(infra): docker-compose` → push
  2. `feat(backend): prisma schema` → push
  3. `feat(backend): auth routes` → push
  4. `feat(backend): product routes` → push
  5. `feat(frontend): layout components` → push
  6. `feat(frontend): home page` → push
  7. ... 계속

---

## 🔄 Resuming Work

If you're starting a new session:
1. Read `docs/00_context/PROJECT_BRIEF.md`
2. Read `docs/00_context/ARCHITECTURE.md`
3. Check `docs/00_context/DECISIONS.md` for recent decisions
4. Run `docker-compose up` and verify everything starts
5. Continue from where you left off

---

## 💬 Communication Style

- Commit messages: `type(scope): description` (e.g., `feat(cart): add quantity update`)
- When stuck: document the problem in `docs/00_context/DECISIONS.md` before trying alternatives
- When making a non-obvious decision: log it in DECISIONS.md
