# Terminal Compass Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old `DP` gradient favicon with the approved Terminal Compass logo for `duypham.me`.

**Architecture:** Keep the first implementation favicon-first and avoid visible layout changes. The SVG lives in `public/favicon.svg`, with focused tests proving the old literal `DP` gradient badge is gone and the browser links to the new SVG. Sidebar/logo lockups remain out of scope for this pass because the approved spec says visible sidebar usage is optional and should not compete with the avatar.

**Tech Stack:** Astro 5, static SVG assets in `public/`, Vitest for file-level assertions, Playwright for browser-level favicon verification.

---

## File Structure

- Modify: `public/favicon.svg`
  - Responsibility: Standalone Terminal Compass SVG favicon using the approved rounded-square, D silhouette, orange command arrow, and mustard underline.
- Create: `tests/unit/favicon.test.ts`
  - Responsibility: Assert the favicon has the approved static SVG characteristics and does not contain the old gradient/text badge implementation.
- Create: `tests/e2e/favicon.spec.ts`
  - Responsibility: Assert the built site links to `/favicon.svg` and the served SVG contains the new mark characteristics.

## Out of Scope

- No sidebar signature in this implementation.
- No avatar, layout, color-token, or theme refactor.
- No new generated raster icons unless a later browser/device check proves SVG favicon support is insufficient.

---

### Task 1: Replace the Favicon With Terminal Compass

**Files:**
- Modify: `public/favicon.svg`
- Create: `tests/unit/favicon.test.ts`
- Create: `tests/e2e/favicon.spec.ts`

- [ ] **Step 1: Write the failing unit test**

Create `tests/unit/favicon.test.ts` with this exact content:

```ts
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
```

- [ ] **Step 2: Run the unit test to verify it fails against the old favicon**

Run:

```bash
npm test -- tests/unit/favicon.test.ts
```

Expected: FAIL. The old `public/favicon.svg` still contains `linearGradient`, `<text`, `#FA5252`, `#DD2476`, and lacks the new rounded-square `rx="8"` Terminal Compass colors.

- [ ] **Step 3: Write the failing browser-level favicon test**

Create `tests/e2e/favicon.spec.ts` with this exact content:

```ts
import { expect, test } from "@playwright/test";

test.describe("Favicon", () => {
  test("links to the Terminal Compass SVG favicon", async ({ page, request }) => {
    await page.goto("/");

    const faviconHref = await page
      .locator('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute("href");

    expect(faviconHref).toBe("/favicon.svg");

    const faviconUrl = new URL(faviconHref!, page.url()).toString();
    const response = await request.get(faviconUrl);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");

    const svg = await response.text();
    expect(svg).toContain("#252220");
    expect(svg).toContain("#F2EDE4");
    expect(svg).toContain("#E07A3E");
    expect(svg).toContain("#D4B05A");
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("linearGradient");
  });
});
```

- [ ] **Step 4: Run the e2e test to verify it fails against the old favicon**

Run:

```bash
npm run test:e2e -- tests/e2e/favicon.spec.ts
```

Expected: FAIL. The browser can find `/favicon.svg`, but the served SVG still has the old text/gradient implementation and lacks the approved Terminal Compass color set.

- [ ] **Step 5: Replace the favicon SVG with the approved Terminal Compass mark**

Replace all content in `public/favicon.svg` with this exact SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Duy Pham Terminal Compass logo">
  <rect width="32" height="32" rx="8" fill="#252220" />
  <path
    d="M10.25 10.25H15.9C21.05 10.25 24.25 12.75 24.25 16C24.25 19.25 21.05 21.75 15.9 21.75H10.25V10.25Z"
    fill="none"
    stroke="#F2EDE4"
    stroke-width="2.5"
    stroke-linejoin="round"
  />
  <path
    d="M16 10.25L24.75 16L16 21.75"
    fill="none"
    stroke="#E07A3E"
    stroke-width="2.75"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <circle cx="24.75" cy="16" r="1.5" fill="#D4B05A" />
  <path
    d="M10.25 25H24.25"
    fill="none"
    stroke="#D4B05A"
    stroke-width="2.15"
    stroke-linecap="round"
  />
</svg>
```

- [ ] **Step 6: Run the unit test to verify it passes**

Run:

```bash
npm test -- tests/unit/favicon.test.ts
```

Expected: PASS. Both favicon unit tests pass.

- [ ] **Step 7: Run the favicon e2e test to verify it passes**

Run:

```bash
npm run test:e2e -- tests/e2e/favicon.spec.ts
```

Expected: PASS. Playwright builds/previews the site, loads `/`, fetches `/favicon.svg`, and confirms the new SVG characteristics.

- [ ] **Step 8: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS. Astro finishes building the site and `dist/favicon.svg` is generated from `public/favicon.svg`.

- [ ] **Step 9: Visually inspect the favicon SVG**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:4321/favicon.svg` in the in-app browser. Expected: a dark rounded-square Terminal Compass mark with a light `D` silhouette, orange command arrow, mustard dot, and mustard underline. Stop the dev server after inspection.

- [ ] **Step 10: Commit the implementation**

Run:

```bash
git add public/favicon.svg tests/unit/favicon.test.ts tests/e2e/favicon.spec.ts
git commit -m "feat: add terminal compass favicon"
```

Expected: Commit succeeds with only the favicon and the two new tests staged.

---

## Final Verification

After Task 1 is committed, run:

```bash
npm test
npm run test:e2e
npm run build
```

Expected:

- Vitest passes, including `tests/unit/favicon.test.ts`.
- Playwright passes, including `tests/e2e/favicon.spec.ts`.
- Production build passes.

Review the git diff before shipping:

```bash
git status --short
git show --stat --oneline --name-only HEAD
```

Expected:

- The implementation commit contains `public/favicon.svg`, `tests/unit/favicon.test.ts`, and `tests/e2e/favicon.spec.ts`.
- Unrelated pre-existing worktree changes remain unstaged.
