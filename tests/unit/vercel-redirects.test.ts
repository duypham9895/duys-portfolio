import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resume } from "../../src/data/resume";

// Short links printed on the CV and profiles. Once shared they must keep working,
// and they stay temporary so each visit reaches the edge and shows up in analytics.
// `{/}?` also accepts a retyped trailing slash.
const SHORT_LINKS = ["/in", "/cv", "/gh"];

describe("Referral short links", () => {
  const { redirects } = JSON.parse(readFileSync("vercel.json", "utf-8"));

  it.each(SHORT_LINKS)("redirects %s to the home page, non-permanently", (path) => {
    expect(redirects).toContainEqual({ source: `${path}{/}?`, destination: "/", permanent: false });
  });

  it("points the resume PDF's portfolio link at /cv", () => {
    expect(resume.links).toContainEqual({ label: "duypham.me", href: "https://www.duypham.me/cv" });
  });
});
