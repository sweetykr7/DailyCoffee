# 로컬 개발 환경 런북

## 사전 요구사항
- Docker Desktop (Mac/Windows) 또는 Docker Engine (Linux)
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Git

---

## 1. 빠른 시작 (Docker Compose)

```bash
git clone https://github.com/sweetykr7/DailyCoffee.git
cd DailyCoffee

# 전체 실행 (빌드 포함)
docker compose up --build -d

# DB 스키마 적용
docker compose exec backend npx prisma db push

# 시드 데이터 투입
docker compose exec backend npx ts-node prisma/seed.ts
```

접속:
- 쇼핑몰: http://localhost:5001
- API: http://localhost:5002/api
- 어드민: http://localhost:5001/admin (admin@dailycoffee.co.kr / admin1234)

---

## 2. 포트 구성

| 서비스 | 컨테이너 내부 | 호스트 노출 |
|--------|--------------|------------|
| 프론트엔드 (Next.js) | 3000 | **5001** |
| 백엔드 (Express) | 4000 | **5002** |
| PostgreSQL | 5432 | **5433** |

> ⚠️ 포트 3000, 4000, 5432가 이미 다른 프로세스에 점유된 경우를 위해 다른 포트 사용

---

## 3. 컨테이너 관리

```bash
# 상태 확인
docker compose ps

# 로그
docker compose logs -f          # 전체
docker compose logs -f backend  # 백엔드만
docker compose logs -f frontend # 프론트엔드만

# 재시작
docker compose restart backend

# 코드 변경 후 재빌드
docker compose up --build -d backend   # 백엔드만
docker compose up --build -d frontend  # 프론트엔드만
docker compose up --build -d           # 전체

# 종료
docker compose down
```

---

## 4. 백엔드 직접 개발

```bash
cd src/backend

# 의존성 설치
pnpm install

# 환경 변수
cp ../../.env.example .env
# DATABASE_URL=postgresql://dailycoffee:dailycoffee@localhost:5433/dailycoffee

# TypeScript 컴파일 체크
npx tsc --noEmit

# 개발 서버 (Docker 없이)
pnpm dev
```

---

## 5. 프론트엔드 직접 개발

```bash
cd src/frontend

# 의존성 설치
pnpm install

# 환경 변수
echo "NEXT_PUBLIC_API_URL=http://localhost:5002/api" > .env.local

# 개발 서버
pnpm dev  # http://localhost:3000
```

---

## 6. DB 작업

```bash
# Prisma Studio (GUI) — 로컬에서 실행
cd src/backend
DATABASE_URL=postgresql://dailycoffee:dailycoffee@localhost:5433/dailycoffee npx prisma studio

# 스키마 변경 후 push
docker compose exec backend npx prisma db push

# 시드 재실행 (기존 데이터 모두 삭제 후 재투입)
docker compose exec backend npx ts-node prisma/seed.ts

# DB 쉘 접속
docker compose exec db psql -U dailycoffee -d dailycoffee
```

---

## 7. 어드민 계정
- 이메일: `admin@dailycoffee.co.kr`
- 비밀번호: `admin1234`

---

## 8. 자주 쓰는 API 테스트

```bash
# 헬스체크
curl http://localhost:5002/api/health

# 로그인 (토큰 획득)
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dailycoffee.co.kr","password":"admin1234"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['accessToken'])")

# 어드민 통계
curl http://localhost:5002/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# 상품 목록
curl 'http://localhost:5002/api/products?limit=5'
```
