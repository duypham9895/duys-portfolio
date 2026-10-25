import { test, expect } from "@playwright/test";
import { expectNoBannedCopy } from "./contentScan";

test.describe("Labs page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/labs");
  });

  test("renders the start list", async ({ page }) => {
    await expect(page).toHaveTitle(/Labs/);
    await expect(page.locator("h1")).toHaveText("Labs");
    await expect(page.locator(".startlist tr.row")).toHaveCount(6);
  });

  test("labels project links per v2", async ({ page }) => {
    await expect(page.locator('a[aria-label$=" live site"]')).toHaveCount(4);
    await expect(page.locator('a[aria-label$=" on GitHub"]')).toHaveCount(6);
  });

  test("filters by status", async ({ page }) => {
    const filters = page.locator(".filters");
    await expect(filters).toBeVisible();

    await filters.getByRole("button", { name: /^Live/ }).click();
    await expect(page.locator(".startlist tr.row:visible")).toHaveCount(4);
    await expect(page.locator("tr.empty")).toBeHidden();

    await filters.getByRole("button", { name: /^All/ }).click();
    await expect(page.locator(".startlist tr.row:visible")).toHaveCount(6);
  });

  test("shows the empty state when no lab matches", async ({ page }) => {
    await page.evaluate(() => {
      document.querySelectorAll(".startlist tr.row").forEach((row) => row.setAttribute("data-s", "live"));
    });
    await page.locator(".filters").getByRole("button", { name: /^Building/ }).click();
    await expect(page.locator(".startlist tr.row:visible")).toHaveCount(0);
    await expect(page.locator("tr.empty")).toBeVisible();
  });

  test("links back to home", async ({ page }) => {
    const back = page.getByRole("link", { name: "← Back to home" });
    await expect(back).toHaveCount(2);
    for (const link of await back.all()) {
      await expect(link).toHaveAttribute("href", "/");
    }
    await expect(back.first()).toBeVisible();
  });

  test("has no banned or private copy", async ({ page }) => {
    await expectNoBannedCopy(page);
  });
});

test.describe("Labs without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hides the filters and shows every lab", async ({ page }) => {
    await page.goto("/labs");
    await expect(page.locator(".filters")).toBeHidden();
    await expect(page.locator(".startlist tr.row:visible")).toHaveCount(6);
  });
});

test.describe("Labs responsive layout", () => {
  test("mobile renders readable rows", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/labs");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".startlist tr.row").first()).toBeVisible();
    await expect(page.locator('a[aria-label$=" live site"]').first()).toBeVisible();
  });
});
