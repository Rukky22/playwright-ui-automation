import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./basePage";

export default class ProductPage extends BasePage {
  readonly page: Page;
  readonly productListLink: Locator;
  readonly addToCartButton: Locator;
  readonly backToProductsButton: Locator;
  readonly completeProductList: Locator;
  readonly pageTitle: Locator;

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
    this.completeProductList = this.page
      .locator("#inventory_container")
      .locator("[data-test ='inventory-list']");
    this.pageTitle = this.page.locator('[data-test="title"]');
  }

  async verifyOnProductPage() {
    await expect(this.pageTitle).toHaveText("Products");
    await expect(this.pageTitle).toBeVisible();
  }
  async addAllItemsToCart(productNames: string[]) {
    for (const name of productNames) {
      const productLocator = this.productListLink.filter({ hasText: name });
      await productLocator.click();
      await this.addToCartButton.click();
      await this.backToProductsButton.click();
    }
    return productNames.length;
  }

  async verifyAllProductsDisplayed(expectedCount: number) {
    const actualCount = await this.completeProductList
      .locator("[data-test = 'inventory-item-name']")
      .count();
    expect(actualCount).toBe(expectedCount);
  }

  async goToCartPage() {
    await this.navigateTo("cart.html");
  }
}
