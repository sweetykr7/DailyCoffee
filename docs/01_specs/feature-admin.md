# 어드민 기능 스펙

## 개요
`ADMIN` 역할을 가진 사용자만 접근 가능한 관리자 패널.
접속 URL: `/admin` (로그인 후 ADMIN role 확인, 아니면 `/login` 리디렉션)

## 인증
- 모든 `/api/admin/*` 엔드포인트: `authenticate` + `requireAdmin` 미들웨어
- 프론트 어드민 레이아웃에서 `/api/auth/me` 호출 → role 확인

## 기본 계정
- 이메일: `admin@dailycoffee.co.kr`
- 비밀번호: `admin1234`

---

## 대시보드 (`/admin`)

### API: GET /api/admin/stats
```json
{
  "totalRevenue": 0,
  "totalOrders": 0,
  "newUsersThisMonth": 5,
  "totalProducts": 32,
  "dailySales": [
    { "date": "2026-02-17", "amount": 0 },
    ...최근 7일
  ]
}
```

### UI 구성
- 통계 카드 4개: 총 매출 / 총 주문 / 이번달 신규 회원 / 전체 상품
- Recharts `BarChart` — 최근 7일 일별 매출
- 최근 주문 5건 테이블

---

## 상품 관리 (`/admin/products`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/products | 목록 (search, categoryId, page, limit) |
| POST | /api/admin/products | 상품 등록 |
| PUT | /api/admin/products/:id | 상품 수정 |
| DELETE | /api/admin/products/:id | 상품 삭제 |

### 상품 등록/수정 필드
- name (필수), description, price (필수), discountPrice
- stock (기본 100), categoryId (필수), imageUrl
- tags (BEST/NEW/SALE 체크박스), isFeatured (추천 상품 토글)

---

## 주문 관리 (`/admin/orders`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/orders | 목록 (status, search, page) |
| GET | /api/admin/orders/:id | 상세 (items 포함) |
| PUT | /api/admin/orders/:id/status | 상태 변경 |

### 상태 뱃지 색상
| 상태 | 색상 |
|------|------|
| PENDING | 회색 |
| CONFIRMED | 파랑 |
| SHIPPING | 주황 |
| DELIVERED | 초록 |
| CANCELLED | 빨강 |

---

## 사용자 관리 (`/admin/users`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/users | 목록 (search, page) |
| GET | /api/admin/users/:id | 상세 + 주문 내역 |
| PUT | /api/admin/users/:id/role | 역할 변경 (USER/ADMIN) |

---

## 카테고리 관리 (`/admin/categories`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/categories | 목록 (상품수 포함) |
| POST | /api/admin/categories | 생성 |
| PUT | /api/admin/categories/:id | 수정 |
| DELETE | /api/admin/categories/:id | 삭제 (상품 있으면 거부) |

---

## 쿠폰 관리 (`/admin/coupons`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/coupons | 목록 |
| POST | /api/admin/coupons | 생성 |
| PUT | /api/admin/coupons/:id | 수정 |
| DELETE | /api/admin/coupons/:id | 삭제 |

### 쿠폰 필드
- code (고유), discountType (PERCENTAGE/FIXED)
- discountValue, minOrderAmount, maxDiscountAmount
- expiresAt, usageLimit, usageCount (자동)

---

## 리뷰 관리 (`/admin/reviews`)

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/admin/reviews | 목록 (상품명, 작성자 포함) |
| DELETE | /api/admin/reviews/:id | 리뷰 삭제 |
