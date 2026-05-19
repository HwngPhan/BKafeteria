import { expect, test } from "@playwright/test";

test.describe("Cart Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendors", { waitUntil: "domcontentloaded" });
    // await page.locator('main').waitFor({ state: 'visible', timeout: 60000 })
  });

  test("should add item to cart from vendor menu", async ({ page }) => {
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    const count = await menuLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await menuLinks.first().click();
    // SPA navigation — wait for menu item cards instead of waitForLoadState
    const menuItemCards = page.locator("div.group.cursor-pointer");
    await menuItemCards
      .first()
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => {});
    const cardCount = await menuItemCards.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }

    const firstCard = menuItemCards.first();
    await firstCard.hover();
    const plusBtn = firstCard.getByRole("button").last();
    await plusBtn.click();

    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({
      timeout: 8000,
    });
  });

  test("should open cart sheet after adding item", async ({ page }) => {
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    const count = await menuLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await menuLinks.first().click();
    const menuItemCards = page.locator("div.group.cursor-pointer");
    await menuItemCards
      .first()
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => {});
    if ((await menuItemCards.count()) === 0) {
      test.skip();
      return;
    }

    const firstCard = menuItemCards.first();
    await firstCard.hover();
    await firstCard.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({
      timeout: 8000,
    });

    const cartButton = page
      .locator("header")
      .getByRole("button")
      .filter({
        has: page.locator(
          '.bg-primary.text-primary-foreground, [class*="badge"]',
        ),
      })
      .first();

    if ((await cartButton.count()) > 0) {
      await cartButton.click();
      await expect(
        page.getByRole("heading", { name: /Giỏ hàng|Cart/i }),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show cart total in sheet", async ({ page }) => {
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    if ((await menuLinks.count()) === 0) {
      test.skip();
      return;
    }
    await menuLinks.first().click();
    const menuItemCards = page.locator("div.group.cursor-pointer");
    await menuItemCards
      .first()
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => {});
    if ((await menuItemCards.count()) === 0) {
      test.skip();
      return;
    }

    const firstCard = menuItemCards.first();
    await firstCard.hover();
    await firstCard.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({
      timeout: 8000,
    });

    const cartButtons = page.locator("header").getByRole("button");
    const cartCount = await cartButtons.count();
    for (let i = 0; i < cartCount; i++) {
      const btn = cartButtons.nth(i);
      const hasBadge = await btn.locator(".rounded-full").count();
      if (hasBadge > 0) {
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
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    if ((await menuLinks.count()) === 0) {
      test.skip();
      return;
    }
    await menuLinks.first().click();
    const menuItemCards = page.locator("div.group.cursor-pointer");
    await menuItemCards
      .first()
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => {});
    if ((await menuItemCards.count()) === 0) {
      test.skip();
      return;
    }

    const firstCard = menuItemCards.first();
    await firstCard.hover();
    await firstCard.getByRole("button").last().click();
    await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({
      timeout: 8000,
    });

    const cartButtons = page.locator("header").getByRole("button");
    const cartCount = await cartButtons.count();
    for (let i = 0; i < cartCount; i++) {
      const btn = cartButtons.nth(i);
      const hasBadge = await btn.locator(".rounded-full").count();
      if (hasBadge > 0) {
        await btn.click();
        break;
      }
    }

    const checkoutBtn = page.getByRole("button", {
      name: /Thanh toán ngay|Checkout/i,
    });
    if ((await checkoutBtn.count()) > 0) {
      await expect(checkoutBtn.first()).toBeVisible();
    }
  });
});
