import { chromium } from "@playwright/test";
import LoginPage from "./pages/loginPage";

export default async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to your website's login page
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();

  // Filling the login form
  await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);

  //Confirm login is successful
  await loginPage.verifyLoginSuccess();

  //Once we have login, store the state in session storage file
  await context.storageState({ path: "./test-data/storageState.json" });
  use: {
    storageState: "./test-data/storageState.json";
  }
  await browser.close();
};
