import { defineConfig, devices } from "@playwright/test";


const defaultWebServerPort = process.env.CI ? "4173" : "5173";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${defaultWebServerPort}`;

// https://playwright.dev/docs/test-configuration.
// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  testDir: "./.",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],

  /* Run your local dev server before starting the tests. */
  webServer: {
    command: 'npm run preview',
    cwd: "../..",
    gracefulShutdown: { signal: 'SIGTERM', timeout: 500 },
    name: "jettison-ui-preview",
    reuseExistingServer: !!process.env.PLAYWRIGHT_BASE_URL || !process.env.CI,
    url: baseURL,
  },
});
