import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const favicon = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");

describe("favicon logo", () => {
  it("uses the Kit Room plaque on a cobalt tile", () => {
    expect(favicon).toContain('viewBox="0 0 32 32"');
    expect(favicon).toContain("#1B39C9"); // cobalt tile
    expect(favicon).toContain("#FFFFFF"); // kit-white plaque
    expect(favicon).toContain("#7393FF"); // plaque cap
    expect(favicon).toContain("#111114"); // ink bar
  });

  it("adapts to dark mode", () => {
    expect(favicon).toContain("prefers-color-scheme: dark");
  });

  it("avoids text, gradients and the retired Terminal Compass colours", () => {
    expect(favicon).not.toContain("<text");
    expect(favicon).not.toContain("linearGradient");
    expect(favicon).not.toContain("#252220");
    expect(favicon).not.toContain("#E07A3E");
  });

  it("never pairs the cobalt tile with jersey yellow", () => {
    expect(favicon).not.toContain("#F5C400");
  });
});
