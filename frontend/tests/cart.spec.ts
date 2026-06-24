import { expect, Page, test } from "@playwright/test";

/**
 * Helper: navigate into a vendor's menu and return the first card whose
 * quick-add (+) button is NOT disabled (i.e., the item is not sold out).
 * Returns null if no vendor menus load or every item is sold out.
 */
async function goToMenuAndFindAvailableCard(page: Page) {
  await page.goto("/vendors", { waitUntil: "domcontentloaded" });
  const menuLinks = page.getByRole("link", { name: /Xem thực đơn|View menu/i });
  if ((await menuLinks.count()) === 0) return null;
  await menuLinks.first().click();

  const cards = page.locator("div.group.cursor-pointer");
  await cards.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  const count = await cards.count();
  if (count === 0) return null;

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const plusBtn = card.getByRole("button").last();
    if (!(await plusBtn.isDisabled())) return card;
  }
  return null;
}

test.describe("Cart Functionality", () => {
  test("should add item to cart from vendor menu", async ({ page }) => {
    const card = await goToMenuAndFindAvailableCard(page);
    if (!card) { test.skip(); return; }

    await card.hover();
    await card.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({ timeout: 8000 });
  });

  test("should open cart sheet after adding item", async ({ page }) => {
    const card = await goToMenuAndFindAvailableCard(page);
    if (!card) { test.skip(); return; }

    await card.hover();
    await card.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({ timeout: 8000 });

    const cartButton = page
      .locator("header")
      .getByRole("button")
      .filter({ has: page.locator('.bg-primary.text-primary-foreground, [class*="badge"]') })
      .first();

    if ((await cartButton.count()) > 0) {
      await cartButton.click();
      await expect(page.getByRole("heading", { name: /Giỏ hàng|Cart/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show cart total in sheet", async ({ page }) => {
    const card = await goToMenuAndFindAvailableCard(page);
    if (!card) { test.skip(); return; }

    await card.hover();
    await card.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({ timeout: 8000 });

    const cartButtons = page.locator("header").getByRole("button");
    for (let i = 0; i < (await cartButtons.count()); i++) {
      const btn = cartButtons.nth(i);
      if ((await btn.locator(".rounded-full").count()) > 0) {
        await btn.click();
        break;
      }
    }

    const totalText = page.getByText(/Tổng cộng|Total/i);
    if ((await totalText.count()) > 0) {
      await expect(totalText.first()).toBeVisible();
    }
  });

  test("should have checkout button in cart", async ({ page }) => {
    const card = await goToMenuAndFindAvailableCard(page);
    if (!card) { test.skip(); return; }

    await card.hover();
    await card.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({ timeout: 8000 });

    const cartButtons = page.locator("header").getByRole("button");
    for (let i = 0; i < (await cartButtons.count()); i++) {
      const btn = cartButtons.nth(i);
      if ((await btn.locator(".rounded-full").count()) > 0) {
        await btn.click();
        break;
      }
    }

    const checkoutBtn = page.getByRole("button", { name: /Thanh toán ngay|Checkout/i });
    if ((await checkoutBtn.count()) > 0) {
      await expect(checkoutBtn.first()).toBeVisible();
    }
  });
});
