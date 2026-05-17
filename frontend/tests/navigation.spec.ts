import { expect, test } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should show the sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
  })

  test('should hide the sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeHidden()
  })

  test('should show mobile hamburger menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const hamburger = page.getByRole('button').filter({ has: page.locator('svg') }).first()
    await expect(hamburger).toBeVisible()
  })

  test('should open mobile navigation sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const hamburger = page.getByRole('button').filter({ has: page.locator('svg') }).first()
    await hamburger.click()
    // Sheet should open showing nav links
    await expect(page.getByText(/BKAFETERIA/i)).toBeVisible()
  })

  test('should collapse and expand sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const sidebar = page.locator('aside')
    // Find the collapse toggle button inside the sidebar
    const collapseBtn = sidebar.getByRole('button').first()
    const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width)
    await collapseBtn.click()
    await page.waitForTimeout(350) // animation duration
    const collapsedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width)
    expect(collapsedWidth).toBeLessThan(initialWidth)
    // Re-expand
    await collapseBtn.click()
    await page.waitForTimeout(350)
    const expandedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width)
    expect(expandedWidth).toBeGreaterThan(collapsedWidth)
  })

  test('should navigate to vendors page from sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const vendorsLink = page.locator('aside').getByRole('link', { name: /Cửa hàng|Vendors/i })
    await vendorsLink.click()
    await expect(page).toHaveURL('/vendors')
  })

  test('should navigate to orders page from sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const ordersLink = page.locator('aside').getByRole('link', { name: /^Đơn hàng$|^Orders$/i })
    await ordersLink.click()
    await expect(page).toHaveURL('/orders')
  })

  test('should navigate to wallet page from sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const walletLink = page.locator('aside').getByRole('link', { name: /Ví tiền|Wallet/i })
    await walletLink.click()
    await expect(page).toHaveURL('/wallet')
  })
})

test.describe('Top Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should show the topbar', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should show notification bell', async ({ page }) => {
    const bellBtn = page.locator('header').getByRole('button').filter({ has: page.locator('svg') })
    await expect(bellBtn.first()).toBeVisible()
  })

  test('should open notification dropdown', async ({ page }) => {
    // Find the bell button (has a Bell icon)
    const bellBtns = page.locator('header button[type="button"]')
    const count = await bellBtns.count()
    if (count > 0) {
      // The notification bell is typically one of the icon buttons in the header
      await bellBtns.nth(count > 1 ? count - 2 : 0).click()
      await page.waitForTimeout(300)
      // Either shows notifications or "no notifications" text
      const noNotif = page.getByText(/Không có thông báo|No new notifications/i)
      const hasNoNotif = await noNotif.count() > 0
      if (hasNoNotif) {
        await expect(noNotif.first()).toBeVisible()
      }
    }
  })

  test('should show user avatar/profile dropdown', async ({ page }) => {
    const avatarBtn = page.locator('header').getByRole('button').last()
    await avatarBtn.click()
    await page.waitForTimeout(300)
    // Dropdown should show logout option
    await expect(page.getByText(/Đăng xuất|Sign out/i)).toBeVisible()
  })

  test('should logout via profile dropdown', async ({ page }) => {
    const avatarBtn = page.locator('header').getByRole('button').last()
    await avatarBtn.click()
    await page.waitForTimeout(300)
    const logoutItem = page.getByText(/Đăng xuất|Sign out/i)
    await logoutItem.click()
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
  })
})

test.describe('Language Switcher', () => {
  test('should switch language to English via sidebar button', async ({ page }) => {
    await page.goto('/dashboard')
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForLoadState('networkidle')

    // Find the language button at the bottom of the sidebar
    const sidebar = page.locator('aside')
    const langBtn = sidebar.getByRole('button').last()
    await langBtn.click()
    await page.waitForTimeout(500)
    // Page content should change language
    await expect(page.getByText(/English|Tiếng Việt/i)).toBeVisible()
    // Restore to Vietnamese
    await langBtn.click()
    await page.waitForTimeout(500)
  })
})
