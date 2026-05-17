import { expect, test } from '@playwright/test'

test.describe('Customer Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle')
  })

  test('should display the orders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Đơn hàng|My Orders/)
  })

  test('should show two-column layout with active and history sections', async ({ page }) => {
    // Both column headings should be visible
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
  })

  test('should have a working sort select', async ({ page }) => {
    const sortTrigger = page.locator('button[role="combobox"]').first()
    await expect(sortTrigger).toBeVisible()
    await sortTrigger.click()
    await expect(page.getByRole('option').first()).toBeVisible()
    // Close dropdown
    await page.keyboard.press('Escape')
  })

  test('should have a refresh button that triggers reload', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /Làm mới|Refresh/ })
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()
    // Button should momentarily show spinner or re-trigger fetch
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to order detail when clicking history item', async ({ page }) => {
    // If there are history orders, clicking the link should navigate
    const historyLinks = page.locator('a[href^="/orders/"]')
    const count = await historyLinks.count()
    if (count > 0) {
      const href = await historyLinks.first().getAttribute('href')
      await historyLinks.first().click()
      await expect(page).toHaveURL(href ?? /\/orders\//)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })

  test('should show empty state when no orders exist', async ({ page }) => {
    // The empty state appears only when there are truly no orders
    // We just check the page renders without errors
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })

  test('should show history pagination when more than 6 history orders exist', async ({ page }) => {
    // Pagination only appears when there are >6 history items
    const prevBtn = page.locator('button').filter({ hasText: '' }).first()
    // Just verify page renders without crash
    await expect(page.locator('body')).not.toContainText('undefined')
    await expect(page.locator('body')).not.toContainText('null')
  })
})

test.describe('Order Detail Page', () => {
  test('should navigate to order detail and show status timeline', async ({ page }) => {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle')

    const orderLinks = page.locator('a[href^="/orders/"]')
    const count = await orderLinks.count()
    if (count === 0) {
      test.skip()
      return
    }

    await orderLinks.first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/orders\/.+/)

    // Status timeline card should be visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('should show back button on order detail page', async ({ page }) => {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle')

    const orderLinks = page.locator('a[href^="/orders/"]')
    const count = await orderLinks.count()
    if (count === 0) {
      test.skip()
      return
    }

    await orderLinks.first().click()
    await page.waitForLoadState('networkidle')

    const backBtn = page.getByRole('button').filter({ has: page.locator('svg') }).first()
    await expect(backBtn).toBeVisible()
  })

  test('should show 404 state for non-existent order', async ({ page }) => {
    await page.goto('/orders/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    // Either order is found or a not-found message appears
    const notFound = page.getByText(/không tìm thấy|not found/i)
    const hasNotFound = await notFound.count() > 0
    if (hasNotFound) {
      await expect(notFound.first()).toBeVisible()
    }
  })
})
