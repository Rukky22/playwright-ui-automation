import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./basePage";

export default class CheckoutPage extends BasePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly pageTitle: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly completeMessage: Locator;
  readonly backHomeButton: Locator;
  readonly summaryItemTotal: Locator;
  readonly summaryTax: Locator;
  readonly summaryTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.firstNameInput = this.page.getByPlaceholder("First Name");
    this.lastNameInput = this.page.getByPlaceholder("Last Name");
    this.postalCodeInput = this.page.getByPlaceholder("Zip/Postal Code");
    this.continueButton = this.page.getByRole("button", { name: "Continue" });
    this.cancelButton = this.page.getByRole("button", { name: "Cancel" });
    this.errorMessage = this.page.locator('[data-test="error"]');
    this.pageTitle = this.page.locator('[data-test="title"]');
    this.finishButton = this.page.getByRole("button", { name: "Finish" });
    this.completeHeader = this.page.locator('[data-test="complete-header"]');
    this.completeMessage = this.page.locator('[data-test="complete-text"]');
    this.backHomeButton = this.page.getByRole("button", {
      name: "Back Home",
    });
    this.summaryItemTotal = this.page.locator('[data-test="subtotal-label"]');
    this.summaryTax = this.page.locator('[data-test="tax-label"]');
    this.summaryTotal = this.page.locator('[data-test="total-label"]');
  }

  async verifyOnCheckoutStepOne() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL(/.*checkout-step-one.*/);
    await expect(this.pageTitle).toHaveText("Checkout: Your Information");
  }

  async verifyOnCheckoutStepTwo() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL(/.*checkout-step-two.*/);
    await expect(this.pageTitle).toHaveText("Checkout: Overview");
  }

  async verifyOnCheckoutComplete() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL(/.*checkout-complete.*/);
    await expect(this.completeHeader).toHaveText("Thank you for your order!");
  }

  async fillCheckoutInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    await this.enterText(this.firstNameInput, firstName);
    await this.enterText(this.lastNameInput, lastName);
    await this.enterText(this.postalCodeInput, postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async clickBackHome() {
    await this.backHomeButton.click();
  }

  async verifyValidationError(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  async getSummarySubtotal() {
    const text = await this.summaryItemTotal.textContent();
    return this.cleanAmountLabelText(text);
  }

  async getSummaryTax() {
    const text = await this.summaryTax.textContent();
    return this.cleanAmountLabelText(text);
  }

  async getSummaryTotal() {
    const text = await this.summaryTotal.textContent();
    return this.cleanAmountLabelText(text);
  }

  async verifyOrderComplete() {
    await this.verifyOnCheckoutComplete();
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeMessage).toBeVisible();
    await expect(this.backHomeButton).toBeVisible();
  }
}
