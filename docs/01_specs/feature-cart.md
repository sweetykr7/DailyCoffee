# 장바구니 기능 스펙

## 개요
로그인한 사용자의 장바구니를 관리한다. 비로그인 시 장바구니 접근 불가 (로그인 페이지로 리디렉션).

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/cart | 내 장바구니 조회 |
| POST | /api/cart/items | 상품 추가 |
| PUT | /api/cart/items/:itemId | 수량 변경 |
| DELETE | /api/cart/items/:itemId | 상품 제거 |
| DELETE | /api/cart | 장바구니 전체 비우기 |

## 요청/응답

### POST /api/cart/items
```json
{
  "productId": "string",
  "quantity": 1,
  "selectedOptions": { "weight": "200g", "grind": "홀빈(분쇄안함)" }
}
```

### GET /api/cart 응답
```json
{
  "success": true,
  "data": {
    "id": "string",
    "items": [
      {
        "id": "string",
        "quantity": 2,
        "selectedOptions": { "weight": "500g" },
        "product": {
          "id": "string",
          "name": "에티오피아 예가체프 G1",
          "price": 18900,
          "discountPrice": 15900,
          "images": [{ "url": "string", "isPrimary": true }]
        }
      }
    ]
  }
}
```

## 비즈니스 규칙
- 동일 상품 + 동일 옵션이면 수량 합산 (중복 추가 방지)
- 품절 상품은 장바구니에 담기 불가
- 재고보다 많은 수량 요청 시 400 에러
- 가격은 장바구니 담은 시점 기준 (discountPrice 우선)

## 프론트엔드 페이지 (`/cart`)
- 상품 이미지, 이름, 선택 옵션, 수량 조절, 단가, 소계
- 수량 변경 시 즉시 소계 업데이트
- 개별 삭제 / 전체 삭제
- 우측 주문 요약 카드: 상품금액, 배송비(50,000원 이상 무료), 총 결제금액
- "주문하기" 버튼 → /checkout 이동

## 배송비 정책
- 기본 배송비: 3,000원
- 50,000원 이상 구매 시 무료배송

## 상태 관리
Zustand `useCartStore` 에서 관리:
- 로그인 시 서버 장바구니와 동기화
- 낙관적 업데이트 (API 응답 전 UI 먼저 업데이트)
