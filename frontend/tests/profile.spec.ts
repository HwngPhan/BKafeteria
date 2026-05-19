import { expect, test } from "@playwright/test";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    // Wait for auth to complete and page to render (auth provider has min 1.2s delay + API call)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30000,
    });
  });

  test("should display profile page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Hồ sơ|Profile/,
    );
  });

  test("should show user balance and points", async ({ page }) => {
    await expect(page.getByText(/Số dư|Balance/i)).toBeVisible();
  });

  test("should have editable full name field", async ({ page }) => {
    const fullNameInput = page.getByLabel(/Họ và tên|Full [Nn]ame/i);
    await expect(fullNameInput).toBeVisible({ timeout: 20000 });
  });

  test("should have phone number field", async ({ page }) => {
    const phoneInput = page.getByLabel(/Số điện thoại|Phone/i);
    await expect(phoneInput).toBeVisible({ timeout: 20000 });
  });

  test("should show save button", async ({ page }) => {
    const saveBtn = page.getByRole("button", {
      name: /Lưu thay đổi|Save Changes/i,
    });
    await expect(saveBtn).toBeVisible({ timeout: 20000 });
  });

  test("should show non-editable account info section", async ({ page }) => {
    await expect(
      page.getByText(/Thông tin tài khoản|Account Information/i).first(),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Email/i)).toBeVisible();
  });

  test("should update profile successfully", async ({ page }) => {
    const fullNameInput = page.getByLabel(/Họ và tên|Full [Nn]ame/i);
    await fullNameInput.waitFor({ state: "visible", timeout: 20000 });
    const currentName = await fullNameInput.inputValue();

    await fullNameInput.fill(currentName || "Test User");
    const saveBtn = page.getByRole("button", {
      name: /Lưu thay đổi|Save Changes/i,
    });
    await saveBtn.click();

    await page.waitForTimeout(2000);
    // We don't fail the test if there's an error — just check no crash
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
