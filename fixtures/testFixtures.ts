import { test as base } from "@playwright/test";
import LoginPage from "../pages/loginPage";
import ProductPage from "../pages/productPage";
import CartPage from "../pages/cartPage";
import CheckoutPage from "../pages/checkoutPage";

type TestFixtures = {
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login("standard_user", "secret_sauce");
    await loginPage.verifyLoginSuccess();
    await use();
  },
});

export { expect } from "@playwright/test";
