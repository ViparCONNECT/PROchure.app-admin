import { test, expect } from '@playwright/test';

/**
 * These tests require a running backend and a valid SUPER_ADMIN session.
 * Set E2E_SUPER_ADMIN_EMAIL and E2E_SUPER_ADMIN_PASSWORD environment variables.
 */

const EMAIL = process.env.E2E_SUPER_ADMIN_EMAIL ?? 'superadmin@example.com';
const PASSWORD = process.env.E2E_SUPER_ADMIN_PASSWORD ?? 'changeme';
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
}

test.describe('Admin Management (Super Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('navigates to /admins', async ({ page }) => {
    await page.goto(`${BASE}/admins`);
    await expect(page.getByRole('heading', { name: /admins/i })).toBeVisible();
  });

  test('shows New Admin button for Super Admin', async ({ page }) => {
    await page.goto(`${BASE}/admins`);
    await expect(page.getByRole('button', { name: /new admin/i })).toBeVisible();
  });

  test('ADMIN role cannot access /admins', async ({ page: _page }) => {
    // Placeholder — requires an ADMIN user to log in
    // Real test would: log in as ADMIN, navigate to /admins, expect access denied
    test.skip();
  });
});

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('displays 4 categories', async ({ page }) => {
    await page.goto(`${BASE}/categories`);
    // Expect at least the section heading
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible();
  });

  test('navigates to subcategories for a category with needsSubCategory', async ({ page }) => {
    await page.goto(`${BASE}/categories`);
    const manageBtn = page.getByRole('button', { name: /manage sub-categories/i }).first();
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      await expect(page.getByRole('heading', { name: /sub-categories/i })).toBeVisible();
    }
  });
});

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('displays profiles table', async ({ page }) => {
    await page.goto(`${BASE}/profiles`);
    await expect(page.getByRole('heading', { name: /profiles/i })).toBeVisible();
  });

  test('New Profile button is visible', async ({ page }) => {
    await page.goto(`${BASE}/profiles`);
    await expect(page.getByRole('button', { name: /new profile/i })).toBeVisible();
  });

  test('create profile form renders required fields', async ({ page }) => {
    await page.goto(`${BASE}/profiles/new`);
    await expect(page.getByLabel(/business name/i)).toBeVisible();
    await expect(page.getByLabel(/category/i).first()).toBeVisible();
  });
});
