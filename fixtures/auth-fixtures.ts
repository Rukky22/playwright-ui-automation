import { test as setup } from "@playwright/test";
import LoginPage from "../pages/loginPage";
import testData from "../test-data/testData.json";
import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate as standard user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const { username, password } = testData.users.validUser;

  await loginPage.navigateToLogin();
  await loginPage.login("username", "password");
  await loginPage.verifyLoginSuccess();

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
