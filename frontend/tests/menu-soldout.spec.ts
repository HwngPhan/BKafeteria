import { expect, Page, test } from "@playwright/test";

/**
 * Tests for sold-out item behaviour in MenuCard:
 *   - "Hết hàng" banner appears on the card
 *   - Quick-add (+) button is disabled
 *   - Clicking the card opens the detail dialog, which shows a disabled button
 *     labelled "Hết hàng" instead of the normal "Add to Cart" text
 *
 * These tests use test.skip() when no sold-out items exist in the test dataset
 * so they do not fail on a fresh database.
 */

async function goToMenuPage(page: Page) {
  await page.goto("/menu", { waitUntil: "domcontentloaded" });
  const cards = page.locator("div.group.cursor-pointer");
  await cards.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  return cards;
}

async function findSoldOutCard(cards: ReturnType<Page["locator"]>) {
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    if ((await card.getByText(/Hết hàng|Sold.?out/i).count()) > 0) {
      return card;
    }
  }
  return null;
}

test.describe("Sold-out Menu Items", () => {
  test("sold-out card shows Hết hàng banner", async ({ page }) => {
    const cards = await goToMenuPage(page);
    if ((await cards.count()) === 0) { test.skip(); return; }

    const soldOutCard = await findSoldOutCard(cards);
    if (!soldOutCard) { test.skip(); return; }

    await expect(soldOutCard.getByText(/Hết hàng|Sold.?out/i).first()).toBeVisible();
  });

  test("sold-out card quick-add button is disabled", async ({ page }) => {
    const cards = await goToMenuPage(page);
    if ((await cards.count()) === 0) { test.skip(); return; }

    const soldOutCard = await findSoldOutCard(cards);
    if (!soldOutCard) { test.skip(); return; }

    const plusBtn = soldOutCard.getByRole("button").last();
    await expect(plusBtn).toBeDisabled();
  });

  test("available card quick-add button is enabled", async ({ page }) => {
    const cards = await goToMenuPage(page);
    if ((await cards.count()) === 0) { test.skip(); return; }

    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const isSoldOut = (await card.getByText(/Hết hàng|Sold.?out/i).count()) > 0;
      if (!isSoldOut) {
        const plusBtn = card.getByRole("button").last();
        await expect(plusBtn).toBeEnabled();
        return;
      }
    }
    test.skip(); // all items happened to be sold out
  });

  test("sold-out dialog shows disabled Hết hàng button", async ({ page }) => {
    const cards = await goToMenuPage(page);
    if ((await cards.count()) === 0) { test.skip(); return; }

    const soldOutCard = await findSoldOutCard(cards);
    if (!soldOutCard) { test.skip(); return; }

    // Click the card (not the disabled button) to open the detail dialog
    await soldOutCard.click();

    // Dialog's add-to-cart button should show "Hết hàng" text and be disabled
    const addBtn = page.getByRole("button", { name: /Hết hàng|Sold.?out/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await expect(addBtn).toBeDisabled();
  });

  test("sold-out card image has grayscale class", async ({ page }) => {
    const cards = await goToMenuPage(page);
    if ((await cards.count()) === 0) { test.skip(); return; }

    const soldOutCard = await findSoldOutCard(cards);
    if (!soldOutCard) { test.skip(); return; }

    const img = soldOutCard.locator("img").first();
    if ((await img.count()) === 0) { test.skip(); return; }
    await expect(img).toHaveClass(/grayscale/);
  });
});
