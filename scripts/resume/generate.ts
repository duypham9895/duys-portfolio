import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { BANNED, findViolations, loadPrivateTerms } from "../../src/lib/contentRules";
import { extractBodyText } from "./bodyText";
import { assertOnePage, renderPdf } from "./render";
import { renderTemplate } from "./template";
import { transform } from "./transform";

const PUBLIC_DIR = join(process.cwd(), "public");
const RESUME_PATH = join(PUBLIC_DIR, "resume.pdf");
const OVERFLOW_PATH = join(PUBLIC_DIR, "resume.overflow.pdf");
/** Identical copies so links to the old light/dark files keep working. */
const LEGACY_PATHS = [join(PUBLIC_DIR, "resume-light.pdf"), join(PUBLIC_DIR, "resume-dark.pdf")];

function assertCleanText(html: string): void {
  const privateTerms = loadPrivateTerms();
  const patterns = [...BANNED, ...(privateTerms ?? [])];
  const violations = findViolations(extractBodyText(html), patterns);
  if (violations.length > 0) {
    const list = violations.map((v) => `"${v.match}" (${v.source})`).join(", ");
    throw new Error(`Resume text contains banned content: ${list}`);
  }
}

async function generate(): Promise<void> {
  const html = renderTemplate(transform());
  assertCleanText(html);

  const pdf = await renderPdf(html);
  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  try {
    assertOnePage(pdf);
  } catch (error) {
    writeFileSync(OVERFLOW_PATH, pdf);
    console.error(`Over-length render written to ${OVERFLOW_PATH}`);
    throw error;
  }

  writeFileSync(RESUME_PATH, pdf);
  LEGACY_PATHS.forEach((path) => copyFileSync(RESUME_PATH, path));
  rmSync(OVERFLOW_PATH, { force: true });
  console.log(`Resume PDF (1 page) generated at ${RESUME_PATH}`);
}

generate().catch((error) => {
  console.error("Failed to generate resume PDF:", error);
  process.exit(1);
});
