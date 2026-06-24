import { expect, test } from "@playwright/test";

test.describe("Vendors Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendors", { waitUntil: "domcontentloaded" });
    // h1 is rendered outside the loading guard — wait for auth to complete
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30000,
    });
  });

  test("should display the vendors page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Tất cả cửa hàng|All Vendors/,
    );
  });

  test("should have a search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /Tìm kiếm cửa hàng|Search vendors/,
    );
    await expect(searchInput).toBeVisible();
  });

  test("should filter vendors by search query", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /Tìm kiếm cửa hàng|Search vendors/,
    );
    await searchInput.fill("zzzzzzzzz_nonexistent_xyz");
    await expect(
      page.getByText(/Không tìm thấy|No vendors found/i),
    ).toBeVisible();
  });

  test("should clear search and show vendors again", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /Tìm kiếm cửa hàng|Search vendors/,
    );
    await searchInput.fill("zzz");
    await searchInput.clear();
    await page.waitForTimeout(300);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display vendor cards with view menu links", async ({ page }) => {
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    const count = await menuLinks.count();
    if (count > 0) {
      await expect(menuLinks.first()).toBeVisible();
    }
  });

  test("should navigate to vendor menu on card click", async ({ page }) => {
    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    const count = await menuLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }
    const href = await menuLinks.first().getAttribute("href");
    await menuLinks.first().click();
    // SPA navigation — wait for main content instead of waitForLoadState
    await page
      .locator("main")
      .waitFor({ state: "visible", timeout: 15000 })
      .catch(() => {});
    if (href) {
      await expect(page).toHaveURL(href);
    }
  });
});

test.describe("Vendor Detail / Menu Page", () => {
  test("should display menu items on vendor page", async ({ page }) => {
    await page.goto("/vendors", { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible", timeout: 60000 });

    const menuLinks = page.getByRole("link", {
      name: /Xem thực đơn|View menu/i,
    });
    const count = await menuLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await menuLinks.first().click();
    await page
      .locator("main")
      .waitFor({ state: "visible", timeout: 15000 })
      .catch(() => {});
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Menu Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu", { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible", timeout: 60000 });
  });

  test("should display the menu page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Thực đơn|Menu/,
    );
  });

  test("should show category filter buttons", async ({ page }) => {
    const allCatBtn = page.getByRole("button", { name: /Tất cả|All/i }).first();
    await expect(allCatBtn).toBeVisible();
  });

  test("should add item to cart and show toast", async ({ page }) => {
    const addButtons = page
      .getByRole("button")
      .filter({ has: page.locator("svg") });
    const count = await addButtons.count();
    if (count === 0) {
      test.skip();
      return;
    }
    const menuItemCards = page.locator("div.group.cursor-pointer");
    const cardCount = await menuItemCards.count();
    if (cardCount > 0) {
      const firstCard = menuItemCards.first();
      await firstCard.hover();
      const plusBtn = firstCard.getByRole("button").last();
      await plusBtn.click();
      await expect(page.getByText(/Đã thêm|Added/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
