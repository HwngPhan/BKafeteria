import { expect, test } from '@playwright/test'

/**
 * Why networkidle was dropped:
 *   React Query + WebSocket keep HTTP activity alive indefinitely.
 *   page.goto() already waits for the `load` event. The element wait
 *   (expect(main).toBeVisible) is the real synchronisation gate.
 */

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // Wait for the auth guard to resolve and the layout to mount
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 })
  })

  test('should display a time-based greeting heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Chào|Good/i)
  })

  test('should show Explore Vendors and View Menu CTA links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Khám phá cửa hàng|Explore Vendors/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Xem thực đơn|View Menu/i })).toBeVisible()
  })

  test('should navigate to /vendors from the CTA link', async ({ page }) => {
    await page.getByRole('link', { name: /Khám phá cửa hàng|Explore Vendors/i }).click()
    await expect(page).toHaveURL('/vendors')
  })
})

test.describe('Not Found Page', () => {
  test('should show 404 heading for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-123')
    // not-found.tsx renders <h1>404</h1>
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 })
  })
})
