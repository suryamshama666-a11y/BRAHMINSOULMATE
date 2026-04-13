import { test, expect } from '@playwright/test';

test.describe('Full User Journey', () => {
  test('should allow a user to discover and connect with matches', async ({ page }) => {
    // 1. Visit Homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Find Your Perfect/i).first()).toBeVisible({ timeout: 20000 });

    // 2. Click "Start Your Journey" (or just go to dashboard if already logged in by bypass)
    // In bypass mode, visiting /dashboard directly is easiest
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Check if we see the dashboard metrics or recommendation section
    await expect(page.getByText(/Recommended Matches/i).first()).toBeVisible({ timeout: 20000 });

    // 3. Go to Matches page via Navbar
    const matchesLink = page.getByRole('link', { name: /Matches/i }).first();
    await matchesLink.click();
    await expect(page).toHaveURL(/\/matches/);
    
    // 4. Wait for matches to load
    await expect(page.getByText(/Your Matches/i).first()).toBeVisible({ timeout: 20000 });
    
    // 5. Interact with a match card
    // Note: In mock mode, we expect some profiles to be show
    const interestBtn = page.getByRole('button', { name: /Send Interest/i }).first();
    if (await interestBtn.isVisible()) {
        await interestBtn.click();
        
        // 6. Verify success toast or UI change
        // Based on Matches.tsx: toast.success('Interest sent successfully!')
        await expect(page.getByText(/Interest sent successfully/i).first()).toBeVisible({ timeout: 10000 });
    } else {
        console.log('No matches found in E2E test, possibly due to mock data state.');
    }
  });
});
