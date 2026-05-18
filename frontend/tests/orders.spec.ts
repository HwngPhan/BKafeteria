import { expect, test } from '@playwright/test'

/**
 * Why networkidle was dropped: see dashboard.spec.ts.
 * Tests that depend on having real orders use test.skip() when data is absent
 * so they never show as failures.
 */

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')
    // Wait for auth + page data — h1 appears only after both resolve
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20000 })
  })

  test('should display the orders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Đơn hàng|My Orders/)
  })

  test('should have a working sort combobox', async ({ page }) => {
    const sortSelect = page.getByRole('combobox').first()
    await expect(sortSelect).toBeVisible()
    await sortSelect.click()
    await expect(page.getByRole('option').first()).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('should have a visible refresh button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Làm mới|Refresh/i })).toBeVisible()
  })

  test('should not render undefined or [object Object] text', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('undefined')
    await expect(page.locator('body')).not.toContainText('[object Object]')
  })
})

test.describe('Order Detail Page', () => {
  test('should open an order detail page from the history list', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20000 })

    const links = page.locator('a[href^="/orders/"]')
    if (await links.count() === 0) {
      test.skip()
      return
    }

    const href = await links.first().getAttribute('href')
    await links.first().click()
    await expect(page).toHaveURL(href ?? /\/orders\/.+/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('should handle a non-existent order id without crashing', async ({ page }) => {
    await page.goto('/orders/00000000-0000-0000-0000-000000000000')
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).not.toContainText('undefined')
  })
})
