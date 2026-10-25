import { describe, it, expect } from "vitest";
import { experiences } from "../../src/data/experiences";
import { certifications } from "../../src/data/certifications";
import { datedWithin, seasonStrip, type StripGapSegment } from "../../src/lib/seasonStrip";

const widths = (now: Date) => seasonStrip(experiences, now).segments.map((s) => s.width);

describe("seasonStrip on 2026-10-25", () => {
  const strip = seasonStrip(experiences, new Date("2026-10-25T00:00:00Z"));

  it("runs chronologically: Bizzi, gap, Ringkas SWE, Ringkas APM", () => {
    expect(strip.segments.map((s) => s.kind)).toEqual(["role", "gap", "role", "role"]);
    expect(strip.segments.map((s) => s.label)).toEqual([
      "Bizzi Vietnam · Software Engineer",
      "SEP–NOV 2022",
      "Ringkas · Software Engineer",
      "Ringkas · Associate Product Manager",
    ]);
  });

  it("uses month-start boundaries with the end month included", () => {
    const [bizzi, gap, swe, apm] = strip.segments;
    expect([bizzi.start, bizzi.end]).toEqual(["2020-10-01", "2022-09-01"]);
    expect([gap.start, gap.end]).toEqual(["2022-09-01", "2022-12-01"]);
    expect([swe.start, swe.end]).toEqual(["2022-12-01", "2024-08-01"]);
    expect([apm.start, apm.end]).toEqual(["2024-08-01", "2026-10-25"]);
  });

  it("has widths 31.60 / 4.11 / 27.49 / 36.79 summing to 100", () => {
    const [a, gap, b, c] = strip.segments.map((s) => s.width);
    expect(a).toBeCloseTo(31.6, 1);
    expect(Math.abs(a - 31.6)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(gap - 4.11)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(b - 27.49)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(c - 36.79)).toBeLessThanOrEqual(0.05);
    expect(a + gap + b + c).toBeCloseTo(100, 6);
  });

  it("lets the Bizzi name label span its segment plus the following gap", () => {
    const [bizzi, gap, swe] = strip.segments;
    if (bizzi.kind !== "role" || swe.kind !== "role" || gap.kind !== "gap") throw new Error("unexpected kinds");
    expect(bizzi.labelWidth).toBeCloseTo(bizzi.width + gap.width, 6);
    expect(swe.labelWidth).toBeCloseTo(swe.width, 6);
    expect(gap.offset).toBeCloseTo(bizzi.width, 6);
  });

  it("has ticks Oct 2020, 2022–2026 and Now (2021 dropped near the start)", () => {
    expect(strip.ticks.map((t) => t.label)).toEqual(["Oct 2020", "2022", "2023", "2024", "2025", "2026", "Now"]);
    expect(strip.ticks[0].position).toBe(0);
    expect(strip.ticks.at(-1)?.position).toBe(100);
  });

  it("finds the 3 courses completed inside the gap, oldest first", () => {
    const gap = strip.segments.find((s): s is StripGapSegment => s.kind === "gap");
    expect(gap).toBeDefined();
    expect(datedWithin(certifications, gap!).map((c) => c.date)).toEqual(["Sep 2022", "Oct 2022", "Nov 2022"]);
  });
});

describe("seasonStrip on 2027-03-01", () => {
  const now = new Date("2027-03-01T00:00:00Z");
  const strip = seasonStrip(experiences, now);

  it("changes the widths", () => {
    const later = widths(now);
    const earlier = widths(new Date("2026-10-25T00:00:00Z"));
    expect(later).toHaveLength(4);
    later.forEach((w, i) => expect(w).not.toBeCloseTo(earlier[i], 2));
    expect(later.reduce((sum, w) => sum + w, 0)).toBeCloseTo(100, 6);
  });

  it("keeps every year tick more than 6% from both ends", () => {
    const years = strip.ticks.filter((t) => t.label !== "Now" && t.label !== "Oct 2020");
    expect(years.map((t) => t.label)).not.toContain("2027");
    years.forEach((t) => {
      expect(100 - t.position).toBeGreaterThan(6);
      expect(t.position).toBeGreaterThan(6);
    });
  });
});
