# 마이페이지 기능 스펙

## 개요
로그인한 사용자가 자신의 계정 정보, 주문 내역, 리뷰, 배송지를 관리하는 페이지 모음.
모든 마이페이지 엔드포인트는 `Authorization: Bearer {accessToken}` 필수.

## 엔드포인트

### 회원 정보
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/auth/me | 내 정보 조회 |
| PUT | /api/auth/me | 내 정보 수정 (이름, 전화번호) |
| PUT | /api/auth/password | 비밀번호 변경 |

### 주문 내역
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/orders | 내 주문 목록 |
| GET | /api/orders/:id | 주문 상세 |

### 리뷰
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/reviews/my | 내가 쓴 리뷰 목록 |
| POST | /api/reviews | 리뷰 작성 |
| DELETE | /api/reviews/:id | 리뷰 삭제 |

### 배송지
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/addresses | 내 배송지 목록 |
| POST | /api/addresses | 배송지 추가 |
| PUT | /api/addresses/:id | 배송지 수정 |
| DELETE | /api/addresses/:id | 배송지 삭제 |
| PUT | /api/addresses/:id/default | 기본 배송지 설정 |

## 프론트엔드 페이지

### 마이페이지 홈 (`/mypage`)
- 사용자 이름, 이메일 표시
- 주문 현황 요약 (진행중/배송중/완료)
- 사이드 메뉴 (주문내역/리뷰/배송지)

### 주문 내역 (`/mypage/orders`)
- 주문 날짜, 주문번호, 상품 썸네일, 금액, 상태 뱃지
- 상태: PENDING(결제완료) / CONFIRMED(주문확인) / SHIPPING(배송중) / DELIVERED(배송완료) / CANCELLED(취소)
- 배송완료된 주문에 "리뷰 작성" 버튼 노출

### 리뷰 관리 (`/mypage/reviews`)
- 내가 쓴 리뷰 목록 (별점, 내용, 작성일)
- 리뷰 삭제 기능

### 배송지 관리 (`/mypage/addresses`)
- 최대 5개 저장 가능
- 기본 배송지 설정 (체크아웃에서 자동 선택)
- 추가/수정/삭제

## 리뷰 작성 규칙
- 배송완료(DELIVERED) 주문의 상품만 리뷰 작성 가능
- 동일 상품 리뷰는 1회만 작성 가능
- 별점 1~5점, 내용 10자 이상

## 토큰 갱신
- `accessToken` 만료(15분) 시 `refreshToken`으로 자동 갱신
- `refreshToken` 만료(7일) 시 로그인 페이지로 리디렉션
- `lib/api.ts`의 `refreshAccessToken()` 메서드가 자동 처리
