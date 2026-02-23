# FEATURE: 홈페이지

## 구성 섹션 (coffeecg.com 동일)

1. **HeroSlider** — Swiper, 3장, 자동재생 4.5s, fade 효과
   - 슬라이드 1: 2월 이벤트 (크림 배경)
   - 슬라이드 2: 신규 스페셜티 (다크 배경)
   - 슬라이드 3: 스틱커피 특가 (베이지 배경)

2. **CategoryTabs** — 가로 스크롤, 클릭 시 상품목록으로 이동
   - 전체/원두200g/원두400g/원두1kg/분쇄원두/캡슐커피/스틱커피/패키지/선물하기/굿즈

3. **신상품 섹션** — API: GET /api/products?sort=newest&limit=8
   - 4열 그리드, 상품 카드

4. **이 커피 한 잔 어때요?** — API: GET /api/products?tag=recommended&limit=4

5. **매일 1박세** — API: GET /api/products?category=stick-coffee&limit=4

6. **바리스타 추천** — API: GET /api/products?tag=barista-pick&limit=4

7. **프로모 배너** — 2×2 그리드, 하드코딩 (이벤트성)

8. **리얼리뷰** — API: GET /api/reviews?limit=3&sort=likes

9. **브랜드 섹션** — 정적 텍스트

10. **인스타그램 그리드** — 정적 (6개 이미지 플레이스홀더)

11. **Footer** — 정적

## 디자인 토큰

```
배경: #faf8f5 (크림 화이트)
브라운: #3d2b1f
액센트: #c4924a (골드 브라운)
텍스트 서브: #7a6a60
폰트: Pretendard (KR), Jost (EN), Lora (serif 강조)
```
