# 상품 기능 스펙

## 개요
상품 목록 조회, 검색, 필터링, 상세 페이지 기능을 정의한다.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/products | 상품 목록 (페이지네이션, 검색, 카테고리, 정렬) |
| GET | /api/products/:id | 상품 상세 (이미지, 옵션, 리뷰 포함) |
| GET | /api/categories | 카테고리 목록 |

## 쿼리 파라미터 (GET /api/products)

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 12 | 페이지당 상품 수 |
| search | string | - | 상품명 검색 |
| categoryId | string | - | 카테고리 ID 필터 |
| sort | string | latest | 정렬 (latest/price_asc/price_desc) |
| tag | string | - | 태그 필터 (BEST/NEW/SALE/BARISTA-PICK) |

## 응답 형식

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "price": 18900,
      "discountPrice": 15900,
      "tags": ["BEST", "SALE"],
      "category": { "id": "string", "name": "원두커피" },
      "images": [{ "url": "string", "isPrimary": true }],
      "reviews": [{ "rating": 5 }]
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 32, "totalPages": 3 }
}
```

## 프론트엔드 페이지

### 상품 목록 (`/products`)
- 좌측 카테고리 사이드바 (데스크탑)
- 정렬 버튼 (최신순/낮은가격순/높은가격순)
- 검색 인풋
- 2열(모바일) / 3열(데스크탑) 그리드
- 무한스크롤 대신 페이지네이션

### 상품 상세 (`/products/:id`)
- 상품 이미지 갤러리
- 상품명, 가격, 할인가, 할인율
- 무게 옵션 선택 (원두: 200g/500g/1kg)
- 분쇄 옵션 (홀빈/중간분쇄/곱게분쇄)
- 수량 선택
- 장바구니 담기 / 바로 구매 버튼
- 상품 설명 탭
- 리뷰 섹션

## 상품 태그
- `BEST` — 베스트셀러
- `NEW` — 신상품
- `SALE` — 할인 중
- `BARISTA-PICK` — 바리스타 추천

## 재고 관련
- `stock <= 0` 이면 "품절" 뱃지 표시, 구매 버튼 비활성화
- 관리자 재고 수정 시 즉시 반영

## 이미지
- 상품당 최소 1개 (isPrimary: true)
- 외부 CDN URL 또는 `/images/products/*.jpg` 로컬 경로 모두 지원
- 이미지 없을 때: 커피컵 SVG placeholder

## 연관 데이터
- `ProductImage[]` — 상품 이미지
- `ProductOption[]` — 선택 옵션 (WEIGHT, GRIND)
- `Review[]` — 리뷰 (rating 평균 계산용)
