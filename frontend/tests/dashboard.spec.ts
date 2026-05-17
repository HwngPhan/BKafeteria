import { expect, test } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should display greeting based on time of day', async ({ page }) => {
    const greetingPatterns = [
      /Chào buổi sáng|Good morning/i,
      /Chào buổi chiều|Good afternoon/i,
      /Chào buổi tối|Good evening/i,
    ]
    let found = false
    for (const pattern of greetingPatterns) {
      const count = await page.getByText(pattern).count()
      if (count > 0) {
        found = true
        await expect(page.getByText(pattern).first()).toBeVisible()
        break
      }
    }
    expect(found).toBe(true)
  })

  test('should show explore stores CTA button', async ({ page }) => {
    const ctaBtn = page.getByRole('link', { name: /Khám phá cửa hàng|Explore Vendors/i })
    await expect(ctaBtn).toBeVisible()
  })

  test('should navigate to vendors from explore button', async ({ page }) => {
    const ctaBtn = page.getByRole('link', { name: /Khám phá cửa hàng|Explore Vendors/i })
    await ctaBtn.click()
    await expect(page).toHaveURL('/vendors')
  })

  test('should show view menu CTA button', async ({ page }) => {
    const menuBtn = page.getByRole('link', { name: /Xem thực đơn|View Menu/i })
    await expect(menuBtn).toBeVisible()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    // Page should still render main content
    await expect(page.locator('main')).toBeVisible()
    // No horizontal overflow (basic check)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5px tolerance
  })
})

test.describe('Not Found Page', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-123')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Không tìm thấy|Not Found|404/i)).toBeVisible()
  })
})
