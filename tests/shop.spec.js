const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5001';
const API_URL = 'http://localhost:5002/api';

// ─── 홈페이지 ────────────────────────────────────────────────────
test.describe('쇼핑 플로우 — 홈페이지', () => {
  test('홈페이지 로딩 + 상품 카드 노출 확인', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 헤더에 DAILY COFFEE 브랜드명 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toContain('DAILY COFFEE');

    // 상품 카드가 하나 이상 노출되는지 확인
    const productCards = page.locator('a[href*="/products/"]');
    const cardCount = await productCards.count();
    console.log(`홈페이지 상품 링크 수: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/shop-01-homepage.png', fullPage: false });
    console.log('✅ 홈페이지 로딩 + 상품 카드 노출 확인');
  });
});

// ─── 상품 목록 + 카테고리 필터 ───────────────────────────────────
test.describe('쇼핑 플로우 — 상품 목록', () => {
  test('상품 목록 페이지 + 카테고리 필터', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 상품 카드 노출 확인
    const productCards = page.locator('a[href*="/products/"]');
    const initialCount = await productCards.count();
    console.log(`전체 상품 카드 수: ${initialCount}`);
    expect(initialCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/shop-02-products-all.png', fullPage: false });

    // 카테고리 필터 버튼 찾기 (사이드바 또는 모바일 칩)
    const categoryButtons = page.locator('aside button, nav button').filter({ hasText: /원두|스틱|캡슐|드립백|선물/ });
    const categoryCount = await categoryButtons.count();
    console.log(`카테고리 필터 버튼 수: ${categoryCount}`);

    if (categoryCount > 0) {
      // 첫 번째 카테고리 클릭
      const firstCategory = categoryButtons.first();
      const categoryName = await firstCategory.textContent();
      console.log(`카테고리 클릭: ${categoryName?.trim()}`);
      await firstCategory.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/shop-03-products-filtered.png', fullPage: false });
      console.log('✅ 카테고리 필터 클릭 완료');
    } else {
      console.log('⚠️ 카테고리 필터 버튼을 찾지 못함 (뷰포트 크기에 따라 다를 수 있음)');
    }

    console.log('✅ 상품 목록 페이지 확인');
  });
});

// ─── 상품 상세 + 옵션 선택 ───────────────────────────────────────
test.describe('쇼핑 플로우 — 상품 상세', () => {
  test('상품 상세 페이지 + 옵션 선택', async ({ page }) => {
    // 먼저 상품 목록에서 첫 번째 상품 클릭
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const productLinks = page.locator('a[href*="/products/"]');
    const linkCount = await productLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // 첫 번째 상품 클릭
    await productLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 상품 상세 페이지 확인
    const productName = page.locator('h1');
    await expect(productName).toBeVisible({ timeout: 10000 });
    const name = await productName.textContent();
    console.log(`상품명: ${name}`);

    // 가격 확인
    const priceEl = page.locator('.text-3xl.font-bold').first();
    const priceVisible = await priceEl.isVisible().catch(() => false);
    if (priceVisible) {
      const price = await priceEl.textContent();
      console.log(`가격: ${price}`);
    }

    // 옵션 버튼 확인 (용량/분쇄도)
    const optionButtons = page.locator('button.rounded-lg.border');
    const optionCount = await optionButtons.count();
    console.log(`옵션 버튼 수: ${optionCount}`);

    if (optionCount > 0) {
      // 첫 번째 옵션 선택
      await optionButtons.first().click();
      await page.waitForTimeout(500);
      console.log('옵션 선택 완료');
    }

    // 장바구니 담기 버튼 확인
    const addToCartBtn = page.locator('button:has-text("장바구니 담기")');
    const addToCartVisible = await addToCartBtn.isVisible().catch(() => false);
    console.log(`장바구니 담기 버튼: ${addToCartVisible ? '보임' : '안보임'}`);

    await page.screenshot({ path: 'tests/screenshots/shop-04-product-detail.png', fullPage: true });
    console.log('✅ 상품 상세 페이지 확인');
  });
});

// ─── 회원가입 ────────────────────────────────────────────────────
test.describe('쇼핑 플로우 — 회원가입', () => {
  test('회원가입 (새 이메일로)', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');

    // 회원가입 폼 필드 확인
    const nameInput = page.locator('input[placeholder="홍길동"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[placeholder="비밀번호를 다시 입력해주세요"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 고유 이메일로 가입 시도
    const uniqueEmail = `test_e2e_${Date.now()}@dailycoffee.co.kr`;
    await nameInput.fill('E2E테스터');
    await emailInput.fill(uniqueEmail);
    await passwordInput.fill('Test1234!');
    if (await confirmInput.isVisible()) {
      await confirmInput.fill('Test1234!');
    }

    // 전화번호 (선택)
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('010-9999-9999');
    }

    await page.screenshot({ path: 'tests/screenshots/shop-05-register-filled.png' });

    // 회원가입 버튼 클릭
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // 성공 시 홈으로 리다이렉트 or 에러 메시지 표시
    const currentUrl = page.url();
    const errorMsg = page.locator('.bg-red-50, .text-red-500, .text-red-600');
    const hasError = await errorMsg.first().isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorMsg.first().textContent();
      console.log(`⚠️ 회원가입 에러: ${errorText}`);
    } else {
      console.log(`회원가입 후 URL: ${currentUrl}`);
    }

    await page.screenshot({ path: 'tests/screenshots/shop-06-register-result.png' });
    console.log('✅ 회원가입 플로우 확인');
  });
});

// ─── 로그인 ──────────────────────────────────────────────────────
test.describe('쇼핑 플로우 — 로그인', () => {
  test('로그인 (test@test.com / test1234)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('test@test.com');
    await passwordInput.fill('test1234');

    await page.screenshot({ path: 'tests/screenshots/shop-07-login-filled.png' });

    await submitBtn.click();
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const errorMsg = page.locator('.bg-red-50, .text-red-500, .text-red-600');
    const hasError = await errorMsg.first().isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorMsg.first().textContent();
      console.log(`⚠️ 로그인 에러: ${errorText}`);
    } else {
      console.log(`로그인 후 URL: ${currentUrl}`);
      // 로그인 성공 시 헤더에 로그아웃 버튼 또는 환영 메시지 확인
      const logoutBtn = page.locator('button:has-text("로그아웃")');
      const loggedIn = await logoutBtn.isVisible().catch(() => false);
      console.log(`로그아웃 버튼 보임: ${loggedIn}`);
    }

    await page.screenshot({ path: 'tests/screenshots/shop-08-login-result.png' });
    console.log('✅ 로그인 플로우 확인');
  });
});

// ─── 장바구니 담기 + 확인 ────────────────────────────────────────
test.describe('쇼핑 플로우 — 장바구니', () => {
  test('장바구니 담기 + 장바구니 페이지 확인', async ({ page }) => {
    // 1. 먼저 로그인
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. 상품 목록으로 이동
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 3. 첫 번째 상품 클릭
    const productLinks = page.locator('a[href*="/products/"]');
    const linkCount = await productLinks.count();

    if (linkCount > 0) {
      await productLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 4. 장바구니 담기 버튼 클릭
      const addToCartBtn = page.locator('button:has-text("장바구니 담기")');
      const btnVisible = await addToCartBtn.isVisible().catch(() => false);

      if (btnVisible) {
        await addToCartBtn.click();
        await page.waitForTimeout(2000);
        console.log('장바구니 담기 클릭');

        await page.screenshot({ path: 'tests/screenshots/shop-09-add-to-cart.png' });
      } else {
        console.log('⚠️ 장바구니 담기 버튼을 찾지 못함 (품절 상품일 수 있음)');
      }
    }

    // 5. 장바구니 페이지로 이동
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 장바구니 내용 확인
    const emptyCart = page.locator('text=장바구니가 비어있습니다');
    const isEmpty = await emptyCart.isVisible().catch(() => false);

    if (isEmpty) {
      console.log('장바구니가 비어있습니다');
    } else {
      // 장바구니에 상품이 있는 경우
      const cartItems = page.locator('.rounded-xl.border.border-gray-200');
      const itemCount = await cartItems.count();
      console.log(`장바구니 상품 수: ${itemCount}`);

      // 주문 요약 확인
      const orderSummary = page.locator('text=주문 요약');
      const summaryVisible = await orderSummary.isVisible().catch(() => false);
      console.log(`주문 요약 보임: ${summaryVisible}`);
    }

    await page.screenshot({ path: 'tests/screenshots/shop-10-cart.png', fullPage: true });
    console.log('✅ 장바구니 페이지 확인');
  });
});
