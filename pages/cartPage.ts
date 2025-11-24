import BasePage from "./basePage";
import { Page, expect, Locator } from "@playwright/test";

export default class CartPage extends BasePage {
  readonly page: Page;
  readonly cartItemsRemoveButton: Locator;
  readonly cartItemRows: Locator;
  readonly cartTitle: Locator;
  readonly PriceLabel: Locator;
  readonly checkoutButton: Locator;
  readonly backToShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.cartItemsRemoveButton = this.page.getByText("Remove");
    this.cartItemRows = this.page.locator(".cart_item");
    this.cartTitle = this.page.locator('[data-test="title"]');
    this.PriceLabel = this.page.locator(".inventory_item_price");
    this.checkoutButton = this.page.getByRole("button", { name: "Checkout" });
    this.backToShoppingButton = this.page.getByRole("button", {
      name: "Continue Shopping",
    });
  }

  async verifyOnCartPage() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL("/.*cart.*/");
    await expect(this.cartTitle).toHaveText("Your Cart");
    await expect(this.cartTitle).toBeVisible();
  }

  async removeItemFromCartByName(itemName: string) {
    const itemRow = this.cartItemRows.filter({ hasText: itemName });
    itemRow.getByRole("button", { name: "Remove" }).click();
  }

  async getItemCountInCart() {
    return await this.cartItemRows.count();
  }

  async clearCart() {
    const itemCount = await this.getItemCountInCart();
    for (let i = 0; i < itemCount; i++) {
      await this.cartItemsRemoveButton.first().click();
    }
  }

  async isItemInCart(itemName: string) {
    return (await this.cartItemRows.filter({ hasText: itemName }).count()) > 0;
  }

  async getItemPriceByName(itemName: string) {
    const priceText = await this.cartItemRows
      .filter({ hasText: itemName })
      .locator(".inventory_item_price")
      .textContent();
    return Number((priceText || "").replace(/[^0-9.]/g, ""));
  }

  async verifyCartIsEmpty() {
    await expect(this.cartItemRows).toHaveCount(0);
  }
  async proceedToCheckout() {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL("/checkout-step-one.html");
  }

  async takeCartScreenshot(name: string) {
    await this.takeScreenshot(name);
  }
}
