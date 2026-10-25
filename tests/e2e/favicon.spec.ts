import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test.describe("Favicon", () => {
  test("links to the Kit Room stage-profile SVG favicon", async ({ page, request }) => {
    await page.goto("/");

    const faviconHref = await page
      .locator('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute("href");

    expect(faviconHref).toBe("/favicon.svg");

    const response = await request.get(new URL(faviconHref!, page.url()).toString());
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");

    // The unit test pins public/favicon.svg to the approved design; here we prove
    // the site serves that exact file.
    expect(await response.text()).toBe(readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8"));
  });

  test("links an apple-touch-icon PNG", async ({ page, request }) => {
    await page.goto("/");

    const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    expect(href).toBe("/apple-touch-icon.png");

    const response = await request.get(new URL(href!, page.url()).toString());
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect((await response.body()).equals(readFileSync(resolve(process.cwd(), "public/apple-touch-icon.png")))).toBe(true);
  });
});
