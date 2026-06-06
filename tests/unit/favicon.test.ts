import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const favicon = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");

describe("favicon logo", () => {
  it("uses the approved Terminal Compass SVG anatomy", () => {
    expect(favicon).toContain('viewBox="0 0 32 32"');
    expect(favicon).toContain('rx="8"');
    expect(favicon).toContain("#252220");
    expect(favicon).toContain("#F2EDE4");
    expect(favicon).toContain("#E07A3E");
    expect(favicon).toContain("#D4B05A");
  });

  it("does not use the old literal DP gradient badge", () => {
    expect(favicon).not.toContain("<text");
    expect(favicon).not.toContain("linearGradient");
    expect(favicon).not.toContain("#FA5252");
    expect(favicon).not.toContain("#DD2476");
    expect(favicon).not.toMatch(/>DP</);
  });
});
