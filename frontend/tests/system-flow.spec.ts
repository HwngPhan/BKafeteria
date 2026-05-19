import { expect, test } from '@playwright/test';

test.describe('End-to-End System Flow', () => {
  test('should allow a customer to browse, add to cart, and place an order', async ({ page }) => {
    // 1. Navigate to Vendors page
    await page.goto('/vendors');
    
    // 2. Select the first vendor card (wait up to 60s for API data to load)
    const firstVendor = page.locator('.group.relative.overflow-hidden').first();
    await firstVendor.waitFor({ state: 'visible', timeout: 60000 });
    await firstVendor.getByRole('link', { name: /Xem thực đơn|View menu/i }).click();

    // 3. Add an item to the cart (Quick Add)
    // Find the first menu item card and click its add button
    const firstMenuItem = page.locator('div.group.cursor-pointer').first();
    await firstMenuItem.waitFor({ state: 'visible' });
    
    // Click the plus button — use .last() to avoid strict-mode error when the
    // card renders more than one button (e.g. info + add-to-cart).
    const plusButton = firstMenuItem.getByRole('button').last();
    await plusButton.click();

    // 4. Verify the "Added to cart" toast
    await expect(page.getByText(/Đã thêm .* vào giỏ hàng|Added .* to cart/i)).toBeVisible();

    // 5. Open the Cart Sheet
    // The cart button has a badge with the number of items
    const cartButton = page.getByRole('button').filter({ has: page.locator('.bg-primary.text-primary-foreground') });
    await cartButton.click();

    // 6. Verify item in CartSheet
    await expect(page.getByRole('heading', { name: /Giỏ hàng|Cart/i })).toBeVisible();
    await expect(page.locator('div.p-8.space-y-10')).toBeVisible();

    // 7. Proceed to Checkout
    const checkoutButton = page.getByRole('button', { name: /Thanh toán ngay|Checkout/i });
    await expect(checkoutButton).toBeEnabled();
    await checkoutButton.click();

    // 8. Verify Order Success and Redirect
    await expect(page.getByText(/Đặt đơn hàng thành công|Order placed/i)).toBeVisible();
    await expect(page).toHaveURL(/.*orders/, { timeout: 30000 });

    // 9. Verify the new order appears in the list
    await expect(page.getByRole('heading', { name: /Đơn hàng của tôi|My Orders/i })).toBeVisible();

    // The order might take a moment to appear in the list after the redirect
    await page.waitForTimeout(2000); // Small buffer for API consistency
    await page.getByRole('button', { name: /Làm mới|Refresh/i }).click(); // Click refresh to be sure

    const orderIdText = page.getByText(/Đơn hàng #|Order #/i);
    await expect(orderIdText.first()).toBeVisible({ timeout: 20000 });

    // 10. Click first order to view its detail page
    const firstOrderLink = page.locator('a[href^="/orders/"]').first();
    if ((await firstOrderLink.count()) > 0) {
      await firstOrderLink.click();
      await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 15000 });
      await expect(page.locator('main')).toBeVisible();
      // Page should not render broken data
      await expect(page.locator('body')).not.toContainText('undefined');
      await expect(page.locator('body')).not.toContainText('[object Object]');
    }
  });
});
