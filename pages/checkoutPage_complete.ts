import BasePage from "./basePage";
import { Page, expect, Locator } from "@playwright/test";

export default class checkoutPageComplete extends BasePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly backHomeButton: Locator;
  readonly thankYouMessage: Locator;
  readonly cartPageLink: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = this.page.locator('[data-test="title"]');
    this.backHomeButton = this.page.getByRole("button", { name: "Back Home" });
    this.thankYouMessage = this.page.getByText("Thank you for your order!");
    this.cartPageLink = this.page.locator(".shopping_cart_link");
  }

  async verifyOnCheckoutCompletePage() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL("/.*checkout-complete.*/");
    await expect(this.pageTitle).toHaveText("Checkout: Complete!");
  }

  async verifyThankYouMessageDisplayed() {
    await this.thankYouMessage.isVisible();
  }

  async goBackToCartPage() {
    await this.cartPageLink.click();
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL("/.*cart.*/");
  }

  async goBackToHomePage() {
    await this.backHomeButton.click();
  }
}
