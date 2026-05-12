const { test, expect } = require("@playwright/test");

const TEST_LISTING_TITLE = "E2E Test Item - Please Ignore";

test("dashboard shows listing cards", async ({ page }) => {
  await page.goto("/");
  // ItemCard renders as <Link> → <a href="/item/...">
  await expect(page.locator("a[href*='/item/']").first()).toBeVisible({ timeout: 10000 });
});

test("user can create a listing and see it", async ({ page }) => {
  await page.goto("/post");
  await expect(page).not.toHaveURL(/login/);

  await page.fill('input[placeholder*="Dining Table"]', TEST_LISTING_TITLE);

  await page.selectOption('select', { label: "Other" }); // category

  // Condition
  await page.locator("select").nth(1).selectOption("good");

  // Origin
  await page.locator("select").nth(2).selectOption("owned");

  // Switch to manual address
  await page.getByRole("button", { name: /enter item address/i }).click();

  await page.fill('input[placeholder*="123 Main Street"]', "123 Main St");
  await page.fill('input[placeholder*="Amherst"]', "Amherst");
  await page.fill('input[placeholder*="MA"]', "MA");
  await page.fill('input[placeholder*="01002"]', "01002");
  await page.fill('input[placeholder*="United States"]', "United States");

  await page.getByRole("button", { name: /create listing/i }).click();

  // Should redirect to the item detail page
  await expect(page).toHaveURL(/\/item\//, { timeout: 15000 });
  await expect(page.getByText(TEST_LISTING_TITLE)).toBeVisible();
});

test("user can view listing detail page", async ({ page }) => {
  await page.goto("/");
  // Click the first listing card
  await page.locator("article, a[href*='/item/']").first().click();
  await expect(page).toHaveURL(/\/item\//);
});
