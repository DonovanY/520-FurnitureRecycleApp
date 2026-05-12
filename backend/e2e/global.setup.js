const { chromium } = require("@playwright/test");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/login");

  await page.fill("#email", process.env.TEST_USER_EMAIL);
  await page.fill("#password", process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait until redirected away from /login (auth completed)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10000,
  });

  await page.context().storageState({ path: path.resolve(__dirname, "auth.json") });
  await browser.close();
}

module.exports = globalSetup;
