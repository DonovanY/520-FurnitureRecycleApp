const { test, expect, chromium } = require("@playwright/test");
const path = require("path");

const LISTING_TITLE = "E2E Request Test Item - Please Ignore";

// Helper: create a listing as user1 and return its URL
async function createListing(page) {
  await page.goto("/post");
  await page.fill('input[placeholder*="Dining Table"]', LISTING_TITLE);
  await page.locator("select").nth(0).selectOption("Other");
  await page.locator("select").nth(1).selectOption("good");
  await page.locator("select").nth(2).selectOption("owned");
  await page.getByRole("button", { name: /enter item address/i }).click();
  await page.fill('input[placeholder*="123 Main Street"]', "123 Main St");
  await page.fill('input[placeholder*="Amherst"]', "Amherst");
  await page.fill('input[placeholder*="MA"]', "MA");
  await page.fill('input[placeholder*="01002"]', "01002");
  await page.fill('input[placeholder*="United States"]', "United States");
  await page.getByRole("button", { name: /create listing/i }).click();
  await page.waitForURL(/\/item\//, { timeout: 15000 });
  return page.url();
}

test("user2 can request a listing created by user1", async ({ browser }) => {
  // --- User1: create a listing ---
  const ctx1 = await browser.newContext({
    storageState: path.resolve(__dirname, "../auth.json"),
  });
  const page1 = await ctx1.newPage();
  const listingUrl = await createListing(page1);
  await ctx1.close();

  // --- User2: visit the listing and submit a request ---
  const ctx2 = await browser.newContext({
    storageState: path.resolve(__dirname, "../auth2.json"),
  });
  const page2 = await ctx2.newPage();
  await page2.goto(listingUrl);

  await expect(page2.getByText(LISTING_TITLE)).toBeVisible({ timeout: 8000 });

  // Fill message first, then submit — the form is always visible on the detail page
  await page2.fill("textarea", "E2E test request message");
  await page2.getByRole("button", { name: "Request This Item" }).click();

  // After submitting, the status badge should show "pending"
  await expect(page2.getByText(/pending/i)).toBeVisible({ timeout: 8000 });

  await ctx2.close();
});

test("user1 can see incoming requests on their listing", async ({ browser }) => {
  // User1: go to profile → posted items → check requests button exists
  const ctx1 = await browser.newContext({
    storageState: path.resolve(__dirname, "../auth.json"),
  });
  const page1 = await ctx1.newPage();
  await page1.goto("/profile?tab=posted");

  await expect(
    page1.getByRole("button", { name: /view requests|requests/i }).first()
  ).toBeVisible({ timeout: 10000 });

  await ctx1.close();
});
