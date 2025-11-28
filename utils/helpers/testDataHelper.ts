import testData from "../../test-data/testData";

export class TestDataHelper {
  // User credentials
  static getValidUser() {
    return testData.users.validUser;
  }

  static getLockedOutUser() {
    return testData.users.lockedOutUser;
  }

  static getProblemUser() {
    return testData.users.problemUser;
  }

  static getPerformanceGlitchUser() {
    return testData.users.performanceGlitchUser;
  }

  static getInvalidUser() {
    return testData.users.invalidUser;
  }

  // Credentials for specific test scenarios
  static getCredentials(type: keyof typeof testData.credentials) {
    return testData.credentials[type];
  }

  static getEdgeCaseCredentials(type: keyof typeof testData.edgeCases) {
    return testData.edgeCases[type];
  }

  // Error messages
  static getErrorMessage(type: keyof typeof testData.errorMessages) {
    return testData.errorMessages[type];
  }

  // Products
  static getProducts() {
    return testData.products;
  }

  static getRandomProduct() {
    const products = testData.products;
    return products[Math.floor(Math.random() * products.length)];
  }

  // Generate dynamic test data
  static generateLongString(length: number): string {
    return "a".repeat(length);
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  }

  static generateRandomUsername(): string {
    const timestamp = Date.now();
    return `user${timestamp}`;
  }
}

export default TestDataHelper;
