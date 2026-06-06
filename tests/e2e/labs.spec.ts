import { test, expect } from "@playwright/test";

test.describe("Labs page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/labs");
  });

  test("renders the labs catalog", async ({ page }) => {
    await expect(page).toHaveTitle(/Labs/);
    await expect(page.locator("h2", { hasText: "Duy Labs" })).toBeVisible();
    await expect(page.locator("#labs-grid article")).toHaveCount(6);
  });

  test("shows project metadata and clear actions", async ({ page }) => {
    await expect(page.locator("#labs-grid")).toContainText("Live");
    await expect(page.locator("#labs-grid")).toContainText("GitHub");
    await expect(page.locator("#labs-grid")).toContainText("AI");
    await expect(page.locator('a[aria-label^="Open live project"]')).toHaveCount(4);
    await expect(page.locator('a[aria-label^="Open GitHub repository"]')).toHaveCount(6);
  });

  test("links back to the main portfolio", async ({ page }) => {
    const homeLink = page.locator('a[href="/"]', { hasText: "Portfolio" });
    await expect(homeLink).toBeVisible();
  });
});

test.describe("Labs responsive layout", () => {
  test("mobile renders readable project cards", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/labs");
    await expect(page.locator("h2", { hasText: "Duy Labs" })).toBeVisible();
    await expect(page.locator("#labs-grid article").first()).toBeVisible();
    await expect(page.locator('a[aria-label^="Open live project"]').first()).toBeVisible();
  });
});
