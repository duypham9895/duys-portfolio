import { test, expect } from "@playwright/test";

test.describe("Portfolio page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("displays correct name and title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Duy Pham");
    await expect(page.locator("h1 + p")).toContainText(
      "Associate Product Manager"
    );
  });

  test("displays avatar image", async ({ page }) => {
    const avatar = page.locator('img[alt="Duy Pham"]');
    await expect(avatar).toBeVisible();
  });

  test("has About section with bio", async ({ page }) => {
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#about")).toContainText("Ringkas");
    await expect(page.locator("#about")).toContainText("Bizzi Vietnam");
  });

  test("has Experience section with 2 jobs", async ({ page }) => {
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#experience h3")).toHaveCount(2);
    await expect(page.locator("#experience h3").first()).toContainText(
      "Associate Product Manager"
    );
    await expect(page.locator("#experience h3").last()).toContainText(
      "Software Engineer"
    );
  });

  test("has Skills section with PM skills first", async ({ page }) => {
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#skills")).toContainText("Product Management");
    await expect(page.locator("#skills")).toContainText("PRD Writing");
  });

  test("has Certifications section", async ({ page }) => {
    await expect(page.locator("#certs")).toBeVisible();
    await expect(page.locator("#certs a")).toHaveCount(7);
  });

  test("social links are present and valid", async ({ page }) => {
    const socialLinks = page.locator(".social-icon");
    await expect(socialLinks).toHaveCount(4);

    for (const link of await socialLinks.all()) {
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test("has footer with email", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer")).toContainText(
      "phamanhduy.sg@gmail.com"
    );
  });

  test("has correct meta tags", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("Duy Pham");

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toContain("Associate Product Manager");

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toContain("Duy Pham");

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toContain("duypham.me");
  });

  test("has JSON-LD structured data", async ({ page }) => {
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(jsonLd!);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Duy Pham");
  });
});

test.describe("Responsive layout", () => {
  test("desktop: sidebar + content side by side", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const aside = page.locator("aside");
    const main = page.locator("main");
    await expect(aside).toBeVisible();
    await expect(main).toBeVisible();
  });

  test("mobile: single column", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
  });
});
