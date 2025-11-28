// File: global-setup.ts
import { chromium, FullConfig } from "@playwright/test";
import LoginPage from "./pages/loginPage";
import TestDataHelper from "./utils/helpers/testDataHelper";

async function globalSetup(config: FullConfig) {
  console.log("Running global setup...");

  // Load Playwright config, including baseURL
  const browser = await chromium.launch();
  const project = config.projects[0]; // first project (chromium)
  const useOptions = project.use ?? {}; // use settings (baseURL, etc.)

  const context = await browser.newContext(useOptions);
  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  try {
    // This now WORKS because baseURL is applied correctly
    await loginPage.navigateToLogin();

    const { username, password } = TestDataHelper.getValidUser();
    console.log(`Logging in with: ${username}`);

    await loginPage.login(username, password);
    await loginPage.verifyLoginSuccess();

    await context.storageState({ path: "./auth.json" });
    console.log("Global setup completed successfully");
  } catch (error) {
    console.error("Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
