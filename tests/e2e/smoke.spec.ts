import { test, expect } from '@playwright/test';

test('homepage renders and has Join Now CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Brahmin Soulmate Connect/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Join Now/i })).toBeVisible();
});

test('protected route redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  // ProtectedRoute shows an authentication required screen or redirects to /login
  const authRequired = page.getByText(/Authentication Required/i);
  const loginHeading = page.getByText(/Welcome Back/i);
  await expect(authRequired.or(loginHeading)).toBeVisible();
});

