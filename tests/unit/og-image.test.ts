import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const png = readFileSync(resolve(process.cwd(), "public/og-image.png"));
const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");

// SHA-256 of the approved OG card v3-B (bib card, tile left, centre-safe for square
// crops). Changing it means a new mockup review first, then updating this hash on purpose.
const APPROVED_SHA256 = "944d3323d9380e73a108b1e7e4bc161eef34f4e72ae8e3f88a608115be166870";

describe("OG image", () => {
  it("is byte-identical to the approved card v3-B", () => {
    expect(createHash("sha256").update(png).digest("hex")).toBe(APPROVED_SHA256);
  });

  it("is a 1200x630 PNG", () => {
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  it("stays well under platform size limits", () => {
    expect(png.length).toBeLessThan(1_000_000);
  });
});

describe("robots.txt", () => {
  it("points the sitemap at the www host", () => {
    expect(robots).toContain("Sitemap: https://www.duypham.me/sitemap-index.xml");
    expect(robots).not.toMatch(/https:\/\/duypham\.me/);
  });
});
