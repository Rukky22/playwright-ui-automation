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
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.title();
  }

  async getCurrentURL() {
    return this.page.url();
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
