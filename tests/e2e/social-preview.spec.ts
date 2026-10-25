import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const SITE = "https://www.duypham.me";

for (const path of ["/", "/labs/"]) {
  test.describe(`Social preview ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("canonical and og:url use the www host, not the redirecting apex", async ({ page }) => {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`${SITE}${path}`);
      expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(canonical);
    });

    test("og:image points at the shipped 1200x630 card", async ({ page, request }) => {
      const meta = (prop: string) => page.locator(`meta[property="${prop}"]`).getAttribute("content");
      const image = await meta("og:image");
      expect(image).toBe(`${SITE}/og-image.png`);
      expect(await meta("og:image:width")).toBe("1200");
      expect(await meta("og:image:height")).toBe("630");
      expect(await meta("og:image:alt")).toContain("Duy Pham");

      // Fetch from the local preview server, by path: the production host is checked above.
      const response = await request.get(new URL(new URL(image!).pathname, page.url()).toString());
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain("image/png");
      expect((await response.body()).equals(readFileSync(resolve(process.cwd(), "public/og-image.png")))).toBe(true);
    });

    test("JSON-LD person url uses the www host", async ({ page }) => {
      const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      expect(data.url).toBe(`${SITE}/`);
    });
  });
}
