# ARCHITECTURE — DailyCoffee

---

## 구성도

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                      │
│                                                       │
│  ┌──────────────┐    ┌──────────────┐  ┌──────────┐ │
│  │  frontend    │    │   backend    │  │    db    │ │
│  │  Next.js 14  │───▶│  Express 5   │──│ Postgres │ │
│  │  :3000       │    │  Node 20     │  │  :5432   │ │
│  │              │    │  :4000       │  │          │ │
│  └──────────────┘    └──────────────┘  └──────────┘ │
│                             │                         │
│                      ┌──────────────┐                 │
│                      │   Prisma ORM │                 │
│                      └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 디렉토리 구조

```
DailyCoffee/
├── docker-compose.yml
├── docker-compose.dev.yml       # dev override (hot reload)
├── .env.example
│
├── src/
│   ├── frontend/                # Next.js 14
│   │   ├── app/                 # App Router
│   │   │   ├── (shop)/          # 쇼핑 레이아웃 그룹
│   │   │   │   ├── page.tsx              # 홈
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx          # 상품 목록
│   │   │   │   │   └── [id]/page.tsx     # 상품 상세
│   │   │   │   ├── cart/page.tsx         # 장바구니
│   │   │   │   ├── checkout/page.tsx     # 주문/결제
│   │   │   │   └── order/[id]/page.tsx   # 주문완료
│   │   │   ├── (auth)/          # 인증 레이아웃 그룹
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── mypage/          # 마이페이지 (protected)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   └── reviews/page.tsx
│   │   │   ├── admin/           # 관리자 (protected)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   └── orders/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/          # Header, Footer, Nav
│   │   │   ├── home/            # HeroSlider, CategoryTabs, ProductSection
│   │   │   ├── product/         # ProductCard, ProductGallery, OptionSelector
│   │   │   ├── cart/            # CartItem, CartSummary
│   │   │   ├── order/           # OrderForm, PaymentMock
│   │   │   ├── review/          # ReviewCard, ReviewForm, StarRating
│   │   │   └── ui/              # Button, Input, Modal, Badge (공통)
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (fetch wrapper)
│   │   │   ├── auth.ts          # 클라이언트 auth 헬퍼
│   │   │   └── utils.ts         # 포맷터, 공통 유틸
│   │   ├── hooks/               # useCart, useAuth, useProducts
│   │   ├── stores/              # Zustand stores (cart, auth)
│   │   ├── types/               # TypeScript 타입 정의
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── backend/                 # Express 5 API
│       ├── src/
│       │   ├── routes/          # 라우트 등록
│       │   │   ├── auth.routes.ts
│       │   │   ├── product.routes.ts
│       │   │   ├── cart.routes.ts
│       │   │   ├── order.routes.ts
│       │   │   ├── review.routes.ts
│       │   │   └── admin.routes.ts
│       │   ├── controllers/     # req/res 처리
│       │   ├── services/        # 비즈니스 로직
│       │   ├── middleware/
│       │   │   ├── auth.ts      # JWT 검증
│       │   │   ├── admin.ts     # 관리자 권한
│       │   │   ├── validate.ts  # Zod 유효성
│       │   │   └── errorHandler.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts    # Prisma 싱글톤
│       │   │   ├── jwt.ts       # 토큰 발급/검증
│       │   │   └── logger.ts    # Winston 로거
│       │   └── app.ts           # Express 앱 설정
│       ├── prisma/
│       │   ├── schema.prisma    # DB 스키마
│       │   ├── migrations/
│       │   └── seed.ts          # 초기 데이터
│       ├── Dockerfile
│       └── package.json
│
└── docs/
```

---

## API 엔드포인트 요약

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/products` | 상품 목록 (필터/정렬/페이지) |
| GET | `/api/products/:id` | 상품 상세 |
| GET | `/api/categories` | 카테고리 목록 |
| GET | `/api/cart` | 장바구니 조회 |
| POST | `/api/cart` | 장바구니 추가 |
| PUT | `/api/cart/:id` | 수량 변경 |
| DELETE | `/api/cart/:id` | 항목 삭제 |
| POST | `/api/orders` | 주문 생성 |
| GET | `/api/orders` | 내 주문 목록 |
| GET | `/api/orders/:id` | 주문 상세 |
| POST | `/api/reviews` | 리뷰 작성 |
| GET | `/api/reviews?productId=` | 상품 리뷰 목록 |
| GET | `/api/admin/products` | 관리자: 상품 관리 |
| POST | `/api/admin/products` | 관리자: 상품 등록 |

---

## DB 핵심 스키마 (요약)

```
User — Cart — CartItem — Product
           └── Order — OrderItem ┘
User — Review — Product
User — Address
Product — Category
Product — ProductImage
Product — ProductOption (용량, 분쇄도)
```

→ 상세 스키마: `src/backend/prisma/schema.prisma`

---

## 인증 흐름

```
로그인 → JWT accessToken(15m) + refreshToken(7d) 발급
요청 시 → Authorization: Bearer <accessToken>
만료 시 → POST /api/auth/refresh → 새 accessToken 발급
프론트 → Zustand에 user 상태 저장, localStorage에 refreshToken
```

---

## 환경변수 (`.env.example` 기준)

```env
# Database
DATABASE_URL=postgresql://dailycoffee:dailycoffee@db:5432/dailycoffee

# Auth
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# App
BACKEND_URL=http://backend:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NODE_ENV=development
```
