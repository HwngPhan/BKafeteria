import { expect, Page, test } from "@playwright/test";

/**
 * Manager-role tests for:
 *   - Dashboard shows vendor stats panel
 *   - /manager/vendor shows real stats (not "--")
 *   - /manager/vendor/create has image upload section
 *   - /manager/menu shows Add button and edit overlay
 *
 * Prerequisites — set env vars before running:
 *   MANAGER_EMAIL=<email>  MANAGER_PASSWORD=<password>
 *
 * Example (PowerShell):
 *   $env:MANAGER_EMAIL="manager@example.com"; $env:MANAGER_PASSWORD="pass123"; npx playwright test manager.spec.ts
 */

const MANAGER_EMAIL = process.env.MANAGER_EMAIL;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;
const skipAll = !MANAGER_EMAIL || !MANAGER_PASSWORD;

async function loginAsManager(page: Page) {
  await page.addInitScript(() => { localStorage.setItem("lang", "vi"); });
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email *" }).fill(MANAGER_EMAIL!);
  await page.getByRole("textbox", { name: /Mật khẩu|Password/i }).fill(MANAGER_PASSWORD!);
  await page.getByRole("button", { name: /Đăng nhập|Sign In/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
}

test.describe("Manager — Dashboard Stats Panel", () => {
  test.skip(skipAll, "Set MANAGER_EMAIL / MANAGER_PASSWORD env vars to run manager tests");

  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("shows vendor stats cards instead of explore buttons", async ({ page }) => {
    await expect(page.getByText(/Hôm nay|Today/i).first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("link", { name: /Khám phá cửa hàng|Explore/i }),
    ).toHaveCount(0);
  });

  test("shows Manage Orders and My Vendor buttons", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /Quản lý đơn|Manage orders/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Cửa hàng của tôi|My vendor/i }),
    ).toBeVisible();
  });
});

test.describe("Manager — Vendor Page Stats", () => {
  test.skip(skipAll, "Set MANAGER_EMAIL / MANAGER_PASSWORD env vars to run manager tests");

  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
    await page.goto("/manager/vendor", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("completed orders shows a number not '--'", async ({ page }) => {
    // The stats sidebar should have a numeric value, not the placeholder "--"
    const completedSection = page.getByText(/Hoàn thành|Completed/i).first();
    await expect(completedSection).toBeVisible({ timeout: 10000 });
    // The sibling value should be a digit
    await expect(page.locator("text=/^\\d+$/").first()).toBeVisible({ timeout: 5000 });
  });

  test("income section shows today/week/month cards", async ({ page }) => {
    await expect(page.getByText(/Hôm nay|Today/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Tuần này|This week/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Tháng này|This month/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Manager — Vendor Create Page (image upload)", () => {
  test.skip(skipAll, "Set MANAGER_EMAIL / MANAGER_PASSWORD env vars to run manager tests");

  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
    await page.goto("/manager/vendor/create", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
  });

  test("image upload area is present in the form", async ({ page }) => {
    // ImageUpload renders a file input or a clickable area
    const fileInput = page.locator('input[type="file"]');
    const uploadArea = page.getByText(/Tải ảnh|Upload|Chọn ảnh|Choose/i);
    const hasFileInput = (await fileInput.count()) > 0;
    const hasUploadText = (await uploadArea.count()) > 0;
    expect(hasFileInput || hasUploadText).toBe(true);
  });
});
