# 용어집 — 데일리커피

> 용어 통일. 코드/UI/DB 모두 이 이름 사용.

---

## 브랜드

| 한국어 | 영어 | 코드/DB |
|--------|------|---------|
| 데일리커피 | Daily Coffee | `DAILY_COFFEE` |

> ⚠️ "커피창고", "Coffee Changgo", "coffeecg" 절대 사용 금지

---

## 도메인 용어

| 한국어 | 영어 | 코드 변수명 | DB 테이블 |
|--------|------|------------|---------|
| 상품 | Product | `product` | `products` |
| 카테고리 | Category | `category` | `categories` |
| 장바구니 | Cart | `cart` | `carts` |
| 장바구니 항목 | Cart Item | `cartItem` | `cart_items` |
| 주문 | Order | `order` | `orders` |
| 주문 항목 | Order Item | `orderItem` | `order_items` |
| 리뷰 | Review | `review` | `reviews` |
| 회원 | User | `user` | `users` |
| 주소 | Address | `address` | `addresses` |
| 쿠폰 | Coupon | `coupon` | `coupons` |
| 포인트 | Point | `point` | `points` |
| 관리자 | Admin | `admin` | `role: ADMIN` |

---

## 상품 옵션

| 한국어 | 영어 | 값 예시 |
|--------|------|---------|
| 용량 | Weight | `200g`, `400g`, `1kg` |
| 분쇄도 | Grind | `원두`, `에스프레소`, `모카포트`, `핸드드립`, `콜드브루` |

---

## 주문 상태 (OrderStatus)

| 코드 | 한국어 |
|------|--------|
| `PENDING` | 결제 대기 |
| `PAID` | 결제 완료 |
| `PREPARING` | 상품 준비중 |
| `SHIPPED` | 배송중 |
| `DELIVERED` | 배송완료 |
| `CANCELLED` | 취소됨 |
| `REFUNDED` | 환불됨 |

---

## 카테고리 slug

| slug | 한국어 |
|------|--------|
| `coffee-beans` | 원두커피 |
| `stick-coffee` | 스틱커피 |
| `home-cafe` | 홈카페 용품 |
| `espresso` | 에스프레소 |
| `gift` | 선물세트 |
| `green-beans` | 생두 |
| `drip-bag` | 드립백 |

---

## API 응답 형식

```typescript
// 성공
{ success: true, data: T }

// 실패
{ success: false, error: string, code?: string }

// 목록
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }
```

---

## 파일 명명 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase.tsx | `ProductCard.tsx` |
| 훅 | useXxx.ts | `useCart.ts` |
| 서비스 | xxx.service.ts | `product.service.ts` |
| 라우트 | xxx.routes.ts | `product.routes.ts` |
| 타입 | xxx.types.ts | `product.types.ts` |
