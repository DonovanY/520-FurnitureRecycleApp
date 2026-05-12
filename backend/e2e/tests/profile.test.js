const { test, expect } = require("@playwright/test");

test("user can update their full name", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Personal Details" })).toBeVisible({ timeout: 10000 });

  // Use a timestamp so the value always differs from the current stored name
  const testName = `E2E User ${Date.now()}`;
  const nameInput = page.locator("#profile-full-name");
  await nameInput.fill(testName);

  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Profile updated successfully.")).toBeVisible({ timeout: 8000 });
});

test("posted items tab shows listings", async ({ page }) => {
  await page.goto("/profile?tab=posted");
  await expect(page.getByRole("button", { name: /Add New Item/i })).toBeVisible({ timeout: 8000 });
});

test("requested items tab loads without error", async ({ page }) => {
  await page.goto("/profile?tab=requested");
  // Should not show an error — either shows items or the empty state message
  await expect(page.getByText(/requested|No requested items/i).first()).toBeVisible({ timeout: 8000 });
});
