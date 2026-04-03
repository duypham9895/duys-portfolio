import { chromium } from "playwright";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { transform } from "./transform";
import { renderTemplate } from "./template";

const OUTPUT_PATH = join(process.cwd(), "public", "resume.pdf");
const TEMP_HTML = join("/tmp", `resume-${Date.now()}.html`);

async function generate(): Promise<void> {
  const data = transform();
  const html = renderTemplate(data);

  writeFileSync(TEMP_HTML, html, "utf-8");

  const publicDir = join(process.cwd(), "public");
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file://${TEMP_HTML}`, { waitUntil: "networkidle" });
    await page.pdf({
      path: OUTPUT_PATH,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    console.log(`Resume PDF generated at ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
    try {
      unlinkSync(TEMP_HTML);
    } catch {
      // temp file cleanup is best-effort
    }
  }
}

generate().catch((error) => {
  console.error("Failed to generate resume PDF:", error);
  process.exit(1);
});
