# LOCAL DEV — DailyCoffee

## 필요 환경
- Docker Desktop (최신)
- Node.js 20+
- pnpm (`npm i -g pnpm`)

## 최초 세팅

```bash
# 1. 환경변수 복사
cp .env.example .env

# 2. Docker 빌드 + 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 3. DB 마이그레이션 (컨테이너 내부)
docker-compose exec backend pnpm prisma migrate dev

# 4. 시드 데이터
docker-compose exec backend pnpm prisma db seed
```

## 접속 URL

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:4000/api |
| DB (PgAdmin 등) | localhost:5432 / dailycoffee / dailycoffee |

## 자주 쓰는 명령어

```bash
# 전체 재시작
docker-compose down && docker-compose up

# 로그 보기
docker-compose logs -f frontend
docker-compose logs -f backend

# 백엔드 쉘 접속
docker-compose exec backend sh

# DB 직접 접속
docker-compose exec db psql -U dailycoffee -d dailycoffee

# Prisma Studio (DB GUI)
docker-compose exec backend pnpm prisma studio
```

## 개발 모드 (핫 리로드)
- 프론트: `src/frontend` 변경 시 자동 반영 (볼륨 마운트)
- 백엔드: `src/backend/src` 변경 시 자동 반영 (nodemon)
