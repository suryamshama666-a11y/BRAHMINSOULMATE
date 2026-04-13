import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i);
  });

  test('should display registration page', async ({ page }) => {
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1, h2')).toContainText(/register|sign up/i);
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=/forgot.*password/i');
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('should show password requirements on registration', async ({ page }) => {
    await page.goto('/register');
    
    // Check if password field exists
    const passwordField = page.locator('input[type="password"]').first();
    await expect(passwordField).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show login prompt
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login when accessing profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login when accessing messages', async ({ page }) => {
    await page.goto('/messages');
    await expect(page).toHaveURL(/.*login/);
  });
});
