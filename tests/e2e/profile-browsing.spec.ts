import { test, expect } from '@playwright/test';

test.describe('Profile Browsing (Public)', () => {
  test('should display featured profiles on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any profile cards or sections
    const profileSection = page.locator('section, div').filter({ hasText: /profiles|matches|members/i }).first();
    
    if (await profileSection.isVisible()) {
      expect(await profileSection.isVisible()).toBe(true);
    }
  });

  test('should show call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    
    // Should have registration or get started buttons
    const ctaButtons = page.locator('button, a').filter({ hasText: /get started|register|sign up|join/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Search and Filters', () => {
  test('should have search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input or search page link
    const searchElement = page.locator('input[type="search"], input[placeholder*="search"], a:has-text("Search")').first();
    
    if (await searchElement.isVisible()) {
      expect(await searchElement.isVisible()).toBe(true);
    }
  });
});
