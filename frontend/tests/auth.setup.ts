import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Pin the language to Vietnamese before the page loads so LanguageProvider
  // reads 'vi' from localStorage rather than falling back to the default.
  // This prevents language from leaking across test runs via the saved storageState.
  await page.addInitScript(() => {
    localStorage.setItem('lang', 'vi');
  });

  await page.goto('/login');

  // Use bilingual regex so the setup works regardless of any language state
  await page.getByRole('textbox', { name: 'Email *' }).fill('customer@gmail.com');
  await page.getByRole('textbox', { name: /Mật khẩu|Password/i }).fill('customer123');

  await page.getByRole('button', { name: /Đăng nhập|Sign In/i }).click();

  // Wait for success toast and redirect
  await expect(page.getByText(/Đăng nhập thành công|Signed in/i)).toBeVisible({ timeout: 15000 });

  // Wait for any dashboard-specific element to confirm login
  await expect(page).toHaveURL(/.*dashboard|.*orders|.*vendors/, { timeout: 45000 });

  // Ensure lang:vi is written into the saved storageState so all tests that
  // load playwright/.auth/user.json also start in Vietnamese.
  await page.evaluate(() => localStorage.setItem('lang', 'vi'));
  await page.context().storageState({ path: authFile });
});
