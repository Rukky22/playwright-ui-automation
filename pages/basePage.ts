import { expect, Locator, Page } from "@playwright/test";

export default class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async navigateTo(path = "/") {
    // Playwright will automatically prepend baseURL from config
    // if the path doesn't start with http
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.title();
  }

  async getCurrentURL() {
    return this.page.url();
  }

  async cleanAmountLabelText(labelAmountText: string | null) {
    const cleaned = (labelAmountText ?? "").replace(/[^0-9.]/g, "");
    return cleaned ? parseFloat(cleaned) : 0;
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async enterText(locator: Locator, text: string) {
    await locator.fill(text);
  }

  async isElementVisible(locator: string) {
    return this.page.locator(locator).isVisible();
  }

  async getElementText(locator: string) {
    return this.page.locator(locator).innerText();
  }

  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await this.page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
    });
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
