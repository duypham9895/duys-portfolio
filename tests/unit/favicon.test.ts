import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const favicon = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");
const appleIcon = readFileSync(resolve(process.cwd(), "public/apple-touch-icon.png"));

// SHA-256 of the approved design D (cobalt tile + plaque). Changing the favicon
// means a new mockup review first, then updating this hash on purpose.
const APPROVED_SHA256 = "2a52ae4acedd9545c778f16ab556f13033d9cfbdf7f2ca4121da682372a7925d";

// Any yellow/gold, in any spelling, next to the cobalt tile reads as a flag.
const YELLOW =
  /#f5c400|#ff0\b|#ffff00|#ffd700|#fc0\b|#ffcc00|\byellow\b|\bgold\b|rgba?\(\s*2[0-5]\d\s*,\s*(1[6-9]\d|2[0-5]\d)\s*,\s*([0-9]|[1-9]\d)\s*[,)]/i;

const fillOf = (cls: string) => favicon.match(new RegExp(`\\.${cls}\\{fill:(#[0-9A-F]{6})\\}`))?.[1];

describe("favicon logo", () => {
  it("is byte-identical to the approved design D", () => {
    expect(createHash("sha256").update(favicon).digest("hex")).toBe(APPROVED_SHA256);
  });

  it("draws each shape with its own palette colour", () => {
    expect(favicon).toContain('viewBox="0 0 32 32"');
    expect(favicon).toMatch(/<rect class="t" width="32" height="32"/); // tile
    expect(favicon).toMatch(/<path class="p" d="M7 32V14/); // plaque
    expect(favicon).toMatch(/<path class="c" d="M9\.5 14/); // cap
    expect(favicon).toMatch(/<rect class="r" x="10" y="22"/); // ink bar
    expect(fillOf("t")).toBe("#1B39C9");
    expect(fillOf("p")).toBe("#FFFFFF");
    expect(fillOf("c")).toBe("#7393FF");
    expect(fillOf("r")).toBe("#111114");
  });

  it("greys the plaque in dark mode", () => {
    expect(favicon).toMatch(/@media \(prefers-color-scheme: dark\)\{\.p\{fill:#CDD1D8\}\}/);
  });

  it("avoids text, gradients and the retired Terminal Compass colours", () => {
    expect(favicon).not.toMatch(/<text|gradient/i);
    expect(favicon).not.toMatch(/#252220|#E07A3E/i);
  });

  it("never pairs the cobalt tile with yellow, in any spelling", () => {
    expect(favicon).not.toMatch(YELLOW);
    // The guard itself must catch the spellings a regression would use.
    for (const bad of ["#F5C400", "#f5c400", "yellow", "Gold", "#ff0", "#FFFF00", "rgb(245, 196, 0)"]) {
      expect(bad).toMatch(YELLOW);
    }
  });

  it("ships a 180x180 apple-touch-icon PNG", () => {
    expect(appleIcon.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(appleIcon.readUInt32BE(16)).toBe(180); // IHDR width
    expect(appleIcon.readUInt32BE(20)).toBe(180); // IHDR height
  });
});
