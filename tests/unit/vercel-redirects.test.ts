import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Short links printed on the CV and profiles. Once shared they must keep working,
// and they stay temporary so each visit reaches the edge and shows up in analytics.
const SHORT_LINKS = ["/in", "/cv", "/gh"];

describe("Referral short links", () => {
  const { redirects } = JSON.parse(readFileSync("vercel.json", "utf-8"));

  it.each(SHORT_LINKS)("redirects %s to the home page, non-permanently", (source) => {
    expect(redirects).toContainEqual({ source, destination: "/", permanent: false });
  });
});
