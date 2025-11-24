import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./basePage";

export default class ProductPage extends BasePage {
  readonly page: Page;
  readonly productListLink: Locator;
  readonly addToCartButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.productListLink = this.page.locator(
      "[data-test = 'inventory-item-name']"
    );
    this.addToCartButton = this.page.getByText("Add to cart");
    this.backToProductsButton = this.page.getByRole("button", {
      name: "Back to products",
    });
  }

  async addAllItemsToCart(productNames: string[]) {
    for (const name of productNames) {
      const productLocator = this.productListLink.filter({ hasText: name });
      await productLocator.click();
      await this.addToCartButton.click();
      await this.backToProductsButton.click();
    }
  }
}
