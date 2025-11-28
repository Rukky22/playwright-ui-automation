import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests",

  // Set baseURL from environment variable
  use: {
    baseURL: process.env.BASE_URL || "https://www.saucedemo.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Navigation timeout - applies to page.goto, page.waitForURL, etc.
    navigationTimeout: 30000,

    // Action timeout - applies to click, fill, etc.
    actionTimeout: 10000,
  },

  // Global setup
  globalSetup: require.resolve("./global-setup"),

  // Test timeout - maximum time one test can run
  timeout: 60000,

  // Expect timeout - applies to all expect() assertions
  expect: {
    timeout: 15000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ["html"],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    //   {
    //     name: "firefox",
    //     use: { ...devices["Desktop Firefox"] },
    //   },

    //   {
    //     name: "webkit",
    //     use: { ...devices["Desktop Safari"] },
    //   },

    //   // Mobile viewports
    //   {
    //     name: "Mobile Chrome",
    //     use: { ...devices["Pixel 5"] },
    //   },
    //   {
    //     name: "Mobile Safari",
    //     use: { ...devices["iPhone 12"] },
    //   },
  ],
});
