import { test as baseTest, expect } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import LoginPage from "../pages/loginPage";

dotenv.config({ path: path.resolve(__dirname, "../env") });
const storageStateFile = path.join(
  __dirname,
  "..",
  "test-data",
  "storageState.json"
);

type MyFixtures = {
  authToken: string;
  apiClient: import("@playwright/test").APIRequestContext;
};

export const test = baseTest.extend<MyFixtures>({
  apiClient: async ({ playwright, baseURL }, use) => {
    const api = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        "x-api-key": process.env.X_API_KEY || "",
        Accept: "application/json",
      },
    });
    await use(api);
    await api.dispose();
  },

  authToken: async ({ apiClient }, use) => {
    const res = await apiClient.post("https://reqres.in/api/login", {
      data: {
        email: process.env.API_USER_EMAIL,
        password: process.env.API_USER_PASSWORD,
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    console.log("Body: " + body);
    const token = await body.accessToken;
    await use(token);
  },

  storageState: async ({ browser }, use) => {
    if (fs.existsSync(storageStateFile)) {
      const content = fs.readFileSync(storageStateFile, "utf-8");
      await use(JSON.parse(content));
      return;
    }

    // If storage state file does not exist, create a new context and save the state
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
    await loginPage.verifyLoginSuccess();
    const storage = await context.storageState();
    fs.writeFileSync(storageStateFile, JSON.stringify(storage));
    await use(storage);
    await context.close();
  },
});
export { expect };
