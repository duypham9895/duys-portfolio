import { test, expect } from "@playwright/test";
import { expectNoBannedCopy } from "./contentScan";

test.describe("Portfolio page", () => {
  test("page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test.describe("content", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("hero shows name and title", async ({ page }) => {
      const h1 = page.locator(".hero h1");
      await expect(h1).toContainText("Duy Pham");
      await expect(h1).toContainText("Associate Product Manager");
      await expect(page.locator(".hero .bib-name")).toHaveText("Duy Pham");
    });

    test("renders no images (no avatar)", async ({ page }) => {
      await expect(page.locator("img")).toHaveCount(0);
    });

    test("has Experience section with 3 roles, newest first", async ({ page }) => {
      await expect(page.locator("#experience")).toBeVisible();
      const roles = page.locator("#experience .season h3");
      await expect(roles).toHaveCount(3);
      await expect(roles.first()).toContainText("Associate Product Manager");
      await expect(roles.nth(1)).toContainText("Software Engineer");
      await expect(roles.last()).toContainText("Software Engineer");
    });

    test("season strip runs oldest to newest, with the section kicker", async ({ page }) => {
      await expect(page.locator("#experience .sec-kicker")).toContainText(
        "02 · Oct 2020 – Present · roles listed newest first"
      );
      const names = page.locator(".strip-names span");
      await expect(names).toHaveText([
        "Bizzi Vietnam · Software Engineer",
        "Ringkas · Software Engineer",
        "Ringkas · Associate Product Manager",
      ]);
      // Bizzi (seg-a) first, a gap, then Ringkas SWE (seg-b), Ringkas APM (seg-c) last.
      const track = await page
        .locator(".strip-track span")
        .evaluateAll((spans) => spans.map((span) => span.className));
      expect(track).toEqual(["seg-a", "seg-gap", "seg-b", "seg-c"]);
      await expect(page.locator(".strip-years span").last()).toHaveText("Now");
    });

    test("gap label and its tooltip open on focus and close on Escape", async ({ page }) => {
      await expect(page.locator(".gap-co")).toHaveText("Between roles · SEP–NOV 2022");
      const tip = page.locator(".gap-tip");
      await expect(tip).toBeHidden();

      await page.keyboard.press("Shift"); // keyboard modality, so focus is :focus-visible
      await page.locator(".gap-zone").focus();
      await expect(tip).toBeVisible();
      await expect(tip.locator(".tt")).toContainText("Base training");

      await page.keyboard.press("Escape");
      await expect(tip).toBeHidden();
    });

    test("gap tooltip opens on hover, also after an unrelated Escape", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      const tip = page.locator(".gap-tip");
      await page.locator(".gap-zone").hover();
      await expect(tip).toBeVisible();

      // Pointer away from the strip, Escape pressed elsewhere: the next hover must still open the tooltip.
      await page.locator(".hero h1").hover();
      await expect(tip).toBeHidden();
      await page.keyboard.press("Escape");
      await page.locator(".gap-zone").hover();
      await expect(tip).toBeVisible();
    });

    test("has About section", async ({ page }) => {
      await expect(page.locator("#about")).toBeVisible();
    });

    test("has Skills section with Product first", async ({ page }) => {
      await expect(page.locator("#skills")).toBeVisible();
      await expect(page.locator("#skills h3").first()).toHaveText("Product");
      await expect(page.locator("#skills")).toContainText("Support-led discovery");
      await expect(page.locator("#skills")).toContainText("PRD Writing");
    });

    test("has Certifications section with all 7", async ({ page }) => {
      await expect(page.locator("#certifications")).toBeVisible();
      await expect(page.locator("#certifications a")).toHaveCount(7);
    });

    test("social links use https", async ({ page }) => {
      await expect(page.locator(".hero .bib-actions a", { hasText: "LinkedIn" })).toHaveAttribute(
        "href",
        /^https:\/\/www\.linkedin\.com\//
      );
      // Inside the closed "Phone & other profiles" <details>: checked by attribute, not visibility.
      const others = page.locator(".hero .more .socials a");
      await expect(others).toHaveText(["Telegram", "Zalo", "GitHub"]);
      for (const link of await others.all()) {
        await expect(link).toHaveAttribute("href", /^https:\/\//);
      }
    });

    test("resume links point to /resume.pdf", async ({ page, request }) => {
      const links = page.getByRole("link", { name: /Resume/ });
      await expect(links).toHaveCount(2);
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute("href", "/resume.pdf");
        await expect(link).toHaveAttribute("target", "_blank");
      }

      const response = await request.get("/resume.pdf");
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/pdf");
    });

    test("has footer with email", async ({ page }) => {
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("footer")).toContainText("phamanhduy.sg@gmail.com");
    });

    test("has correct meta tags", async ({ page }) => {
      expect(await page.title()).toContain("Duy Pham");

      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description).toContain("Associate Product Manager");

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
      expect(ogTitle).toContain("Duy Pham");

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe("https://www.duypham.me/");
    });

    test("has JSON-LD structured data", async ({ page }) => {
      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLd!);
      expect(data["@type"]).toBe("Person");
      expect(data.name).toBe("Duy Pham");
    });

    test("has no banned or private copy", async ({ page }) => {
      await expectNoBannedCopy(page);
    });

    test("loads the Archivo and IBM Plex Mono faces", async ({ page }) => {
      const loaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts]
          .filter((face) => face.status === "loaded")
          .map((face) => face.family.replace(/["']/g, ""));
      });
      expect(loaded).toContain("Archivo");
      expect(loaded).toContain("IBM Plex Mono");
    });
  });
});

