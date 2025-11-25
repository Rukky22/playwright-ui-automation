import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./basePage";

export default class LoginPage extends BasePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByTestId("error-button");
  }

  async navigateToLogin() {
    await this.navigateTo("/");
    await this.waitForPageLoad();
  }

  async login(username: string, password: string) {
    await this.enterText(this.usernameInput, username);
    await this.enterText(this.passwordInput, password);
    await this.loginButton.click();
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL("**/inventory.html");
  }

  async verifyLoginFailure() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(
      "Epic sadface: Username and password do not match any user in this service"
    );
  }
}
