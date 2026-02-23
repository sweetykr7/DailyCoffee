# CLAUDE.md — AI 에이전트 규칙 (DailyCoffee 프로젝트)

> 이 파일은 AI 에이전트와 코드베이스 사이의 **계약서**입니다.
> 어떤 파일도 건드리기 전에 반드시 이걸 **먼저** 읽으세요.

---

## 🎯 프로젝트 한 줄 요약

**데일리커피** = 커피 온라인 쇼핑몰 (coffeecg.com 클론, 브랜드명만 변경)
풀스택 이커머스: Next.js 프론트엔드 + Express/Node.js 백엔드 + PostgreSQL + Docker Compose

---

## 📍 핵심 경로

| 무엇 | 경로 |
|------|------|
| 프로젝트 개요 | `docs/00_context/PROJECT_BRIEF.md` |
| 아키텍처 | `docs/00_context/ARCHITECTURE.md` |
| 결정 로그 | `docs/00_context/DECISIONS.md` |
| 용어집 | `docs/00_context/GLOSSARY.md` |
| 기능 스펙 | `docs/01_specs/` |
| 로컬 개발 가이드 | `docs/02_runbooks/local-dev.md` |
| 프론트엔드 소스 | `src/frontend/` |
| 백엔드 소스 | `src/backend/` |

---

## ⚙️ 기술 스택 (고정 — 변경 시 DECISIONS.md 업데이트 필수)

- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Node.js 20, Express 5, TypeScript
- **데이터베이스**: PostgreSQL 16 (Docker 내)
- **ORM**: Prisma
- **인증**: JWT (액세스 + 리프레시 토큰), bcrypt
- **파일 저장**: 로컬 (Docker 볼륨) → 운영 환경에서 S3로 교체
- **컨테이너**: Docker Compose (서비스 3개: frontend, backend, db)
- **패키지 매니저**: pnpm (프론트/백 모두)

---

## 📐 코딩 규칙

### 공통
- **언어**: TypeScript 전부. 이유 없는 `any` 사용 금지.
- **네이밍**: 변수/함수는 camelCase, 컴포넌트/클래스는 PascalCase, 환경변수는 SCREAMING_SNAKE
- **한국어/영어**: UI 문자열은 한국어, 코드/변수명은 영어
- **에러 처리**: 반드시 명시적으로 처리. 조용한 catch 금지.
- **주석**: *무엇*이 아니라 *왜*를 설명. 한국어 주석 허용.

### 프론트엔드 (Next.js)
- App Router만 사용. Pages Router 금지.
- 기본은 서버 컴포넌트, 필요할 때만 클라이언트 컴포넌트 (`'use client'` 명시)
- 스타일링은 Tailwind. 인라인 스타일 금지.
- 백엔드 요청은 `src/frontend/lib/api.ts` 통해서만 (중앙화된 API 클라이언트)
- 모든 페이지 반응형 (모바일 우선)
- 이미지: 항상 `next/image` 사용
- 폼: React Hook Form + Zod 유효성 검사

### 백엔드 (Express)
- 라우트 파일: `src/backend/src/routes/`
- 컨트롤러: `src/backend/src/controllers/`
- 서비스: `src/backend/src/services/` (비즈니스 로직은 여기)
- 미들웨어: `src/backend/src/middleware/`
- 모든 라우트 응답: `{ success: boolean, data?: any, error?: string }`
- 요청 본문은 Zod로 유효성 검사
- DB 쿼리는 Prisma만 사용 — 성능 이슈 없으면 Raw SQL 금지

### 데이터베이스
- Prisma로 마이그레이션 (`pnpm prisma migrate dev`)
- 초기 데이터: `src/backend/prisma/seed.ts`
- 마이그레이션 파일 절대 삭제 금지

---

## 🚫 금지 사항

- 운영 코드에 `console.log` 금지 (로거 사용)
- 하드코딩된 시크릿이나 URL 금지 — `.env` 사용
- 이유 없는 `any` 금지
- 에러 처리 생략 금지
- 라우트에서 직접 DB 쿼리 금지 (서비스 통해서)
- Docker Compose 망가뜨리지 말 것 — 커밋 전 테스트

---

## ✅ 커밋 전 체크리스트

1. TypeScript 컴파일 오류 없음
2. 명백한 런타임 오류 없음
3. Docker 서비스 정상 기동 (`docker-compose up`)
4. 중요한 변경이 있으면 관련 스펙/런북 업데이트

## 🚀 Git 커밋/푸시 규칙

- **기능 단위로 커밋 + 즉시 push** — 한 번에 다 하지 말 것
- `git push origin main` 커밋 직후 실행
- **커밋 메시지는 반드시 한국어로** 작성
  - 형식: `타입(범위): 한글 설명`
  - 예시: `feat(장바구니): 수량 변경 기능 추가`
  - 예시: `feat(홈): 히어로 슬라이더 구현`
  - 예시: `feat(상품): 상품 목록 및 필터 페이지 완성`
  - 예시: `feat(인증): 로그인/회원가입 페이지 구현`
  - 예시: `feat(인프라): Docker Compose 설정`

---

## 🔄 작업 재개 방법

새 세션 시작 시:
1. `docs/00_context/PROJECT_BRIEF.md` 읽기
2. `docs/00_context/ARCHITECTURE.md` 읽기
3. `docs/00_context/DECISIONS.md` 에서 최근 결정 확인
4. `docker-compose up` 실행해서 전체 정상 기동 확인
5. 중단된 곳부터 이어서 작업
