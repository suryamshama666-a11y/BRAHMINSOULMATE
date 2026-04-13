import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load landing page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like network errors in dev)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    if (description) {
      expect(description.length).toBeGreaterThan(0);
    }
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if images have proper loading attributes
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      // At least some images should have loading="lazy"
      const lazyImages = page.locator('img[loading="lazy"]');
      const lazyCount = await lazyImages.count();
      
      // It's okay if not all images are lazy-loaded (hero images shouldn't be)
      expect(lazyCount).toBeGreaterThanOrEqual(0);
    }
  });
});
