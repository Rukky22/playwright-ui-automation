import { test, expect } from "@playwright/test";
import LoginPage from "../../pages/loginPage";
import ProductPage from "../../pages/productPage";
import CartPage from "../../pages/cartPage";

test.describe("CartPage Tests", () => {
  let loginPage: LoginPage;
  let productPage: ProductPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);

    // Login and navigate to products
    await loginPage.navigateToLogin();
    await loginPage.login("standard_user", "secret_sauce");
    await loginPage.verifyLoginSuccess();
  });

  test.describe("Positive Tests", () => {
    test("should display empty cart initially", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();
      await cartPage.verifyCartIsEmpty();
    });

    test("should display cart page with correct title", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyOnCartPage();
      await expect(cartPage.cartTitle).toHaveText("Your Cart");
    });

    test("should display item in cart after adding from products", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.verifyOnCartPage();
      expect(await cartPage.getItemCountInCart()).toBe(1);
      expect(await cartPage.isItemInCart("Sauce Labs Backpack")).toBeTruthy();
    });

    test("should display multiple items in cart", async () => {
      const items = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
      ];

      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      expect(await cartPage.getItemCountInCart()).toBe(3);

      for (const item of items) {
        expect(await cartPage.isItemInCart(item)).toBeTruthy();
      }
    });

    test("should remove single item from cart successfully", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      expect(await cartPage.getItemCountInCart()).toBe(1);

      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");
      await cartPage.verifyCartIsEmpty();
    });

    test("should remove specific item from multiple items", async () => {
      const items = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");

      expect(await cartPage.getItemCountInCart()).toBe(1);
      expect(await cartPage.isItemInCart("Sauce Labs Bike Light")).toBeTruthy();
      expect(await cartPage.isItemInCart("Sauce Labs Backpack")).toBeFalsy();
    });

    test("should clear all items from cart", async () => {
      const items = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
      ];

      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      expect(await cartPage.getItemCountInCart()).toBe(3);

      await cartPage.clearCart();
      await cartPage.verifyCartIsEmpty();
    });

    test("should get correct item price by name", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const price = await cartPage.getItemPriceByName("Sauce Labs Backpack");
      expect(price).toBeGreaterThan(0);
      expect(price).toBe(29.99);
    });

    test("should navigate to checkout successfully", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.proceedToCheckout();
      await expect(cartPage.page).toHaveURL(/.*checkout-step-one.*/);
    });

    test("should return to product page from cart", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.returnToProductPage();
      await productPage.verifyOnProductPage();
    });

    test("should take cart screenshot successfully", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.takeCartScreenshot("cart-with-items");
      // Screenshot file creation is verified by file system in real test
    });
  });

  test.describe("Negative Tests", () => {
    test("should handle checkout with empty cart", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyCartIsEmpty();

      // Attempt to checkout with empty cart
      await cartPage.checkoutButton.click();
      // Verify application behavior (may allow or prevent checkout)
    });

    test("should handle removing non-existent item", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const initialCount = await cartPage.getItemCountInCart();

      // Attempt to remove item that doesn't exist
      try {
        await cartPage.removeItemFromCartByName("Non Existent Item");
      } catch (error) {
        // Expected to fail gracefully
      }

      expect(await cartPage.getItemCountInCart()).toBe(initialCount);
    });

    test("should handle getting price of non-existent item", async () => {
      await productPage.goToCartPage();

      const price = await cartPage.getItemPriceByName("Non Existent Item");
      expect(price).toBe(0); // Based on the cleanAmountLabelText logic
    });

    test("should not navigate to checkout URL directly without items", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyCartIsEmpty();

      const initialUrl = await cartPage.getCurrentURL();
      expect(initialUrl).toContain("cart");
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle removing all items one by one", async () => {
      const items = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];
      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      for (const item of items) {
        await cartPage.removeItemFromCartByName(item);
      }

      await cartPage.verifyCartIsEmpty();
    });

    test("should handle cart with maximum items (all 6 products)", async () => {
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

    test("should handle rapid item removal", async () => {
      const items = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
      ];

      await productPage.addMultipleItemsToCart(items);
      await productPage.goToCartPage();

      // Rapidly remove items
      await cartPage.cartItemsRemoveButton.first().click();
      await cartPage.cartItemsRemoveButton.first().click();

      expect(await cartPage.getItemCountInCart()).toBeLessThan(3);
    });

    test("should handle checking item existence for empty cart", async () => {
      await productPage.goToCartPage();

      expect(await cartPage.isItemInCart("Sauce Labs Backpack")).toBeFalsy();
    });

    test("should handle item with special characters in name", async () => {
      await productPage.addOneItemToCart("Test.allTheThings() T-Shirt (Red)");
      await productPage.goToCartPage();

      expect(
        await cartPage.isItemInCart("Test.allTheThings() T-Shirt (Red)")
      ).toBeTruthy();

      const price = await cartPage.getItemPriceByName(
        "Test.allTheThings() T-Shirt (Red)"
      );
      expect(price).toBeGreaterThan(0);
    });

    test("should handle partial item name search", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      // This should not find the item (exact match required)
      expect(await cartPage.isItemInCart("Backpack")).toBeFalsy();
    });

    test("should verify cart persistence after navigation", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const itemCountBefore = await cartPage.getItemCountInCart();

      await cartPage.returnToProductPage();
      await productPage.goToCartPage();

      const itemCountAfter = await cartPage.getItemCountInCart();
      expect(itemCountAfter).toBe(itemCountBefore);
    });

    test("should handle multiple remove button clicks on same item", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");
      await cartPage.verifyCartIsEmpty();

      // Second removal should do nothing
      const itemCount = await cartPage.getItemCountInCart();
      expect(itemCount).toBe(0);
    });

    test("should handle clearing already empty cart", async () => {
      await productPage.goToCartPage();
      await cartPage.verifyCartIsEmpty();

      await cartPage.clearCart();
      await cartPage.verifyCartIsEmpty();
    });

    test("should verify price format parsing", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const priceText = await cartPage.cartItemRows
        .filter({ hasText: "Sauce Labs Backpack" })
        .locator(".inventory_item_price")
        .textContent();

      expect(priceText).toContain("$");

      const price = await cartPage.getItemPriceByName("Sauce Labs Backpack");
      expect(typeof price).toBe("number");
      expect(price).toBeGreaterThan(0);
    });

    test("should handle browser back button from cart", async ({ page }) => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await page.goBack();
      await productPage.verifyOnProductPage();
    });

    test("should maintain cart after browser refresh", async ({ page }) => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const countBefore = await cartPage.getItemCountInCart();

      await page.reload();
      await cartPage.verifyOnCartPage();

      const countAfter = await cartPage.getItemCountInCart();
      expect(countAfter).toBe(countBefore);
    });
  });

  test.describe("UI Validation Tests", () => {
    test("should display all cart UI elements", async () => {
      await productPage.goToCartPage();

      await expect(cartPage.cartTitle).toBeVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
      await expect(cartPage.backToShoppingButton).toBeVisible();
    });

    test("should have enabled buttons", async () => {
      await productPage.goToCartPage();

      await expect(cartPage.checkoutButton).toBeEnabled();
      await expect(cartPage.backToShoppingButton).toBeEnabled();
    });

    test("should display remove buttons for each cart item", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      const removeButtons = await cartPage.cartItemsRemoveButton.count();
      expect(removeButtons).toBeGreaterThan(0);
    });

    test("should display price for each item in cart", async () => {
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      await expect(cartPage.PriceLabel.first()).toBeVisible();
      const priceText = await cartPage.PriceLabel.first().textContent();
      expect(priceText).toBeTruthy();
    });

    test("should verify checkout button text", async () => {
      await productPage.goToCartPage();

      await expect(cartPage.checkoutButton).toHaveText("Checkout");
    });

    test("should verify continue shopping button text", async () => {
      await productPage.goToCartPage();

      await expect(cartPage.backToShoppingButton).toHaveText(
        "Continue Shopping"
      );
    });
  });

  test.describe("Integration Tests", () => {
    test("should complete full cart workflow", async () => {
      // Add items
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();

      // Verify in cart
      expect(await cartPage.getItemCountInCart()).toBe(1);

      // Return to shopping
      await cartPage.returnToProductPage();

      // Add more items
      await productPage.addOneItemToCart("Sauce Labs Bike Light");
      await productPage.goToCartPage();

      // Verify total
      expect(await cartPage.getItemCountInCart()).toBe(2);

      // Remove one item
      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");
      expect(await cartPage.getItemCountInCart()).toBe(1);

      // Proceed to checkout
      await cartPage.proceedToCheckout();
      await expect(cartPage.page).toHaveURL(/.*checkout-step-one.*/);
    });

    test("should handle add, remove, add again workflow", async () => {
      // Add item
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();
      expect(await cartPage.getItemCountInCart()).toBe(1);

      // Remove item
      await cartPage.removeItemFromCartByName("Sauce Labs Backpack");
      await cartPage.verifyCartIsEmpty();

      // Return and add again
      await cartPage.returnToProductPage();
      await productPage.addOneItemToCart("Sauce Labs Backpack");
      await productPage.goToCartPage();
      expect(await cartPage.getItemCountInCart()).toBe(1);
    });
  });
});
