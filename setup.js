require("dotenv").config();
const { chromium } = require("playwright");
const cp = require("child_process");
const playwrightClientVersion = cp
  .execSync("npx playwright --version")
  .toString()
  .trim()
  .split(" ")[1];

const capabilities = {
  browserName: "Chrome",
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 10",
    build: "Playwright Tag Build",
    name: "Playwright Tag Test",
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false,
    geoLocation: "",
    playwrightClientVersion: playwrightClientVersion,
  },
};

exports.test = require("@playwright/test").test.extend({
  page: async ({ page }, use, testInfo) => {
    // Check if LambdaTest config is set
    if (process.env.executeOn !== "local") {
      const browser = await chromium.connect({
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(capabilities)
        )}`,
      });

      const ltPage = await browser.newPage();
      await use(ltPage);

      const testStatus = {
        action: "setTestStatus",
        arguments: {
          status: testInfo.status,
          remark: testInfo.error?.stack || testInfo.error?.message,
        },
      };

      // Send test status back to LambdaTest
      await ltPage.evaluate((status) => {
        window.lambdatest_action = status;
      }, testStatus);

      await ltPage.close();
      await browser.close();
    } else {
      // If executing locally, use the Playwright page
      await use(page);
    }
  },
  beforeEach: [
    async ({ page }, use) => {
      await page
        .context()
        .tracing.start({ screenshots: true, snapshots: true, sources: true });
      await use();
    },
    { auto: true },
  ],
  afterEach: [
    async ({ page }, use, testInfo) => {
      await use();
      if (testInfo.status === "failed") {
        await page
          .context()
          .tracing.stop({ path: `${testInfo.outputDir}/trace.zip` });
        await page.screenshot({ path: `${testInfo.outputDir}/screenshot.png` });
        await testInfo.attach("screenshot", {
          path: `${testInfo.outputDir}/screenshot.png`,
          contentType: "image/png",
        });
        await testInfo.attach("trace", {
          path: `${testInfo.outputDir}/trace.zip`,
          contentType: "application/zip",
        });
      }
    },
    { auto: true },
  ],
});
