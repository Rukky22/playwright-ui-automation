import BasePage from "./basePage";
import { Page, expect, Locator } from "@playwright/test";

export default class CheckoutPageCredentials extends BasePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly PostalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.firstNameInput = this.page.getByRole("textbox", {
      name: "First Name",
    });
    this.lastNameInput = this.page.getByRole("textbox", { name: "Last Name" });
    this.PostalCodeInput = this.page.getByRole("textbox", {
      name: "Zip/Postal Code",
    });
    this.continueButton = this.page.getByRole("button", { name: "Continue" });
    this.cancelButton = this.page.getByRole("button", { name: "Cancel" });
  }

  async verifyOnCheckoutPageCredentials() {
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL("/.*checkout-step-one.*/");
  }

  async enterCheckoutInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    await this.enterText(this.firstNameInput, firstName);
    await this.enterText(this.lastNameInput, lastName);
    await this.enterText(this.PostalCodeInput, postalCode);
  }

  async proceedToCheckoutOverview() {
    await this.continueButton.click();
  }

  async cancelCheckout() {
    await this.cancelButton.click();
  }
}
