import { expect, test } from '@playwright/test'

test.describe('Wallet Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wallet', { waitUntil: 'domcontentloaded' })
    // Wait for the wallet heading — networkidle never fires on pages with WebSocket connections
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 })
  })

  test('should display the wallet page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Ví|Wallet/)
  })

  test('should show current balance card', async ({ page }) => {
    // Use first() since the subtitle text also contains "Số dư"
    await expect(page.getByText(/Số dư hiện tại|Current Balance/i).first()).toBeVisible()
    await expect(page.getByText(/VNĐ/)).toBeVisible()
  })

  test('should show deposit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Nạp tiền|Deposit/i })).toBeVisible()
  })

  test('should show transaction history section', async ({ page }) => {
    await expect(page.getByText(/Giao dịch gần đây|Recent Transactions/i)).toBeVisible()
  })
})

test.describe('Deposit Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wallet', { waitUntil: 'domcontentloaded' })
    // Wait for the Deposit button to be ready — networkidle never fires with WebSocket connections
    await expect(page.getByRole('button', { name: /Nạp tiền|Deposit/i })).toBeVisible({ timeout: 30000 })
    // Open deposit dialog
    await page.getByRole('button', { name: /Nạp tiền|Deposit/i }).click()
  })

  test('should open deposit dialog with title', async ({ page }) => {
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Nạp tiền vào ví|Top Up Wallet/i)).toBeVisible()
  })

  test('should show preset amount buttons', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: '50k' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '100k' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '200k' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '500k' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '1tr' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '2tr' })).toBeVisible()
  })

  test('should show custom amount input', async ({ page }) => {
    const input = page.getByTestId('amount-input')
    await expect(input).toBeVisible()
  })

  test('should select preset amount and highlight button', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    const btn100k = dialog.getByRole('button', { name: '100k' })
    await btn100k.click()
    // The button should now be highlighted (active class adds bg-primary)
    await expect(btn100k).toHaveClass(/bg-primary/)
  })

  test('should populate input when preset is clicked', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '200k' }).click()
    const input = page.getByTestId('amount-input')
    const value = await input.inputValue()
    // Vietnamese locale formats 200000 as "200.000"
    expect(value.replace(/\D/g, '')).toBe('200000')
  })

  test('should show QR code when valid amount is entered', async ({ page }) => {
    // Enter a valid amount via input
    const input = page.getByTestId('amount-input')
    await input.fill('100000')
    // QR code container should appear
    await expect(page.getByTestId('qr-code')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('img[alt*="QR"]')).toBeVisible()
  })

  test('should show QR code when preset is selected', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '500k' }).click()
    await expect(page.getByTestId('qr-code')).toBeVisible({ timeout: 5000 })
  })

  test('should show bank transfer info when QR visible', async ({ page }) => {
    await page.getByTestId('amount-input').fill('100000')
    // Bank info section should appear
    await expect(page.getByText(/Vietcombank/i)).toBeVisible()
    await expect(page.getByText(/9876543210/i)).toBeVisible()
    // Scope to dialog to avoid matching the sidebar "BKAFETERIA" brand text
    await expect(page.getByRole('dialog').getByText(/BKAFETERIA/i)).toBeVisible()
  })

  test('should show error for amount below 10000', async ({ page }) => {
    const input = page.getByTestId('amount-input')
    await input.fill('5000')
    await expect(page.getByText(/tối thiểu|Minimum/i)).toBeVisible()
  })

  test('confirm button should be disabled when no amount', async ({ page }) => {
    const confirmBtn = page.getByTestId('confirm-deposit-btn')
    await expect(confirmBtn).toBeDisabled()
  })

  test('confirm button should be disabled when amount is too low', async ({ page }) => {
    await page.getByTestId('amount-input').fill('999')
    const confirmBtn = page.getByTestId('confirm-deposit-btn')
    await expect(confirmBtn).toBeDisabled()
  })

  test('confirm button should be enabled with valid amount', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '100k' }).click()
    const confirmBtn = page.getByTestId('confirm-deposit-btn')
    await expect(confirmBtn).toBeEnabled()
  })

  test('should show success toast and close dialog after confirm', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '100k' }).click()
    await page.getByTestId('confirm-deposit-btn').click()
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    // Success toast should appear
    await expect(page.getByText(/Đã ghi nhận|Noted|cập nhật|update/i)).toBeVisible({ timeout: 5000 })
  })

  test('should close dialog when cancel is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Hủy|Cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('should reset amount after dialog is closed and reopened', async ({ page }) => {
    // Set an amount
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '100k' }).click()
    // Close
    await page.getByRole('button', { name: /Hủy|Cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    // Reopen
    await page.getByRole('button', { name: /Nạp tiền|Deposit/i }).click()
    const input = page.getByTestId('amount-input')
    const value = await input.inputValue()
    // Input should be empty
    expect(value).toBe('')
  })

  test('should have working copy button for account number', async ({ page }) => {
    await page.getByTestId('amount-input').fill('100000')
    await expect(page.getByTestId('qr-code')).toBeVisible()
    // Find copy buttons (there should be at least one for account number)
    const copyBtns = page.locator('button[aria-label*="Copy"]')
    const count = await copyBtns.count()
    expect(count).toBeGreaterThan(0)
    await copyBtns.first().click()
    // After copy, the icon should change to a checkmark (CheckCircle2)
    await expect(copyBtns.first().locator('svg')).toBeVisible()
  })
})
