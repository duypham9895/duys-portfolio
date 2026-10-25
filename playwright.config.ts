import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "npm run build && npx astro preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
