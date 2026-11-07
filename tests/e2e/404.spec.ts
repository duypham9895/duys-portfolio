import { test, expect } from "@playwright/test";
import { expectNoBannedCopy } from "./contentScan";

test.describe("404 page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/404");
  });

  test("renders Kit Room v2 off-route copy without errors", async ({ page }) => {
    await expect(page).toHaveTitle("404 — Duy Pham");
    await expect(page.locator(".sec-kicker .label")).toHaveText("404 · Off route");
    await expect(page.locator("h1")).toHaveText("Page not found");
    await expect(page.locator(".labs-intro")).toHaveText("This page does not exist or has moved.");
    await expect(page.locator("img")).toHaveCount(0);
  });

  test("provides working recovery links to / and /labs", async ({ page }) => {
    const homeLinks = page.getByRole("link", { name: "← Back to home" });
    await expect(homeLinks).toHaveCount(2);
    for (const link of await homeLinks.all()) {
      await expect(link).toHaveAttribute("href", "/");
    }

    const labsLink = page.getByRole("link", { name: "Labs →" });
    await expect(labsLink).toHaveAttribute("href", "/labs");
  });

  test("has no banned or private copy", async ({ page }) => {
    await expectNoBannedCopy(page);
  });
});