test.describe("Theme tokens", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test.describe("light", () => {
    test.use({ colorScheme: "light" });

    test("Kit Room colours", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(250, 250, 247)");
      await expect(page.locator("a.co").first()).toHaveCSS("color", "rgb(27, 57, 201)");
    });
  });

  test.describe("dark", () => {
    test.use({ colorScheme: "dark" });

    test("Night Stage colours", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(11, 17, 32)");
      await expect(page.locator("a.co").first()).toHaveCSS("color", "rgb(115, 147, 255)");
    });
  });
});

test.describe("Theme toggle", () => {
  test.use({ colorScheme: "light" });

  test("click flips data-theme, persists across reload and onto /labs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    const toggle = page.locator(".theme-toggle:visible").first();
    await expect(toggle).toHaveAttribute("aria-label", "Switch to dark theme");
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-label", "Switch to light theme");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.goto("/labs");
    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("Responsive layout", () => {
  test("desktop: hero and main visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("header.hero")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("mobile: the between-roles divider reads as one sentence", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".strip")).toBeHidden();
    const divider = page.locator("ol.seasons > li.m-break");
    await expect(divider).toBeVisible();
    await expect(divider).not.toHaveAttribute("role");
    await expect(divider.locator("ul")).toHaveCount(0);
    const text = `${await divider.locator(".ln").textContent()} ${await divider.locator("p").textContent()}`;
    expect(text.replace(/\s+/g, " ").trim()).toBe(
      "Between roles · SEP–NOV 2022. Courses completed: React (Udemy, Sep 2022), JavaScript Intermediate (HackerRank, Oct 2022), Go (Udemy, Nov 2022).",
    );
  });

  test("mobile: Menu opens and closes after picking a link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".hero h1")).toBeVisible();

    const menu = page.locator("details.menu");
    await menu.locator("summary").click();
    await expect(menu).toHaveAttribute("open", "");
    const skills = menu.getByRole("link", { name: "Skills" });
    await expect(skills).toBeVisible();

    await skills.click();
    await expect(menu).not.toHaveAttribute("open");
    await expect(page).toHaveURL(/#skills$/);
  });
});
