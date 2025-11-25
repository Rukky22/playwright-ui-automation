import { test as setup } from "@playwright/test";
import LoginPage from "../pages/loginPage";
import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate as standard user", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigateToLogin();
  await loginPage.login("standard_user", "secret_sauce");
  await loginPage.verifyLoginSuccess();

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
