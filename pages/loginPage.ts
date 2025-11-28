import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./basePage";
import "dotenv/config";

export default class LoginPage extends BasePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly userLoggingDataBackground: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.locator('h3[data-test="error"]');
    this.userLoggingDataBackground = page.locator(
      ".login_credentials_wrap-inner"
    );
  }

  async navigateToLogin() {
    await this.navigateTo("/");
    await this.waitForPageLoad();
  }

  async login(username: string, password: string) {
    console.log(
      `Entering Username and Password as ${username} and ${password}`
    );
    await this.enterText(this.usernameInput, username);
    await this.enterText(this.passwordInput, password);
    await this.loginButton.click();

    // Wait for navigation to settle - either success or failure
    await this.waitForPageLoad();
  }

  async verifyLoginSuccess() {
    console.log(`Current URL is: ${this.page.url()}`);

    // Verify we navigated to inventory page
    await expect(this.page).toHaveURL(/.*inventory\.html/);

    console.log(`Successfully navigated to: ${this.page.url()}`);
  }

  async verifyLoginFailure() {
    // Wait for error message to be visible
    await expect(this.errorMessage).toBeVisible();

    // Verify we're still on login page (not navigated away)
    await expect(this.userLoggingDataBackground).toBeVisible();
  }
}
