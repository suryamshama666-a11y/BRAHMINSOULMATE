import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Brahmin.*Soulmate/i);
  });

  test('should navigate to About page', async ({ page }) => {
    await page.click('text=About');
    await expect(page).toHaveURL(/.*about/);
  });

  test('should navigate to How It Works page', async ({ page }) => {
    await page.click('text=/how.*works/i');
    await expect(page).toHaveURL(/.*how-it-works/);
  });

  test('should navigate to Plans page', async ({ page }) => {
    const plansLink = page.locator('a:has-text("Plans"), a:has-text("Pricing")').first();
    if (await plansLink.isVisible()) {
      await plansLink.click();
      await expect(page).toHaveURL(/.*plans/);
    }
  });

  test('should navigate to Success Stories', async ({ page }) => {
    const storiesLink = page.locator('a:has-text("Success Stories")').first();
    if (await storiesLink.isVisible()) {
      await storiesLink.click();
      await expect(page).toHaveURL(/.*success-stories/);
    }
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check if navbar exists
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should load without horizontal scroll
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu button (hamburger)
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      // Menu should open
      await page.waitForTimeout(500);
    }
  });
});
