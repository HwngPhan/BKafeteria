import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  
  // Use locators verified from existing tests
  await page.getByRole('textbox', { name: 'Email *' }).fill('customer@gmail.com');
  await page.getByRole('textbox', { name: 'Mật khẩu *' }).fill('customer123');
  
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  
  // Wait for success toast and redirect
  await expect(page.getByText('Đăng nhập thành công')).toBeVisible({ timeout: 15000 });
  
  // Wait for any dashboard-specific element to confirm login
  await expect(page).toHaveURL(/.*dashboard|.*orders|.*vendors/, { timeout: 45000 });
  
  await page.context().storageState({ path: authFile });
});
