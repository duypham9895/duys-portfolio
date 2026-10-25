import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface BannedPattern {
  readonly source: string;
  readonly pattern: RegExp;
}

export interface ContentViolation {
  readonly source: string;
  readonly match: string;
  readonly index: number;
}

// Default anchors: no word character (or "$") right before, no word character right after.
const LEAD = "(?<![\\w$])";
const TRAIL = "(?!\\w)";

function anchored(body: string): BannedPattern {
  return { source: body, pattern: new RegExp(`${LEAD}${body}${TRAIL}`, "i") };
}

// Patterns that end in punctuation take no trailing anchor.
function leadOnly(body: string): BannedPattern {
  return { source: body, pattern: new RegExp(`${LEAD}${body}`, "i") };
}

/**
 * Claims Duy retracted or never verified (INPUTS #3, #5, #7, #9, #10, #12b).
 * Every pattern is case-insensitive and carries its own anchors.
 */
export const BANNED: readonly BannedPattern[] = [
  anchored("38K"),
  anchored("38,000"),
  anchored("1,900"),
  anchored("(?:re)?launch(?:es|ed|ing)?"),
  anchored("first-of-its-kind"),
  anchored("Indonesia-first"),
  anchored("top-3"),
  anchored("\\$1/day"),
  anchored("\\$200"),
  anchored("5x"),
  anchored("enabled deal closure"),
  anchored("roadmaps?"),
  anchored("user[- ]research"),
  anchored("A/B"),
  anchored("bachelors?"),
  anchored("dropouts?"),
  anchored("notice period"),
  anchored("(?<!Support-led )discovery"),
  leadOnly("Indonesian \\("),
];

export const PRIVATE_TERMS_FILE = "content-rules.local.json";

interface PrivateTermsFile {
  readonly privateTerms?: readonly string[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Private client names live only in the gitignored content-rules.local.json,
 * because the repo is public. Returns null when the file is absent (CI).
 */
export function loadPrivateTerms(root: string = process.cwd()): readonly BannedPattern[] | null {
  const file = resolve(root, PRIVATE_TERMS_FILE);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, "utf8")) as PrivateTermsFile;
  return (parsed.privateTerms ?? [])
    .filter((term) => term.trim().length > 0)
    .map((term) => anchored(escapeRegExp(term.trim())));
}

export function findViolations(
  text: string,
  patterns: readonly BannedPattern[] = BANNED,
): readonly ContentViolation[] {
  const violations: ContentViolation[] = [];
  for (const { source, pattern } of patterns) {
    const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    for (const match of text.matchAll(global)) {
      violations.push({ source, match: match[0], index: match.index ?? 0 });
    }
  }
  return violations;
}
