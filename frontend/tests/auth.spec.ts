import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to log in and see dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Assuming we have fields with these roles or names
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click submit
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard or order page
    await expect(page).toHaveURL(/.*orders/); // Example expectation

    // Check if the dashboard text is visible
    await expect(page.locator('h1')).toContainText('Đơn hàng của tôi');
  });
});
