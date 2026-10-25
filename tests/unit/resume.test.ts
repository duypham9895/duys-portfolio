import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { extractBodyText } from "../../scripts/resume/bodyText";
import { renderTemplate } from "../../scripts/resume/template";
import { transform } from "../../scripts/resume/transform";
import { assertOnePage, countPdfPages, renderPdf } from "../../scripts/resume/render";

const APPROVED_TEXT = readFileSync(resolve(__dirname, "../fixtures/resume-body.txt"), "utf8");

function normalise(text: string): string {
  return text.replace(/[ \t]+/g, " ").trim();
}

describe("resume template", () => {
  it("renders the approved resume text", () => {
    const text = extractBodyText(renderTemplate(transform()));
    expect(normalise(text)).toBe(normalise(APPROVED_TEXT));
  });
});

describe("countPdfPages", () => {
  it("counts page objects and ignores the page tree", () => {
    const pdf = Buffer.from("<< /Type /Pages /Count 2 >> << /Type /Page >> << /Type/Page >>", "latin1");
    expect(countPdfPages(pdf)).toBe(2);
  });
});

describe("resume PDF guard", { timeout: 60000 }, () => {
  it("renders the resume as one tagged page with embedded fonts", async () => {
    const pdf = await renderPdf(renderTemplate(transform()));
    expect(() => assertOnePage(pdf)).not.toThrow();
    const raw = pdf.toString("latin1");
    expect(raw).toContain("/StructTreeRoot");
    expect(raw).toContain("/FontFile2");
  });

  it("throws on an oversized resume", async () => {
    const data = transform();
    const oversized = renderTemplate({
      ...data,
      roles: [...data.roles, ...data.roles, ...data.roles],
    });
    const pdf = await renderPdf(oversized);
    expect(countPdfPages(pdf)).toBeGreaterThan(1);
    expect(() => assertOnePage(pdf)).toThrow(/1 page/);
  });
});
