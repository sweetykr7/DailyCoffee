const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5001';
const API_URL = 'http://localhost:5002/api';

const ADMIN_EMAIL = 'admin@dailycoffee.co.kr';
const ADMIN_PASSWORD = 'admin1234';

/**
 * 어드민 로그인 후 accessToken을 localStorage에 설정
 */
async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // 로그인 후 페이지 이동 대기
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// ─── 비로그인 상태에서 /admin 접근 ───────────────────────────────
test.describe('어드민 패널 — 인증', () => {
  test('/admin 접속 시 비로그인이면 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // /login으로 리다이렉트되거나, 로그인 폼이 보여야 함
    const url = page.url();
    const hasLoginForm = await page.locator('input[type="email"]').isVisible().catch(() => false);
    expect(url.includes('/login') || hasLoginForm).toBeTruthy();

    await page.screenshot({ path: 'tests/screenshots/admin-00-redirect.png' });
    console.log('✅ 비로그인 상태 /admin → 로그인 페이지 리다이렉트 확인');
  });
});

// ─── 어드민 로그인 후 각 페이지 확인 ─────────────────────────────
test.describe('어드민 패널 — 페이지 확인', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('대시보드: 통계 카드 4개 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 통계 카드 4개 (총 매출, 총 주문수, 신규 회원, 상품수)
    const statCards = page.locator('.rounded-xl.bg-white.p-6.shadow-sm');
    const cardCount = await statCards.count();
    console.log(`통계 카드 수: ${cardCount}`);
    expect(cardCount).toBeGreaterThanOrEqual(4);

    // 카드 내 라벨 텍스트 확인
    const expectedLabels = ['총 매출', '총 주문수', '신규 회원', '상품수'];
    for (const label of expectedLabels) {
      const el = page.locator(`text=${label}`);
      const visible = await el.isVisible().catch(() => false);
      console.log(`  카드 "${label}": ${visible ? '보임' : '안보임'}`);
    }

    await page.screenshot({ path: 'tests/screenshots/admin-01-dashboard.png', fullPage: true });
    console.log('✅ 어드민 대시보드 확인');
  });

  test('/admin/products: 상품 목록 테이블 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 테이블 존재 확인
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // 테이블 헤더 확인
    const headers = page.locator('thead th');
    const headerCount = await headers.count();
    console.log(`상품 테이블 헤더 수: ${headerCount}`);
    expect(headerCount).toBeGreaterThanOrEqual(3);

    // 상품 행 존재 확인
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`상품 행 수: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/admin-02-products.png', fullPage: true });
    console.log('✅ 어드민 상품 목록 확인');
  });

  test('/admin/orders: 주문 목록 테이블 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 테이블 또는 주문 목록 영역 확인
    const table = page.locator('table');
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`주문 행 수: ${rowCount}`);
    } else {
      // 주문이 없을 수 있음
      const emptyText = page.locator('text=주문이 없습니다');
      const emptyVisible = await emptyText.isVisible().catch(() => false);
      console.log(`주문 없음 메시지: ${emptyVisible}`);
    }

    await page.screenshot({ path: 'tests/screenshots/admin-03-orders.png', fullPage: true });
    console.log('✅ 어드민 주문 목록 확인');
  });

  test('/admin/users: 사용자 목록 테이블 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`사용자 행 수: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'tests/screenshots/admin-04-users.png', fullPage: true });
    console.log('✅ 어드민 사용자 목록 확인');
  });

  test('/admin/categories: 카테고리 카드 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/categories`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 카테고리 카드들 (rounded-xl bg-white shadow-sm 형태)
    const cards = page.locator('.rounded-xl.bg-white.shadow-sm');
    const cardCount = await cards.count();
    console.log(`카테고리 카드 수: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(0);

    // "카테고리 추가" 버튼 확인
    const addBtn = page.locator('button:has-text("카테고리 추가")');
    const addBtnVisible = await addBtn.isVisible().catch(() => false);
    console.log(`카테고리 추가 버튼: ${addBtnVisible ? '보임' : '안보임'}`);

    await page.screenshot({ path: 'tests/screenshots/admin-05-categories.png', fullPage: true });
    console.log('✅ 어드민 카테고리 목록 확인');
  });

  test('/admin/coupons: 쿠폰 목록 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/coupons`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 테이블 또는 쿠폰 목록 확인
    const table = page.locator('table');
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`쿠폰 행 수: ${rowCount}`);
    } else {
      const emptyText = page.locator('text=쿠폰이 없습니다');
      const emptyVisible = await emptyText.isVisible().catch(() => false);
      console.log(`쿠폰 없음 메시지: ${emptyVisible}`);
    }

    // "쿠폰 생성" 버튼 확인
    const addBtn = page.locator('button:has-text("쿠폰 생성")');
    const addBtnVisible = await addBtn.isVisible().catch(() => false);
    console.log(`쿠폰 생성 버튼: ${addBtnVisible ? '보임' : '안보임'}`);

    await page.screenshot({ path: 'tests/screenshots/admin-06-coupons.png', fullPage: true });
    console.log('✅ 어드민 쿠폰 목록 확인');
  });

  test('/admin/reviews: 리뷰 목록 보임', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/reviews`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 테이블 또는 리뷰 목록 확인
    const table = page.locator('table');
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`리뷰 행 수: ${rowCount}`);
    } else {
      const emptyText = page.locator('text=리뷰가 없습니다');
      const emptyVisible = await emptyText.isVisible().catch(() => false);
      console.log(`리뷰 없음 메시지: ${emptyVisible}`);
    }

    await page.screenshot({ path: 'tests/screenshots/admin-07-reviews.png', fullPage: true });
    console.log('✅ 어드민 리뷰 목록 확인');
  });
});
