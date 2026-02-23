# 인증 기능 스펙

## 개요
JWT 기반 인증. AccessToken(15분) + RefreshToken(7일) 쌍으로 관리.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/refresh | 토큰 갱신 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/me | 내 정보 |

## 유효성 검증

### 회원가입
- email: 이메일 형식
- password: 8자 이상
- name: 2자 이상
- phone: 선택 입력

### 로그인
- email + password 조합 확인
- 비밀번호 bcrypt 검증

## 토큰 저장
- `localStorage.accessToken` — API 요청 시 Authorization Bearer 헤더
- `localStorage.refreshToken` — 갱신 요청 시 사용

## 자동 갱신 플로우
1. API 요청 → 401 응답
2. `lib/api.ts`의 `refreshAccessToken()` 호출
3. `/api/auth/refresh`로 새 토큰 발급
4. 원래 요청 재시도

## CORS 허용 오리진
- http://localhost:3000
- http://localhost:3001
- http://localhost:5001
- http://127.0.0.1:5001

## 역할 (Role)
- `USER` — 일반 회원 (기본값)
- `ADMIN` — 관리자 (어드민 패널 접근 가능)
