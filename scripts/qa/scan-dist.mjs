// Scans the text of every built page (dist/**/*.html) for BANNED patterns and,
// when content-rules.local.json exists, the private terms. Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { tsImport } from "tsx/esm/api";

const { BANNED, findViolations, loadPrivateTerms } = await tsImport(
  "../../src/lib/contentRules.ts",
  import.meta.url,
);

const DIST = join(process.cwd(), "dist");

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

/** Page text, <title>, meta content and JSON-LD; scripts and styles dropped. */
function pageText(html) {
  const metaContent = [...html.matchAll(/<meta\b[^>]*\bcontent="([^"]*)"/gi)].map((m) => m[1]);
  const text = html
    .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
  return [text, ...metaContent]
    .join("\n")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ");
}

const privateTerms = loadPrivateTerms();
if (privateTerms === null) {
  console.log("content-rules.local.json not found: scanning BANNED only (private terms skipped).");
}
const patterns = [...BANNED, ...(privateTerms ?? [])];

const files = htmlFiles(DIST);
let hits = 0;
for (const file of files) {
  for (const v of findViolations(pageText(readFileSync(file, "utf8")), patterns)) {
    hits += 1;
    console.error(`${relative(process.cwd(), file)}: "${v.match}" (${v.source})`);
  }
}

console.log(`Scanned ${files.length} page(s) with ${patterns.length} pattern(s): ${hits} hit(s).`);
if (files.length === 0 || hits > 0) process.exit(1);
