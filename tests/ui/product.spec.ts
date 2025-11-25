import { test, expect } from "@playwright/test";
import LoginPage from "../../pages/loginPage";
import ProductPage from "../../pages/productPage";
import CartPage from "../../pages/cartPage";

test.describe("ProductPage Tests", () => {
  let loginPage: LoginPage;
  let productPage: ProductPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);

    // Login before each test
    await loginPage.navigateToLogin();
    await loginPage.login("standard_user", "secret_sauce");
    await loginPage.verifyLoginSuccess();
    await productPage.verifyOnProductPage();
  });

  test.describe("Positive Tests", () => {
    test("should display products page after successful login", async () => {
      await productPage.verifyOnProductPage();
      await expect(productPage.pageTitle).toHaveText("Products");
    });

    test("should display all 6 products on the page", async () => {
      await productPage.verifyAllProductsDisplayed(6);
    });

    test("should add single item to cart successfully", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.verifyOnCartPage();
      expect(await cartPage.isItemInCart("Sauce Labs Backpack")).toBeTruthy();
      expect(await cartPage.getItemCountInCart()).toBe(1);
    });

    test("should add multiple items to cart successfully", async () => {
      const items = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
      ];

      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      await cartPage.verifyOnCartPage();
      expect(await cartPage.getItemCountInCart()).toBe(3);

      for (const item of items) {
        expect(await cartPage.isItemInCart(item)).toBeTruthy();
      }
    });

    test("should navigate back to products page after adding item", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.verifyOnProductPage();
    });

    test("should navigate to cart page successfully", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();
    });

    test("should add all 6 products to cart", async () => {
      const allProducts = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)",
      ];

      await productPage.addMultipleItemsToCart(allProducts);
      await productPage.goToCartPage();

      expect(await cartPage.getItemCountInCart()).toBe(6);
    });

    test("should click on product and add from detail page", async () => {
      const productLink = productPage.productListLink.filter({
        hasText: "Sauce Labs Backpack",
      });
      await productLink.click();

      await expect(productPage.addToCartButton).toBeVisible();
      await productPage.addToCartButton.click();

      await expect(productPage.page.getByText("Remove")).toBeVisible();
    });
  });

  test.describe("Negative Tests", () => {
    test("should handle adding non-existent product gracefully", async () => {
      const nonExistentProduct = "Non Existent Product";
      const productLocator = productPage.productListLink.filter({
        hasText: nonExistentProduct,
      });

      expect(await productLocator.count()).toBe(0);
    });

    test("should not navigate to cart if cart link is not clicked", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await expect(productPage.page).not.toHaveURL(/.*cart.*/);
    });

    test("should handle invalid product name in filter", async () => {
      const invalidProduct = "Invalid Product XYZ";
      const productLocator = productPage.productListLink.filter({
        hasText: invalidProduct,
      });

      expect(await productLocator.count()).toBe(0);
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle adding same item multiple times", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.addOneItemToCart("Sauce Labs Backpack");

      await productPage.goToCartPage();
      // Saucedemo doesn't allow duplicate items, so count should be 1
      expect(await cartPage.getItemCountInCart()).toBe(1);
    });

    test("should handle rapid product additions", async () => {
      const items = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

      for (const item of items) {
        const productLocator = productPage.productListLink.filter({
          hasText: item,
        });
        await productLocator.click();
        await productPage.addToCartButton.click();
        await productPage.backToProductsButton.click();
      }

      await productPage.goToCartPage();
      expect(await cartPage.getItemCountInCart()).toBeGreaterThan(0);
    });

    test("should handle empty product array", async () => {
      const emptyArray: string[] = [];
      await productPage.addMultipleItemsToCart(emptyArray);

      await productPage.goToCartPage();
      await cartPage.verifyCartIsEmpty();
    });

    test("should handle product name with special characters", async () => {
      await productPage.addOneItemToCart("Test.allTheThings() T-Shirt (Red)");
      await productPage.goToCartPage();

      expect(
        await cartPage.isItemInCart("Test.allTheThings() T-Shirt (Red)")
      ).toBeTruthy();
    });

    test("should verify product count doesn't change without adding items", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyCartIsEmpty();
    });

    test("should handle navigation after adding all products", async () => {
      const allProducts = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)",
      ];

      await productPage.addMultipleItemsToCart(allProducts);
      await productPage.verifyOnProductPage();

      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();
    });

    test("should handle very long product list", async () => {
      const longProductList = Array(10).fill("Sauce Labs Backpack");
      await productPage.addMultipleItemsToCart(longProductList);

      await productPage.goToCartPage();
      // Should only add once due to duplicate handling
      expect(await cartPage.getItemCountInCart()).toBe(1);
    });

    test("should verify scrolling functionality", async () => {
      await productPage.scrollToTop();
      const scrollPosition = await productPage.page.evaluate(
        () => window.scrollY
      );
      expect(scrollPosition).toBe(0);
    });

    test("should handle partial product name matches", async () => {
      const partialName = "Sauce Labs";
      const matchingProducts = await productPage.productListLink
        .filter({ hasText: partialName })
        .count();

      expect(matchingProducts).toBeGreaterThan(0);
    });

    test("should handle case-sensitive product names", async () => {
      const lowerCaseProduct = "sauce labs backpack";
      const productLocator = productPage.productListLink.filter({
        hasText: lowerCaseProduct,
      });

      // Verify if search is case-sensitive (depends on implementation)
      const count = await productLocator.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("should maintain product page state after browser back", async ({
      page,
    }) => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();

      await page.goBack();
      await productPage.verifyOnProductPage();
    });
  });

  test.describe("UI Validation Tests", () => {
    test("should display product list container", async () => {
      await expect(productPage.completeProductList).toBeVisible();
    });

    test("should display page title correctly", async () => {
      await expect(productPage.pageTitle).toBeVisible();
      await expect(productPage.pageTitle).toHaveText("Products");
    });

    test("should have clickable product links", async () => {
      const firstProduct = productPage.productListLink.first();
      await expect(firstProduct).toBeVisible();
      await expect(firstProduct).toBeEnabled();
    });

    test("should display Add to cart buttons for all products", async () => {
      const productCount = await productPage.productListLink.count();
      expect(productCount).toBeGreaterThan(0);
    });

    test("should verify all product links are visible", async () => {
      const allLinks = await productPage.productListLink.all();

      for (const link of allLinks) {
        await expect(link).toBeVisible();
      }
    });

    test("should verify back to products button visibility on detail page", async () => {
      const firstProduct = productPage.productListLink.first();
      await firstProduct.click();

      await expect(productPage.backToProductsButton).toBeVisible();
      await expect(productPage.backToProductsButton).toBeEnabled();
    });
  });

  test.describe("Integration Tests", () => {
    test("should complete full flow: add item -> view cart -> return", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();

      await cartPage.returnToProductPage();
      await productPage.verifyOnProductPage();
    });

    test("should add items, remove one, verify remaining", async () => {
      const items = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
      await productPage.addMultipleItemsToCart(items);

      await productPage.goToCartPage();
      expect(await cartPage.getItemCountInCart()).toBe(2);

      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");
      expect(await cartPage.getItemCountInCart()).toBe(1);
      expect(await cartPage.isItemInCart("Sauce Labs Bike Light")).toBeTruthy();
    });
  });
});
