import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

test.describe('Authentication', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders email and password inputs', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).first().fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(
      page.getByText(/invalid email or password/i),
    ).toBeVisible({ timeout: 8000 });
  });

  test('password field has show/hide toggle', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const passwordInput = page.getByLabel(/password/i).first();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByLabel(/show password/i).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
