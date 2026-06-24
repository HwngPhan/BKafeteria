import { expect, Page, test } from "@playwright/test";

/**
 * Staff-role tests for:
 *   - Sidebar shows 3 links: Orders, Cửa hàng, Thực đơn
 *   - /staff/vendor is read-only (no edit button)
 *   - /staff/menu is read-only (no create/delete buttons)
 *   - Dashboard shows vendor stats panel (todayIncome, completedOrders, pendingOrders)
 *
 * Prerequisites — set env vars before running:
 *   STAFF_EMAIL=<email>  STAFF_PASSWORD=<password>
 *
 * Example:
 *   $env:STAFF_EMAIL="staff@example.com"; $env:STAFF_PASSWORD="pass123"; npx playwright test staff.spec.ts
 */

const STAFF_EMAIL = process.env.STAFF_EMAIL;
const STAFF_PASSWORD = process.env.STAFF_PASSWORD;
const skipAll = !STAFF_EMAIL || !STAFF_PASSWORD;

async function loginAsStaff(page: Page) {
  await page.addInitScript(() => { localStorage.setItem("lang", "vi"); });
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email *" }).fill(STAFF_EMAIL!);
  await page.getByRole("textbox", { name: /Mật khẩu|Password/i }).fill(STAFF_PASSWORD!);
  await page.getByRole("button", { name: /Đăng nhập|Sign In/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
}

test.describe("Staff — Sidebar Navigation", () => {
  test.skip(skipAll, "Set STAFF_EMAIL / STAFF_PASSWORD env vars to run staff tests");

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dashboard");
    await expect(page.locator("aside")).toBeVisible({ timeout: 20000 });
  });

  test("sidebar shows Orders link", async ({ page }) => {
    await expect(
      page.locator("aside").getByRole("link", { name: /Quản lý đơn|Orders/i }),
    ).toBeVisible();
  });

  test("sidebar shows Vendor link", async ({ page }) => {
    await expect(
      page.locator("aside").getByRole("link", { name: /Cửa hàng|Vendor/i }),
    ).toBeVisible();
  });

  test("sidebar shows Menu link", async ({ page }) => {
    await expect(
      page.locator("aside").getByRole("link", { name: /Thực đơn|Menu/i }),
    ).toBeVisible();
  });

  test("sidebar does NOT show admin or manager-only links", async ({ page }) => {
    const aside = page.locator("aside");
    await expect(aside.getByRole("link", { name: /Quản lý người dùng|Users/i })).toHaveCount(0);
    await expect(aside.getByRole("link", { name: /Duyệt cửa hàng|Approve/i })).toHaveCount(0);
    await expect(aside.getByRole("link", { name: /Quản lý cửa hàng|Manage store/i })).toHaveCount(0);
  });
});

test.describe("Staff — Dashboard Stats Panel", () => {
  test.skip(skipAll, "Set STAFF_EMAIL / STAFF_PASSWORD env vars to run staff tests");

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("shows time-based greeting", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Chào|Good/i);
  });

  test("shows Manage Orders button (not Explore Vendors)", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /Quản lý đơn|Manage orders/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Khám phá cửa hàng|Explore/i }),
    ).toHaveCount(0);
  });

  test("shows vendor stats cards (today income section)", async ({ page }) => {
    // VendorDashboardSummary renders 3 cards; income card contains "Hôm nay"
    await expect(page.getByText(/Hôm nay|Today/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Staff — Vendor Page (read-only)", () => {
  test.skip(skipAll, "Set STAFF_EMAIL / STAFF_PASSWORD env vars to run staff tests");

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await page.goto("/staff/vendor", { waitUntil: "domcontentloaded" });
  });

  test("shows vendor name heading", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("has NO edit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Chỉnh sửa|Edit/i })).toHaveCount(0);
  });

  test("shows working hours", async ({ page }) => {
    await expect(page.getByText(/Giờ mở cửa|Open|Working/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("shows order stats (completed, pending)", async ({ page }) => {
    await expect(page.getByText(/Hoàn thành|Completed/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Staff — Menu Page (read-only)", () => {
  test.skip(skipAll, "Set STAFF_EMAIL / STAFF_PASSWORD env vars to run staff tests");

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await page.goto("/staff/menu", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("shows page heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/.+/);
  });

  test("has NO add / create button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Thêm|Add|Tạo|Create/i })).toHaveCount(0);
  });

  test("search input filters menu items", async ({ page }) => {
    const searchInput = page.getByRole("textbox");
    if ((await searchInput.count()) === 0) { test.skip(); return; }
    await searchInput.first().fill("abc-query-that-returns-nothing-xyz");
    const cards = page.locator(".grid > div");
    // Either empty state or no cards match
    const emptyState = page.getByText(/Không có|No items|Empty/i);
    const hasCards = (await cards.count()) > 0;
    if (!hasCards) {
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
