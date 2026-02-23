# ☕ 데일리커피 — 홈카페의 시작

> coffeecg.com 기반 커피 쇼핑몰. 브랜드명: 데일리커피 (Daily Coffee)

## 빠른 시작

```bash
cp .env.example .env
docker-compose up --build
# → http://localhost:3000
```

## 문서

- [프로젝트 개요](docs/00_context/PROJECT_BRIEF.md)
- [아키텍처](docs/00_context/ARCHITECTURE.md)
- [결정 로그](docs/00_context/DECISIONS.md)
- [용어집](docs/00_context/GLOSSARY.md)
- [로컬 개발 환경](docs/02_runbooks/local-dev.md)
- [AI 에이전트 규칙](docs/03_prompts/CLAUDE.md)

## 기술 스택

- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **백엔드**: Node.js 20, Express 5, TypeScript, Prisma
- **데이터베이스**: PostgreSQL 16
- **인프라**: Docker Compose
