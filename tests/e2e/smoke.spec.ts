import { test, expect } from '@playwright/test';

test('homepage renders and has Start Your Journey CTA', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
  await expect(page.getByText(/Find Your Perfect/i).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/Life Partner/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Start Your Journey/i }).first()).toBeVisible();
});

test('protected route redirects to login', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  
  // Wait for the redirect to /login - using a longer timeout for the auth loading phase
  await page.waitForURL(/\/login/, { timeout: 30000 });
  
  // Verify we are on the login page by checking the heading
  await expect(page.getByText(/Welcome Back/i).first()).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/login/);
});

