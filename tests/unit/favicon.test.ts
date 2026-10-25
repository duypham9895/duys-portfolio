import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const faviconBytes = readFileSync(resolve(process.cwd(), "public/favicon.svg"));
const favicon = faviconBytes.toString("utf8");
const appleIcon = readFileSync(resolve(process.cwd(), "public/apple-touch-icon.png"));
const navMarks = ["src/components/Hero.astro", "src/components/Topbar.astro"].map((f) =>
  readFileSync(resolve(process.cwd(), f), "utf8"),
);

// SHA-256 of the approved design E (stage profile on cobalt tile) and its 180px
// apple-touch render. Changing either means a new mockup review first, then
// updating the hash on purpose.
const APPROVED_SHA256 = "332d073546c935e3167bc91963e6c4af0569e9e6c93e07cb847451de4a3fd9b8";
const APPROVED_APPLE_SHA256 = "80b9c1ff872b1de0af3298c24147ac9e8aff4012cb8e4b155f66ade165ec0848";

const PROFILE = "M4 27V22l5-3.5 4 2 6-9 4 3.5 5-7V27z";

// Any yellow/gold, in any spelling, next to the cobalt tile reads as a flag.
const YELLOW =
  /#f5c400|#ff0\b|#ffff00|#ffd700|#fc0\b|#ffcc00|\byellow\b|\bgold\b|rgba?\(\s*2[0-5]\d\s*,\s*(1[6-9]\d|2[0-5]\d)\s*,\s*([0-9]|[1-9]\d)\s*[,)]/i;

const fillOf = (cls: string) => favicon.match(new RegExp(`\\.${cls}\\{fill:(#[0-9A-F]{6})\\}`))?.[1];

describe("favicon logo", () => {
  it("is byte-identical to the approved design E", () => {
    expect(createHash("sha256").update(faviconBytes).digest("hex")).toBe(APPROVED_SHA256);
  });

  it("draws the stage profile and summit dot in palette colours", () => {
    expect(favicon).toContain('viewBox="0 0 32 32"');
    expect(favicon).toMatch(/<rect class="t" width="32" height="32"/); // tile
    expect(favicon).toContain(`<path class="m" d="${PROFILE}"/>`); // stage profile
    expect(favicon).toMatch(/<circle class="s" cx="28" cy="8"/); // summit
    expect(fillOf("t")).toBe("#1B39C9");
    expect(fillOf("m")).toBe("#FFFFFF");
    expect(fillOf("s")).toBe("#7393FF");
  });

  it("avoids text, gradients, bicycles' retired marks and the old Terminal Compass colours", () => {
    expect(favicon).not.toMatch(/<text|gradient/i);
    expect(favicon).not.toMatch(/#252220|#E07A3E/i);
  });

  it("never pairs the cobalt tile with yellow, in any spelling", () => {
    expect(favicon).not.toMatch(YELLOW);
    for (const bad of ["#F5C400", "#f5c400", "yellow", "Gold", "#ff0", "#FFFF00", "rgb(245, 196, 0)"]) {
      expect(bad).toMatch(YELLOW);
    }
  });

  it("ships the approved 180x180 apple-touch-icon PNG", () => {
    expect(appleIcon.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(appleIcon.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect(appleIcon.readUInt32BE(16)).toBe(180);
    expect(appleIcon.readUInt32BE(20)).toBe(180);
    expect(createHash("sha256").update(appleIcon).digest("hex")).toBe(APPROVED_APPLE_SHA256);
  });

  it("uses the same stage profile as the navbar mark, in theme colours", () => {
    // The whole <svg> must match exactly: extra shapes, hiding styles or a dropped
    // aria-hidden would otherwise slip past a substring check.
    const NAV_MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="${PROFILE}" fill="var(--text)"></path><circle cx="28" cy="8" r="2.4" fill="var(--accent)"></circle></svg>`;
    for (const src of navMarks) {
      const marks = src.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
      expect(marks).toContain(NAV_MARK);
      expect(src.match(/<a class="wordmark"[\s\S]*?<\/svg>/)?.[0]).toMatch(new RegExp(`${NAV_MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    }
  });
});
