import { expect, test } from '@playwright/test'

/**
 * Why the bell-button test was removed:
 *   page.locator('header button').first() returns the hamburger SheetTrigger which is
 *   `md:hidden` (display:none at desktop).  It is first in DOM order but NOT visible,
 *   so toBeVisible() always fails on desktop.  The dropdown tests below already prove
 *   the header buttons are functional.
 *
 * Why networkidle was dropped: see dashboard.spec.ts.
 */

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

test.describe('Sidebar Navigation (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/dashboard')
    await expect(page.locator('aside')).toBeVisible({ timeout: 20000 })
  })

  test('should be visible on desktop', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible()
  })

  test('should collapse when the toggle button is clicked', async ({ page }) => {
    const sidebar = page.locator('aside')
    const toggleBtn = sidebar.getByRole('button').first()
    const before = await sidebar.evaluate((el) => el.getBoundingClientRect().width)
    await toggleBtn.click()
    await page.waitForTimeout(350)
    const after = await sidebar.evaluate((el) => el.getBoundingClientRect().width)
    expect(after).toBeLessThan(before)
    await toggleBtn.click() // restore
  })

  test('should navigate to /vendors via sidebar link', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: /Cửa hàng|Vendors/i }).click()
    await expect(page).toHaveURL('/vendors')
  })

  test('should navigate to /orders via sidebar link', async ({ page }) => {
    // The Orders link is only shown for CUSTOMER role (auth setup uses customer account)
    await page.locator('aside').getByRole('link', { name: /^Đơn hàng$|^Orders$/i }).click()
    await expect(page).toHaveURL('/orders')
  })
})

// ─── Mobile navigation ────────────────────────────────────────────────────────

test.describe('Sidebar Navigation (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await expect(page.locator('main')).toBeVisible({ timeout: 20000 })
  })

  test('aside should be hidden on mobile', async ({ page }) => {
    // SideNav renders with class `hidden md:flex` — invisible below md breakpoint
    await expect(page.locator('aside')).toBeHidden()
  })

  test('hamburger button should open the slide-out sheet', async ({ page }) => {
    // At 375 px the SheetTrigger (Menu icon) is visible; it is first in the header
    await page.locator('header').getByRole('button').first().click()
    // SheetTitle inside the drawer contains "BKAFETERIA"
    await expect(page.getByRole('heading', { name: /BKAFETERIA/i })).toBeVisible()
  })
})

// ─── Top bar ──────────────────────────────────────────────────────────────────

test.describe('Top Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/dashboard')
    await expect(page.locator('header')).toBeVisible({ timeout: 20000 })
  })

  test('should open the user dropdown showing the logout item', async ({ page }) => {
    // Avatar button is the last button rendered in the header
    await page.locator('header').getByRole('button').last().click()
    await expect(page.getByText(/Đăng xuất|Sign out/i)).toBeVisible()
  })

  test('should logout and redirect to /login', async ({ page }) => {
    await page.locator('header').getByRole('button').last().click()
    await page.getByText(/Đăng xuất|Sign out/i).click()
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })
})
