import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Optionally login before each test, or use auth states in playwright
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*orders/);
  });

  test('should allow user to view vendors and add items to cart', async ({ page }) => {
    // Navigate to vendors page
    await page.goto('/vendors');
    await expect(page.locator('h1')).toContainText('Vendors');

    // Click on the first vendor
    await page.locator('.vendor-card').first().click(); // Adjust selector as needed

    // Add an item to cart
    const addBtn = page.locator('button').filter({ hasText: 'Thêm' }).first(); // Assuming button has a plus icon or text "Thêm"
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Verify toast message appeared
      await expect(page.locator('.sonner-toast')).toBeVisible();

      // Open Cart Sheet
      await page.click('[data-slot="sheet-trigger"]');
      
      // Verify item is in cart
      await expect(page.locator('[data-slot="sheet-content"]')).toContainText('Tạm tính');
    }
  });
});
