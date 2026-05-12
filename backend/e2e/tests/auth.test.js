const { test, expect } = require("@playwright/test");

test("logged-in user can see the dashboard and navbar", async ({ page }) => {
  await page.goto("/");
  await expect(page).not.toHaveURL(/login/);
  // Navbar should be visible
  await expect(page.locator("nav")).toBeVisible();
});

test("logged-in user can visit profile page", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).not.toHaveURL(/login/);
  // The profile tab nav and the Personal Details section heading are reliable markers
  await expect(page.getByRole("heading", { name: "Personal Details" })).toBeVisible({ timeout: 10000 });
});

test("logged-out user is redirected to dashboard from profile", async ({ page }) => {
  await page.goto("/profile");
  // Sign out via UI
  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page).toHaveURL("/");
});
