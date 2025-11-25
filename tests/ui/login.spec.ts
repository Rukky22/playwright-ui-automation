import { test, expect } from "@playwright/test";
import LoginPage from "../../pages/loginPage";
import ProductPage from "../../pages/productPage";

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
      await loginPage.login("standard_user", "secret_sauce");
      await loginPage.verifyLoginSuccess();
      await productPage.verifyOnProductPage();
    });

    test("should navigate to login page successfully", async () => {
      await expect(loginPage.page).toHaveURL(/.*login.*/);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test("should handle multiple successful logins in sequence", async ({
      context,
    }) => {
      await loginPage.login("standard_user", "secret_sauce");
      await loginPage.verifyLoginSuccess();

      // Create new page for second login
      const page2 = await context.newPage();
      const loginPage2 = new LoginPage(page2);
      await loginPage2.navigateToLogin();
      await loginPage2.login("standard_user", "secret_sauce");
      await loginPage2.verifyLoginSuccess();

      await page2.close();
    });
  });

  test.describe("Negative Tests", () => {
    test("should fail login with invalid username", async () => {
      await loginPage.login("invalid_user", "secret_sauce");
      await loginPage.verifyLoginFailure();
      await expect(loginPage.page).toHaveURL(/.*login.*/);
    });

    test("should fail login with invalid password", async () => {
      await loginPage.login("standard_user", "wrong_password");
      await loginPage.verifyLoginFailure();
    });

    test("should fail login with both invalid credentials", async () => {
      await loginPage.login("invalid_user", "wrong_password");
      await loginPage.verifyLoginFailure();
    });

    test("should fail login with empty username", async () => {
      await loginPage.login("", "secret_sauce");
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail login with empty password", async () => {
      await loginPage.login("standard_user", "");
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail login with both fields empty", async () => {
      await loginPage.login("", "");
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test("should fail with locked out user", async () => {
      await loginPage.login("locked_out_user", "secret_sauce");
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText("locked out");
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle special characters in username", async () => {
      await loginPage.login("user@#$%^&*()", "secret_sauce");
      await loginPage.verifyLoginFailure();
    });

    test("should handle special characters in password", async () => {
      await loginPage.login("standard_user", "pass@#$%");
      await loginPage.verifyLoginFailure();
    });

    test("should handle very long username", async () => {
      const longUsername = "a".repeat(1000);
      await loginPage.login(longUsername, "secret_sauce");
      await loginPage.verifyLoginFailure();
    });

    test("should handle very long password", async () => {
      const longPassword = "a".repeat(1000);
      await loginPage.login("standard_user", longPassword);
      await loginPage.verifyLoginFailure();
    });

    test("should handle SQL injection attempts in username", async () => {
      await loginPage.login("admin' OR '1'='1", "secret_sauce");
      await loginPage.verifyLoginFailure();
    });

    test("should handle SQL injection attempts in password", async () => {
      await loginPage.login("standard_user", "' OR '1'='1");
      await loginPage.verifyLoginFailure();
    });

    test("should handle whitespace-only username", async () => {
      await loginPage.login("   ", "secret_sauce");
      await loginPage.verifyLoginFailure();
    });

    test("should handle whitespace-only password", async () => {
      await loginPage.login("standard_user", "   ");
      await loginPage.verifyLoginFailure();
    });

    test("should trim leading/trailing spaces in credentials", async () => {
      await loginPage.login("  standard_user  ", "  secret_sauce  ");
      // This test validates whether the application trims spaces
      // Expected behavior may vary based on application requirements
    });

    test("should handle rapid multiple login attempts", async () => {
      for (let i = 0; i < 3; i++) {
        await loginPage.login("invalid_user", "wrong_password");
        await expect(loginPage.errorMessage).toBeVisible();
      }
    });

    test("should maintain input values after failed login", async () => {
      await loginPage.login("invalid_user", "wrong_password");
      await loginPage.verifyLoginFailure();

      const usernameValue = await loginPage.usernameInput.inputValue();
      expect(usernameValue).toBe("invalid_user");
    });

    test("should handle case sensitivity in username", async () => {
      await loginPage.login("STANDARD_USER", "secret_sauce");
      // Verify expected behavior based on application requirements
    });

    test("should handle Unicode characters in credentials", async () => {
      await loginPage.login("用户名", "パスワード");
      await loginPage.verifyLoginFailure();
    });

    test("should handle Enter key press on password field", async () => {
      await loginPage.enterText(loginPage.usernameInput, "standard_user");
      await loginPage.enterText(loginPage.passwordInput, "secret_sauce");
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
      await loginPage.login("invalid_user", "wrong_password");
      await loginPage.verifyLoginFailure();

      await loginPage.usernameInput.clear();
      await loginPage.usernameInput.fill("standard_user");

      // Verify if error clears on new input (application-specific behavior)
    });
  });
});
