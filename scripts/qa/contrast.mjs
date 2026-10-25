// WCAG contrast check of a running preview: / and /labs, 1440 and 390, light and dark.
// Usage: node scripts/qa/contrast.mjs [baseUrl]   (default http://localhost:4321)
// Text needs 4.5:1 (3:1 when large); interactive controls need a 3:1 boundary (WCAG 1.4.11).
// Static chips are labels, not controls, and .gap-zone is an intentionally invisible hover target.
import { chromium } from "@playwright/test";

const BASE = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");
const PAGES = ["/", "/labs"];
const WIDTHS = [1440, 390];
const THEMES = ["light", "dark"];
const UI_SELECTOR =
  "input, select, textarea, button:not(.gap-zone), .btn, .filters button, .theme-toggle, [role=button]";

/** Runs in the page: returns every text and UI pair with its colors and ratio. */
function collectPairs(uiSelector) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  // Canvas normalises any CSS color syntax (oklch, color-mix, ...) to sRGB bytes.
  const rgba = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (top, under) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1);
  };
  const lum = ([r, g, b]) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  // Composite translucent backgrounds from the element up to the first opaque one.
  const bgOf = (el) => {
    const layers = [];
    let hasImage = false;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") hasImage = true;
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    let out = [255, 255, 255, 1];
    for (const l of layers.reverse()) out = over(l, out);
    return { color: out, hasImage };
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") return false;
    for (let n = el; n; n = n.parentElement) if (+getComputedStyle(n).opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const label = (el) => {
    const cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
    return el.tagName.toLowerCase() + cls;
  };

  const pairs = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    const el = walker.currentNode.parentElement;
    if (!text || !el || seen.has(el) || !visible(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    const bg = bgOf(el);
    const fg = over(rgba(s.color), bg.color);
    const size = parseFloat(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
    pairs.push({
      kind: "text", el: label(el), text: text.slice(0, 40), fg: hex(fg), bg: hex(bg.color),
      ratio: ratio(fg, bg.color), min: large ? 3 : 4.5, bgImage: bg.hasImage,
    });
  }

  for (const el of document.querySelectorAll(uiSelector)) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const outside = bgOf(el.parentElement).color;
    const fill = over(rgba(s.backgroundColor), outside);
    const candidates = [{ what: "fill", c: fill }];
    if (parseFloat(s.borderTopWidth) > 0) candidates.push({ what: "border", c: over(rgba(s.borderTopColor), outside) });
    const best = candidates.map((x) => ({ ...x, r: ratio(x.c, outside) })).sort((a, b) => b.r - a.r)[0];
    pairs.push({
      kind: "ui", el: label(el), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40),
      fg: `${best.what} ${hex(best.c)}`, bg: hex(outside), ratio: best.r, min: 3, bgImage: false,
    });
  }
  return pairs;
}

const browser = await chromium.launch();
let failures = 0;
for (const path of PAGES) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(400);
      const pairs = (await page.evaluate(collectPairs, UI_SELECTOR)).sort((a, b) => a.ratio - b.ratio);
      const fails = pairs.filter((p) => p.ratio < p.min);
      failures += fails.length;

      console.log(`\n== ${path} @${width} ${theme}: ${pairs.length} pairs, ${fails.length} failure(s)`);
      const fmt = (p) =>
        `  ${p.ratio.toFixed(2).padStart(5)} (min ${p.min}) ${p.kind.padEnd(4)} ${p.fg} on ${p.bg}` +
        `${p.bgImage ? " [bg-image]" : ""}  ${p.el}  "${p.text}"`;
      console.log(" lowest 10:");
      pairs.slice(0, 10).forEach((p) => console.log(fmt(p)));
      if (fails.length) {
        console.log(" FAILURES:");
        fails.forEach((p) => console.log(fmt(p)));
      }
      await context.close();
    }
  }
}
await browser.close();
console.log(`\nTotal failures: ${failures}`);
if (failures > 0) process.exit(1);
