import BasePage from "./basePage";
import { Page, expect, Locator } from "@playwright/test";

export default class CheckoutPageOverview extends BasePage {
  readonly page: Page;
  readonly itemTotalLabel: Locator;
  readonly grossAmountLabel: Locator;
  readonly taxLabel: Locator;
  readonly ItemPriceLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly pageTitle: Locator;
  readonly checkItemNames: Locator;
  readonly paymentInformationLabel: Locator;
  readonly shippingInformationLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.itemTotalLabel = this.page.locator(".summary_subtotal_label");
    this.grossAmountLabel = this.page.locator(".summary_total_label");
    this.taxLabel = this.page.locator(".summary_tax_label");
    this.ItemPriceLabel = this.page.locator(".inventory_item_price");
    this.finishButton = this.page.getByRole("button", { name: "Finish" });
    this.cancelButton = this.page.getByRole("button", { name: "Cancel" });
    this.pageTitle = this.page.locator('[data-test="title"]');
    this.checkItemNames = this.page.locator(".inventory_item_name");
    this.paymentInformationLabel = this.page
      .locator(".summary_value_label")
      .nth(0);
    this.shippingInformationLabel = this.page
      .locator(".summary_value_label")
      .nth(1);
  }

  async verifyOnCheckoutOverviewPage() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL("/.*checkout-step-two.*/");
    await expect(this.pageTitle).toHaveText("Checkout: Overview");
  }

  async verifyCorrectItemsCount() {
    return await this.ItemPriceLabel.count();
  }

  async getItemsNames() {
    const names = [];
    const count = await this.checkItemNames.count();
    for (let i = 0; i < count; i++) {
      names.push(await this.checkItemNames.nth(i).textContent());
    }
    return names;
  }

  // ...existing code...
  async calculateItemTotalAmountWithoutTax() {
    let total = 0;
    const count = await this.ItemPriceLabel.count();
    for (let i = 0; i < count; i++) {
      const priceText = await this.ItemPriceLabel.nth(i).textContent();
      // strip everything except digits and dot, handle thousands separators
      const cleaned = (priceText ?? "").replace(/[^0-9.]/g, "");
      const price = cleaned ? parseFloat(cleaned) : 0;
      total += Number.isFinite(price) ? price : 0;
    }
    return total;
  }

  async calculateGrossAmountWithTax() {
    const itemTotal = await this.calculateItemTotalAmountWithoutTax();
    const taxAmount = await this.getTaxAmount();
    return itemTotal + taxAmount;
  }

  async getItemTotalLabelAmountWithoutTax() {
    const labelText = await this.itemTotalLabel.textContent();
    const amount = await this.cleanAmountLabelText(labelText);
    return Number.isFinite(amount) ? amount : 0;
  }

  async getTaxAmount() {
    const taxText = await this.taxLabel.textContent();
    const amount = await this.cleanAmountLabelText(taxText);
    return Number.isFinite(amount) ? amount : 0;
  }

  async getGrossAmountLabel() {
    const grossText = await this.grossAmountLabel.textContent();
    const amount = await this.cleanAmountLabelText(grossText);
    return Number.isFinite(amount) ? amount : 0;
  }

  async getPaymentInformation() {
    return this.paymentInformationLabel.textContent();
  }

  async getShoppingInformation() {
    return this.shippingInformationLabel.textContent();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }

  async cancelCheckout() {
    await this.cancelButton.click();
  }
  // ...existing code...
}
