import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    // CI builds before running e2e, so only serve dist there; locally build first.
    command: process.env.CI ? "npx astro preview" : "npm run build && npx astro preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
