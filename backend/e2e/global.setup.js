const { chromium } = require("@playwright/test");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function loginAndSave(browser, email, password, outputFile) {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10000,
  });
  await page.context().storageState({ path: outputFile });
  await page.close();
}

async function globalSetup() {
  const browser = await chromium.launch();

  await loginAndSave(
    browser,
    process.env.TEST_USER_EMAIL,
    process.env.TEST_USER_PASSWORD,
    path.resolve(__dirname, "auth.json")
  );

  await loginAndSave(
    browser,
    process.env.TEST_USER2_EMAIL,
    process.env.TEST_USER2_PASSWORD,
    path.resolve(__dirname, "auth2.json")
  );

  await browser.close();
}

module.exports = globalSetup;
