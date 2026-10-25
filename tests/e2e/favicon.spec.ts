import { expect, test } from "@playwright/test";

test.describe("Favicon", () => {
  test("links to the Kit Room plaque SVG favicon", async ({ page, request }) => {
    await page.goto("/");

    const faviconHref = await page
      .locator('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute("href");

    expect(faviconHref).toBe("/favicon.svg");

    const response = await request.get(new URL(faviconHref!, page.url()).toString());
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");

    const svg = await response.text();
    expect(svg).toContain("#1B39C9");
    expect(svg).toContain("#7393FF");
    expect(svg).not.toContain("<text");
  });

  test("links an apple-touch-icon PNG", async ({ page, request }) => {
    await page.goto("/");

    const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    expect(href).toBe("/apple-touch-icon.png");

    const response = await request.get(new URL(href!, page.url()).toString());
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});
