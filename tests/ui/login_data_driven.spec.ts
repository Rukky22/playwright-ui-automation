import { test, expect } from "@playwright/test";
import LoginPage from "../../pages/loginPage";
import ProductPage from "../../pages/productPage";
import testData from "../../test-data/testData.json";
import "dotenv/config";

test.describe("LoginPage Tests", () => {
  let loginPage: LoginPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productPage = new ProductPage(page);
    await loginPage.navigateToLogin();
  });

  test.describe("Positive Tests", () => {
    test("should login successfully with valid credentials", async () => {
      const { username, password } = testData.users.validUser;
      await loginPage.login(username, password);
      await loginPage.verifyLoginSuccess();
      await productPage.verifyOnProductPage();
    });

    test("should navigate to login page successfully", async () => {
      await expect(loginPage.userLoggingDataBackground).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test("should handle multiple successful logins in sequence", async ({
      context,
    }) => {
      const { username, password } = testData.users.validUser;

      await loginPage.login(username, password);
      await loginPage.verifyLoginSuccess();

      // Create new page for second login
      const page2 = await context.newPage();
      const loginPage2 = new LoginPage(page2);
      await loginPage2.navigateToLogin();
      await loginPage2.login(username, password);
      await loginPage2.verifyLoginSuccess();

      await page2.close();
    });
  });

  test.describe("Negative Tests", () => {
    test("should fail login with invalid username", async () => {
      const { username, password } = testData.credentials.invalidUsername;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
      await expect(loginPage.userLoggingDataBackground).toBeVisible();
    });

    test("should fail login with invalid password", async () => {
      const { username, password } = testData.credentials.invalidPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should fail login with both invalid credentials", async () => {
      const { username, password } = testData.credentials.bothInvalid;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should fail login with empty username", async () => {
      const { username, password } = testData.credentials.emptyUsername;
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail login with empty password", async () => {
      const { username, password } = testData.credentials.emptyPassword;
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail login with both fields empty", async () => {
      const { username, password } = testData.credentials.bothEmpty;
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail with locked out user", async () => {
      const { username, password } = testData.users.lockedOutUser;
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText("locked out");
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle special characters in username", async () => {
      const { username, password } = testData.edgeCases.specialCharsUsername;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle special characters in password", async () => {
      const { username, password } = testData.edgeCases.specialCharsPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle very long username", async () => {
      const longUsername = "a".repeat(1000);
      const { password } = testData.users.validUser;
      await loginPage.login(longUsername, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle very long password", async () => {
      const { username } = testData.users.validUser;
      const longPassword = "a".repeat(1000);
      await loginPage.login(username, longPassword);
      await loginPage.verifyLoginFailure();
    });

    test("should handle SQL injection attempts in username", async () => {
      const { username, password } = testData.edgeCases.sqlInjectionUsername;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle SQL injection attempts in password", async () => {
      const { username, password } = testData.edgeCases.sqlInjectionPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle whitespace-only username", async () => {
      const { username, password } = testData.edgeCases.whitespaceOnlyUsername;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle whitespace-only password", async () => {
      const { username, password } = testData.edgeCases.whitespaceOnlyPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should trim leading/trailing spaces in credentials", async () => {
      const { username, password } = testData.credentials.withSpaces;
      await loginPage.login(username, password);
      // This test validates whether the application trims spaces
      // Expected behavior may vary based on application requirements
    });

    test("should handle rapid multiple login attempts", async () => {
      const { username, password } = testData.credentials.bothInvalid;
      for (let i = 0; i < 3; i++) {
        await loginPage.login(username, password);
        await expect(loginPage.errorMessage).toBeVisible();
      }
    });

    test("should maintain input values after failed login", async () => {
      const { username, password } = testData.credentials.invalidPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();

      const usernameValue = await loginPage.usernameInput.inputValue();
      expect(usernameValue).toBe(username);
    });

    test("should handle case sensitivity in username", async () => {
      const { username, password } = testData.edgeCases.uppercaseUsername;
      await loginPage.login(username, password);
      // Verify expected behavior based on application requirements
    });

    test("should handle Unicode characters in credentials", async () => {
      const { username, password } = testData.edgeCases.unicodeChars;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();
    });

    test("should handle Enter key press on password field", async () => {
      const { username, password } = testData.users.validUser;
      await loginPage.enterText(loginPage.usernameInput, username);
      await loginPage.enterText(loginPage.passwordInput, password);
      await loginPage.passwordInput.press("Enter");
      await loginPage.verifyLoginSuccess();
    });
  });

  test.describe("UI Validation Tests", () => {
    test("should display all login form elements", async () => {
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.loginButton).toBeEnabled();
    });

    test("should have correct input field placeholders", async () => {
      await expect(loginPage.usernameInput).toHaveAttribute(
        "placeholder",
        "Username"
      );
      await expect(loginPage.passwordInput).toHaveAttribute(
        "placeholder",
        "Password"
      );
    });

    test("should mask password input", async () => {
      await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    });

    test("should clear error message when starting new login attempt", async () => {
      const { username, password } = testData.credentials.invalidPassword;
      await loginPage.login(username, password);
      await loginPage.verifyLoginFailure();

      await loginPage.usernameInput.clear();
      await loginPage.usernameInput.fill(testData.users.validUser.username);

      // Verify if error clears on new input (application-specific behavior)
    });
  });
});
