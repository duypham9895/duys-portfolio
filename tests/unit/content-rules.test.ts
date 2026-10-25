import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { BANNED, findViolations, loadPrivateTerms } from "../../src/lib/contentRules";

// One positive (must match) and one negative (must not match) sample per pattern.
const FIXTURES: Readonly<Record<string, { readonly hit: string; readonly miss: string }>> = {
  "38K": { hit: "reached 38K visits", miss: "reached 380K visits" },
  "38,000": { hit: "over 38,000 rows", miss: "over 138,000 rows" },
  "1,900": { hit: "1,900 items processed", miss: "11,900 items processed" },
  "(?:re)?launch(?:es|ed|ing)?": { hit: "Relaunched the website", miss: "a launchpad for ideas" },
  "first-of-its-kind": { hit: "a First-of-its-kind product", miss: "the first of many kinds" },
  "Indonesia-first": { hit: "an Indonesia-first plan", miss: "Indonesia first, then Vietnam" },
  "top-3": { hit: "a top-3 partner", miss: "a top-30 partner" },
  "\\$1/day": { hit: "a budget of $1/day", miss: "a budget of $11/day" },
  "\\$200": { hit: "a $200 fee", miss: "a $2000 fee" },
  "5x": { hit: "5x faster builds", miss: "15x faster builds" },
  "enabled deal closure": { hit: "Enabled deal closure fast", miss: "enabled the deal to close" },
  "roadmaps?": { hit: "owned the roadmaps", miss: "road mapping exercise" },
  "user[- ]research": { hit: "ran user-research sessions", miss: "user researcher hired" },
  "A/B": { hit: "ran A/B tests", miss: "ran AB/C tests" },
  "bachelors?": { hit: "Bachelor of Engineering", miss: "bachelorette party" },
  "dropouts?": { hit: "university dropout", miss: "dropoutrate column" },
  "notice period": { hit: "30-day notice period", miss: "noticed a period of growth" },
  "(?<!Support-led )discovery": { hit: "led product discovery", miss: "Support-led discovery" },
  "Indonesian \\(": { hit: "an Indonesian (KPR) lender", miss: "Indonesian mortgage (KPR) fintech" },
};

describe("BANNED patterns", () => {
  it("every pattern has a fixture pair", () => {
    expect(BANNED.map((b) => b.source).sort()).toEqual(Object.keys(FIXTURES).sort());
  });

  BANNED.forEach(({ source, pattern }) => {
    it(`${source} matches its positive sample and not its negative sample`, () => {
      const fixture = FIXTURES[source];
      expect(pattern.test(fixture.hit)).toBe(true);
      expect(pattern.test(fixture.miss)).toBe(false);
    });
  });
});

interface StringHit {
  readonly path: string;
  readonly value: string;
}

function collectStrings(value: unknown, path: string, out: StringHit[]): void {
  if (typeof value === "string") {
    out.push({ path, value });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, out));
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => collectStrings(item, `${path}.${key}`, out));
  }
}

const DATA_DIR = resolve(__dirname, "../../src/data");

async function dataStrings(): Promise<readonly StringHit[]> {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".ts")).sort();
  const out: StringHit[] = [];
  for (const file of files) {
    const mod = (await import(pathToFileURL(join(DATA_DIR, file)).href)) as Record<string, unknown>;
    Object.entries(mod).forEach(([name, value]) => collectStrings(value, `${file}:${name}`, out));
  }
  // icons.ts holds raw SVG markup; its path data is not copy.
  return out
    .filter((hit) => !(hit.path.startsWith("icons.ts:") && hit.value.trimStart().startsWith("<svg")))
    .map((hit) => ({ ...hit, value: hit.value.replace(/\*\*/g, "") }));
}

function report(hits: readonly StringHit[], patterns = BANNED): readonly string[] {
  return hits.flatMap((hit) =>
    findViolations(hit.value, patterns).map((v) => `${hit.path}: "${v.match}" (${v.source})`),
  );
}

describe("src/data content rules", () => {
  it("walks every data module", async () => {
    const hits = await dataStrings();
    expect(hits.length).toBeGreaterThan(50);
  });

  it("no data string matches a BANNED pattern", async () => {
    expect(report(await dataStrings())).toEqual([]);
  });

  it("no data string contains a private term (content-rules.local.json)", async (ctx) => {
    const privateTerms = loadPrivateTerms(resolve(__dirname, "../.."));
    if (privateTerms === null) {
      console.warn("content-rules.local.json not found: private-term scan skipped (expected in CI).");
      ctx.skip();
      return;
    }
    expect(privateTerms.length).toBeGreaterThan(0);
    // Report paths only, never the private term itself.
    const offending = (await dataStrings())
      .filter((hit) => findViolations(hit.value, privateTerms).length > 0)
      .map((hit) => hit.path);
    expect(offending).toEqual([]);
  });
});
