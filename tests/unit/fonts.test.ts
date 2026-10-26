import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Fonts are self-hosted so the hero text (the LCP element) waits on one origin,
// not document -> fonts.googleapis.com CSS -> fonts.gstatic.com woff2.
const layout = readFileSync("src/layouts/Layout.astro", "utf-8");
const fontsCss = readFileSync("src/styles/fonts.css", "utf-8");

describe("Self-hosted fonts", () => {
  it("does not load anything from Google Fonts", () => {
    expect(layout).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });

  it("serves every @font-face file from public/fonts", () => {
    const urls = [...fontsCss.matchAll(/url\("(\/fonts\/[^"]+)"\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(existsSync(`public${url}`), url).toBe(true);
  });

  it("preloads only files that fonts.css declares", () => {
    const preloads = [...layout.matchAll(/rel="preload" href="(\/fonts\/[^"]+)"/g)].map((m) => m[1]);
    expect(preloads.length).toBeGreaterThan(0);
    for (const href of preloads) expect(fontsCss).toContain(`url("${href}")`);
  });

  it("keeps Archivo's full width axis on every face; kit-room.css uses 62% to 125%", () => {
    const faces = fontsCss.split("@font-face").filter((f) => f.includes('"Archivo"'));
    expect(faces.length).toBeGreaterThan(0);
    for (const face of faces) expect(face).toContain("font-stretch: 62% 125%;");
  });

  it("caches /fonts/ for a year; file names carry the upstream version", () => {
    const { headers } = JSON.parse(readFileSync("vercel.json", "utf-8"));
    const rule = headers.find((h: { source: string }) => h.source === "/fonts/(.*)");
    expect(rule?.headers).toContainEqual({ key: "Cache-Control", value: "public, max-age=31536000, immutable" });
  });
});

// Cloudflare Email Obfuscation rewrites every mailto link outside these markers to
// "[email protected]" until its script runs. Header and footer slots hold the addresses.
describe("Cloudflare email_off region", () => {
  it("wraps the header, main and footer slots", () => {
    const open = layout.indexOf("<!--email_off-->");
    const close = layout.indexOf("<!--/email_off-->");
    expect(open).toBeGreaterThan(-1);
    expect(open).toBeLessThan(layout.indexOf('<slot name="header" />'));
    expect(close).toBeGreaterThan(layout.indexOf('<slot name="footer" />'));
  });
});
