import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Brahmin Matrimony/i);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('/');
  const loginLink = page.getByRole('link', { name: /Sign In/i });
  await loginLink.click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/Welcome Back/i).first()).toBeVisible();
});
