import { expect, test } from "@playwright/test";

test.describe("Favicon", () => {
  test("links to the Terminal Compass SVG favicon", async ({ page, request }) => {
    await page.goto("/");

    const faviconHref = await page
      .locator('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute("href");

    expect(faviconHref).toBe("/favicon.svg");

    const faviconUrl = new URL(faviconHref!, page.url()).toString();
    const response = await request.get(faviconUrl);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");

    const svg = await response.text();
    expect(svg).toContain("#252220");
    expect(svg).toContain("#F2EDE4");
    expect(svg).toContain("#E07A3E");
    expect(svg).toContain("#D4B05A");
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("linearGradient");
  });
});
