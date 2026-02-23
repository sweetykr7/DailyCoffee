# 주문/결제 기능 스펙

## 개요
장바구니에서 주문서 작성 → 모의 결제 → 주문 완료 플로우.
실제 PG 연동 없음 (모의 결제만 지원).

## 주문 상태 플로우

```
PENDING → CONFIRMED → SHIPPING → DELIVERED
    ↓
CANCELLED (어느 단계에서든 관리자가 취소 가능)
```

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/orders | 주문 생성 |
| GET | /api/orders | 내 주문 목록 |
| GET | /api/orders/:id | 주문 상세 |

### POST /api/orders 요청
```json
{
  "shippingAddress": {
    "recipientName": "홍길동",
    "phone": "010-1234-5678",
    "zipCode": "12345",
    "address": "서울시 강남구 테헤란로 123",
    "addressDetail": "101호"
  },
  "paymentMethod": "CARD",
  "couponCode": "WELCOME10",
  "items": [
    {
      "productId": "string",
      "quantity": 2,
      "selectedOptions": { "weight": "200g" }
    }
  ]
}
```

### 응답
```json
{
  "success": true,
  "data": {
    "id": "string",
    "orderNumber": "ORD-20260223-001",
    "status": "PENDING",
    "totalAmount": 31800,
    "shippingFee": 0,
    "discountAmount": 3180,
    "items": [ ... ],
    "createdAt": "2026-02-23T07:00:00.000Z"
  }
}
```

## 결제 수단 (모의)
- `CARD` — 신용카드/체크카드
- `BANK_TRANSFER` — 계좌이체
- `VIRTUAL_ACCOUNT` — 가상계좌

## 쿠폰 적용 규칙
1. 주문 요청 시 `couponCode` 전달
2. 서버에서 유효성 검증 (만료일, 사용횟수, 최소 주문금액)
3. `PERCENTAGE` 타입: 정률 할인 (maxDiscountAmount 상한 적용)
4. `FIXED` 타입: 정액 할인

## 프론트엔드 페이지

### 주문서 (`/checkout`)
- 배송지 입력 (저장된 주소 불러오기 가능)
- 주문 상품 목록 (수정 불가)
- 결제 수단 선택
- 쿠폰 코드 입력
- 최종 금액 요약
- "결제하기" 버튼 → 2초 로딩 → 주문완료 페이지

### 주문 완료 (`/order/:id`)
- 주문번호, 예상 배송일
- 주문 요약 카드
- "쇼핑 계속하기" / "주문 내역 보기" 버튼

## 재고 처리
- 주문 생성 시 재고 차감 (`stock -= quantity`)
- 주문 취소 시 재고 복구
- 재고 부족 시 400 에러 반환

## 주문번호 형식
`ORD-{YYYYMMDD}-{6자리 순번}` 예: `ORD-20260223-000001`
