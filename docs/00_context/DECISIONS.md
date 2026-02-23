# DECISIONS — DailyCoffee

> 중요한 기술/설계 결정 로그. 새 결정은 맨 위에 추가.

---

## [2026-02-23] 초기 스택 확정

**결정**: Next.js 14 + Express 5 + PostgreSQL + Prisma + Docker Compose

**이유**:
- Next.js App Router: SSR로 SEO 최적화 (상품 페이지 노출)
- Express: 단순하고 유연, TypeScript 적용 용이
- Prisma: 타입 안전한 ORM, 마이그레이션 관리 편리
- Docker Compose: 환경 재현성, 팀 온보딩 0비용

**대안 검토**:
- NestJS: 과도한 보일러플레이트
- Fastify: Express 대비 장점이 이 규모에서 미미
- MySQL: PostgreSQL 대비 이유 없음

---

## [2026-02-23] pnpm 선택

**결정**: npm/yarn 대신 pnpm 사용

**이유**: 디스크 효율, 빠른 설치, 엄격한 의존성

---

## [2026-02-23] 결제 모의 처리

**결정**: 실제 PG 연동 없이 모의 결제 구현

**이유**: MVP 범위, PG 계약 없음

**향후**: 토스페이먼츠 연동 시 `src/backend/src/services/payment.service.ts` 교체

---

## [2026-02-23] Tailwind CSS 선택

**결정**: CSS Modules/Styled-Components 대신 Tailwind

**이유**: coffeecg.com 디자인 빠른 재현, AI 코드 생성 친화적

**주의**: `tailwind.config.ts`에 커스텀 색상 (coffee 팔레트) 정의 필수

---

## [2026-02-23] Zustand 상태관리

**결정**: Redux 대신 Zustand

**이유**: 보일러플레이트 최소, SSR 호환, 장바구니/인증에 충분
