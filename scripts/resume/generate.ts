import { chromium, type Browser } from "playwright";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { transform } from "./transform";
import { renderTemplate, type ResumeTheme } from "./template";

const PUBLIC_DIR = join(process.cwd(), "public");
const THEMES: readonly ResumeTheme[] = ["light", "dark"];

async function renderPdf(browser: Browser, html: string, outputPath: string): Promise<void> {
  const tempHtml = join("/tmp", `resume-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(tempHtml, html, "utf-8");

  const page = await browser.newPage();
  try {
    await page.goto(`file://${tempHtml}`, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } finally {
    await page.close();
    try {
      unlinkSync(tempHtml);
    } catch {
      // best-effort cleanup
    }
  }
}

async function generate(): Promise<void> {
  const data = transform();

  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      const html = renderTemplate(data, theme);
      const outputPath = join(PUBLIC_DIR, `resume-${theme}.pdf`);
      await renderPdf(browser, html, outputPath);
      console.log(`Resume PDF (${theme}) generated at ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

generate().catch((error) => {
  console.error("Failed to generate resume PDF:", error);
  process.exit(1);
});
