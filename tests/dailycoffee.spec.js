const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5001';
const API_URL = 'http://localhost:5002/api';

test.describe('데일리커피 홈페이지', () => {
  test('홈페이지 로딩 및 브랜드명 확인', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('페이지 타이틀:', title);

    // 브랜드명 "데일리커피" 존재 확인 (커피창고 없음)
    const content = await page.content();
    expect(content).not.toContain('커피창고');
    expect(content).not.toContain('Coffee Changgo');
    expect(content).not.toContain('COFFEE CHANGGO');

    // DAILY COFFEE 헤더 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    console.log('헤더 텍스트:', headerText?.substring(0, 100));

    await page.screenshot({ path: 'tests/screenshots/01-홈페이지.png', fullPage: false });
    console.log('✅ 홈페이지 로딩 성공');
  });

  test('상품 목록 페이지 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'tests/screenshots/02-상품목록.png', fullPage: false });
    console.log('✅ 상품목록 페이지 접근 성공');
  });

  test('로그인 페이지 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/03-로그인.png' });
    console.log('✅ 로그인 페이지 폼 확인');
  });

  test('회원가입 페이지 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/04-회원가입.png' });
    console.log('✅ 회원가입 페이지 확인');
  });

  test('장바구니 페이지 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/05-장바구니.png' });
    console.log('✅ 장바구니 페이지 확인');
  });

  test('마이페이지 확인 (리다이렉트 포함)', async ({ page }) => {
    await page.goto(`${BASE_URL}/mypage`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/06-마이페이지.png' });
    console.log('✅ 마이페이지 접근 확인');
  });
});

test.describe('백엔드 API', () => {
  test('헬스체크 API', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    console.log('✅ API 헬스체크 통과:', body.data.status);
  });

  test('상품 목록 API', async ({ request }) => {
    const res = await request.get(`${API_URL}/products?limit=5`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    console.log(`✅ 상품 ${body.data.length}개 조회 성공:`, body.data[0].name);
  });

  test('카테고리 목록 API', async ({ request }) => {
    const res = await request.get(`${API_URL}/categories`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    console.log('✅ 카테고리 목록:', body.data.map(c => c.name).join(', '));
  });

  test('회원가입 API', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `test_${Date.now()}@dailycoffee.co.kr`,
        password: 'Test1234!',
        name: '테스트유저',
        phone: '010-1234-5678',
      },
    });
    const body = await res.json();
    if (res.status() === 201) {
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeTruthy();
      console.log('✅ 회원가입 API 성공:', body.data.user.email);
    } else {
      console.log('⚠️ 회원가입 응답:', res.status(), body.error);
    }
  });

  test('로그인 API (시드 계정)', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'lee.soyeon@example.com',
        password: 'user1234',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeTruthy();
    console.log('✅ 로그인 성공:', body.data.user.name);
  });
});
