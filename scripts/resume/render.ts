import { chromium } from "playwright";

/** Counts page objects in a PDF; `/Type /Pages` (the page tree) is not counted. */
export function countPdfPages(pdf: Buffer): number {
  return pdf.toString("latin1").match(/\/Type\s*\/Page\b(?!s)/g)?.length ?? 0;
}

/** Throws unless the PDF is exactly one page. */
export function assertOnePage(pdf: Buffer): void {
  const pages = countPdfPages(pdf);
  if (pages !== 1) {
    throw new Error(`Resume must be 1 page, rendered ${pages}`);
  }
}

/**
 * Renders HTML to an A4 PDF buffer with headless Chromium, using the approved
 * render.mjs options. Margins come from the template's @page rule. Writes nothing.
 */
export async function renderPdf(html: string): Promise<Buffer> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    return await page.pdf({
      format: "A4",
      printBackground: false,
      preferCSSPageSize: true,
      tagged: true,
    });
  } finally {
    await browser.close();
  }
}
