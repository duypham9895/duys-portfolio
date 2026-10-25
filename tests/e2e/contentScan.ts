import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { BANNED, PRIVATE_TERMS_FILE, findViolations, loadPrivateTerms } from "../../src/lib/contentRules";

/**
 * Everything a reader or a crawler sees: body text (closed <details> and the
 * hidden strip included; inline scripts and styles dropped), title attributes,
 * <title>, meta content and the JSON-LD.
 */
async function visibleCopy(page: Page): Promise<string> {
  return page.evaluate(() => {
    const body = document.body.cloneNode(true) as HTMLElement;
    body.querySelectorAll("script, style").forEach((node) => node.remove());
    const titles = [...document.querySelectorAll("[title]")].map((el) => el.getAttribute("title") ?? "");
    const metas = [...document.querySelectorAll("meta[content]")].map((el) => el.getAttribute("content") ?? "");
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent ?? "");
    return [body.textContent ?? "", document.title, ...titles, ...metas, ...jsonLd].join("\n").replace(/\s+/g, " ");
  });
}

/** D5: no BANNED pattern (and no private term, when the local list exists) on the page. */
export async function expectNoBannedCopy(page: Page): Promise<void> {
  const text = await visibleCopy(page);
  expect(findViolations(text, BANNED), "BANNED copy on page").toEqual([]);

  const privateTerms = loadPrivateTerms();
  if (privateTerms === null) {
    console.log(`${PRIVATE_TERMS_FILE} not found: private terms skipped.`);
    return;
  }
  expect(findViolations(text, privateTerms).length, "private terms on page").toBe(0);
}
