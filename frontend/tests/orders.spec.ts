import { expect, test } from "@playwright/test";

/**
 * page.goto uses domcontentloaded — the load event never fires on pages with
 * persistent WebSocket connections. After domcontentloaded we wait for the
 * SSR'd auth-init loading screen ("Đang tải dữ liệu...") to detach, then
 * wait for the h1 heading. Tests that depend on real orders use test.skip()
 * when data is absent so they never show as failures.
 */

test.describe("Orders Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/orders", { waitUntil: "domcontentloaded" });
    // h1 is always rendered (outside loading guard), wait for auth + page mount
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30000,
    });
  });

  test("should display the orders page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Đơn hàng|My Orders/,
    );
  });

  test("should have a working sort combobox", async ({ page }) => {
    const sortSelect = page.getByRole("combobox").first();
    await expect(sortSelect).toBeVisible();
    await sortSelect.click();
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("should have a visible refresh button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Làm mới|Refresh/i }),
    ).toBeVisible();
  });

  test("should not render undefined or [object Object] text", async ({
    page,
  }) => {
    await expect(page.locator("body")).not.toContainText("undefined");
    await expect(page.locator("body")).not.toContainText("[object Object]");
  });
});

test.describe("Order Detail Page", () => {
  test("should open an order detail page from the history list", async ({
    page,
  }) => {
    await page.goto("/orders", { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible", timeout: 60000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20000,
    });

    const links = page.locator('a[href^="/orders/"]');
    if ((await links.count()) === 0) {
      test.skip();
      return;
    }

    const href = await links.first().getAttribute("href");
    await links.first().click();
    await expect(page).toHaveURL(href ?? /\/orders\/.+/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("should handle a non-existent order id without crashing", async ({
    page,
  }) => {
    await page.goto("/orders/00000000-0000-0000-0000-000000000000", {
      waitUntil: "domcontentloaded",
    });
    await page.locator("main").waitFor({ state: "visible", timeout: 60000 });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("body")).not.toContainText("undefined");
  });
});
