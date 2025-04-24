require("dotenv").config();
const { test } = require("../setup");
const { expect } = require("@playwright/test");
const selectors = require("../selectors/selectors");

const login_url =
  "https://ecommerce-playground.lambdatest.io/index.php?route=account/login";

const userEmail = process.env.USER_EMAIL;
const userPassword = process.env.USER_PASSWORD;
const wrongEmail = process.env.WRONG_EMAIL;
const wrongPassword = process.env.WRONG_PASSWORD;

test(
  "user can log in with valid credentials",
  { tag: ["@auth", "@smoke", "@login", "@single"] },
  async ({ page }) => {
    await page.goto(login_url);
    await page.fill(selectors.loginForm.emailInput, userEmail);
    await page.fill(selectors.loginForm.passwordInput, userPassword);
    await page.click(selectors.loginForm.submitButton);
    await expect(page).toHaveTitle(selectors.dashboard.title);
  }
);

test.skip(
  "user cannot log in with invalid password",
  { tag: ["@auth", "@smoke", "@login", "@single"] },
  async ({ page }) => {
    await page.goto(login_url);
    await page.fill(selectors.loginForm.emailInput, wrongEmail);
    await page.fill(selectors.loginForm.passwordInput, wrongPassword);
    await page.click(selectors.loginForm.submitButton);
    await expect(page.locator(selectors.loginForm.errorElement)).toHaveText(
      selectors.loginForm.errorMessage
    );
  }
);

// npx playwright test --grep "@single": Will only run the tests in this file
// npx playwright test --grep "@login": Will run all tests with that tag
