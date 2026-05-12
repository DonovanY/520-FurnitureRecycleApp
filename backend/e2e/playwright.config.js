// @ts-check
const { defineConfig } = require("@playwright/test");
const path = require("path");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  globalSetup: "./global.setup.js",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    storageState: path.resolve(__dirname, "auth.json"),
  },
});
