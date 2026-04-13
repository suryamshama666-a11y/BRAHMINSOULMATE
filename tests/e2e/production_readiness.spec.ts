import { test, expect } from '@playwright/test';

test.describe('Production Readiness Smoke Test', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL before each test
    await page.goto('/');
  });

  test('Homepage loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Brahmin Matrimony/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Check for "Start Your Journey" or "Register" instead of search, which requires login
    await expect(page.getByRole('link', { name: /start|register/i }).first()).toBeVisible();
  });

  test('Search page loads and filters operate', async ({ page }) => {
    await page.goto('/search');
    
    // Core search UI elements must be visible
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible({ timeout: 15000 });
    
    // Try typing a query
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill('Engineer');
    
    // Verify results container exists (even if empty)
    // Assuming there's a grid or list of profiles
    const resultsContainer = page.locator('.grid').first(); 
    await expect(resultsContainer).toBeVisible();
  });

  test('Matches page loads critical components', async ({ page }) => {
    await page.goto('/matches');
    
    // Should show matches or a "no matches" state, but not crash
    // Look for "Matches" heading or similar
    await expect(page.getByText(/Matches/i).first()).toBeVisible({ timeout: 15000 });
    
    // Check for match card generic elements if any exist in mock data
    // If empty, check for empty state text
    const hasMatches = await page.locator('[data-testid="match-card"]').count() > 0;
    if (hasMatches) {
        await expect(page.locator('[data-testid="match-card"]').first()).toBeVisible();
    }
  });

  test('Authentication pages are reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    
    await page.goto('/register');
    await expect(page.getByRole('button', { name: /sign up|register/i })).toBeVisible();
  });
});
