# Kit Room v2 Port: Implementation Plan (rev 4)

**Rev 4** applies the round-3 fixes, marked **[R3-x]**:
- a committed resume fixture
- a font assertion that can fail
- labs CSS order
- per-pattern regex anchors
- a scoped grep gate
- the local private-terms file

It also applies Duy's gap-label pick **B**.


**Rev 3** fixes the round-2 blockers, marked **[R2-x]**:
- commit order
- fonts
- the strip boundary rule
- dead regexes
- the empty-state test
- publishing confidential material to a PUBLIC repo

**Rev 2** answered plan-review round 1. It covers 18 blockers across 3 reviewers: build-deploy (5), content-design (7) and tests-verification (6). Every blocker maps to a decision or task below, marked **[R1-x]**.

**Goal:** Ship the approved Kit Room v2 design (home + `/labs`), the Night Stage dark theme, the corrected content (Duy's inputs) and the single-column ATS resume into the Astro site. Work on branch `feat/kit-room-theme` from `develop` and open a PR. **Do not merge**; Duy merges.

**Approved sources of truth:**
- Design: `docs/mockups/cycling-theme/kit-room-v2.html` (home) and `kit-room-v2-labs.html` (labs). Night Stage dark, the left-to-right strip and no avatar are already applied there.
- Content: `docs/mockups/cycling-theme/INPUTS.md` (authoritative; its "Approvals" section records that Duy approved the v2 copy, the DRAFT blocks included, on 2026-10-25), then `src/data/*.ts`.
- Resume: `docs/mockups/cycling-theme/resume/resume.html` + `render.mjs` + `RESEARCH.md`.
- **Gap label (Duy picked B on 2026-10-25):**
  - The strip label reads `BETWEEN ROLES · SEP–NOV 2022`.
  - The gap segment is a darker dashed line with end ticks.
  - The hover/focus tooltip is titled "Base training" and lists the 3 courses, taken from `certifications.ts` dated inside the gap. It is dismissible with Escape and hoverable (WCAG 1.4.13).
  - Below 900px the strip is hidden and a thin divider row with the same text shows instead. The strip is also hidden under `@media (hover: none)`.

**Tech stack:** Astro 5, Tailwind 3 (kept, preflight off), Vitest, Playwright. Build = `tsx scripts/resume/generate.ts && astro build`. Production deploy runs only on push to `develop`.

---

## Decisions

**D1. CSS and the cascade [R1 build-1, build-2, content-5]**
- Turn off Tailwind's reset: `corePlugins: { preflight: false }` in `tailwind.config.mjs`. The mockup was approved on browser defaults.
- Change the `fontFamily.sans` stack to Archivo.
- **Fonts [R2-fonts]:** replace the Inter `<link>` in `Layout.astro` with the exact v2 Google Fonts link (`Archivo:wdth,wght@62..125,400..800` + `IBM Plex Mono:wght@500`, kit-room-v2.html:11, plus its preconnects).
- In `global.css`:
  - delete the legacy `@layer base` / `@layer components` blocks (`.card`, `.section-label`, `.social-icon`, `.skill-tag`, `.fade-in`, the base `body` background);
  - keep only the `@tailwind` directives and the token blocks.
- `src/styles/kit-room.css` holds ALL v2 CSS:
  - home CSS from `kit-room-v2.html`, plus the labs-only rules from `kit-room-v2-labs.html` (`.filters`, `.js .filters`, `.chip-key`, `.empty`, `h1.h`, `.back`, `.lhero`, `.footer.slim`, `.ptype`, `.status.paused/.archived`, the type column);
  - token blocks: Kit Room light + Night Stage dark, with the same names as the mockup.
- It is imported **from `Layout.astro` after `global.css`**, never via `@import` inside `global.css`.
- **Verify:**
  - `dist/_astro/*.css` contains the `.bib-name` and `.js .filters` selectors.
  - An e2e test asserts the computed `body` background and `a` colour in light and dark, using `toHaveCSS` with rgb values and `reducedMotion: 'reduce'`. Light body must be `rgb(250, 250, 247)`, dark body `rgb(11, 17, 32)`, and the checked link is the first `a.co`.
  - An e2e test asserts, after `document.fonts.ready`, that `[...document.fonts]` contains a face with family `Archivo` **and** a face with family `IBM Plex Mono`, both with `status === 'loaded'` [R3-fonts]. `fonts.check()` is not used; it returns true even with no faces loaded.
- **CSS order inside `kit-room.css` mirrors the mockups [R3-css]:** tokens, then home base/components, then the labs additions, then the Night Stage dark overrides **last**, so that `:where([data-theme="dark"]) .filters button` (border-strong) still wins.
  - Only rules that collide with home are scoped. The one known collision is `.startlist … grid-row: span 5`, scoped as `body.page-labs .startlist …`.
  - Selectors that depend on `.js` are written `.js body.page-labs …`.
  - The contrast check (T6) adds UI-boundary pairs, including dark filter-button borders at ≥ 3:1.
- The `theme-color` metas are updated to `#FAFAF7` (light) and `#0B1120` (dark).

**D2. Layout shells [R1 build-4, build-5, content-4]**
- `Layout.astro` provides `<head>` and a `header` slot. It no longer renders a navbar.
- The anti-FOUC inline script:
  - sets `data-theme`;
  - adds `document.documentElement.classList.add("js")`;
  - no longer contains the resume theme-swap code.
- Port the v2 reveal script (`.reveal` → `.go`, reduced-motion aware). Delete the old `.fade-in` observer.
- `Navbar.astro` (home only):
  - links Work · Experience · About · Skills · Labs · Certifications;
  - the single ThemeToggle;
  - **the `<details class="menu">` mobile Menu and its close-on-click script** from v2.
- `Topbar.astro` (labs only): wordmark + ThemeToggle, as in v2.
- The "← Back to home" links sit where v2 puts them: a breadcrumb `<nav>` below the header, and a button at the bottom (kit-room-v2-labs.html:651-653, :760).
- Links in any header that can appear off `/` use the `/#work` form.
- `ThemeToggle.astro` keeps its theme logic, drops its resume-swap code, and is restyled to v2.

**D3. Data model: site copy and resume copy, one source [R1 content-1, tests-3]**
- Facts (titles, companies, dates, URLs, certifications, labs) stay in the existing modules. Additions:
  - `personal.ts`:
    - `positioning`;
    - `location`, the v2 line "Based in Ho Chi Minh City · Hybrid preferred · Open to relocation with company support";
    - `languages`;
    - `education`;
    - `about`, made of `opener` and `howIWork[3]`.
    - `bio` is removed; v2 renders none.
    - `resumeUrls` becomes `resumeUrl`.
  - `experiences.ts`:
    - every role gains `shortCompany` ("Ringkas", "Bizzi Vietnam") for strip labels and nav;
    - `domain` is optional: APM gets "Indonesian mortgage (KPR) fintech", Bizzi gets "B2B SaaS / invoice automation", and Ringkas SWE gets none, as in v2;
    - the APM role gains `scope`. The APM role gains `tag: "Same team, new role"`. `description` holds the v2 site bullets verbatim.
  - `skills.ts` (per v2):
    - **Product**: the 4 PM skills, each with a story line, then PRD Writing, Stakeholder Management, Compliance & Risk Coordination.
    - **Technical depth**: primaries plus the rest, and a **Tools** subhead (Figma, Postman, Notion, Claude Code).
    - **Engineering background**: a one-line list.
    - GitLab, GitHub, Golang and GraphQL chips are dropped.
  - `caseStudies.ts`: OCR + Pillar, verbatim from v2.
  - `labs.ts`: Easel reads "menstrual-cycle tracking", and a `featured` ordered slug list (split-bill, pm-assessment-gym, evoyage). The home "Three of six" / "All labs (6)" counts are computed.
  - `certifications.ts`: each cert gains `shortName` for aria-labels ("Claude 101", …), as in v2.
- **`src/data/resume.ts`** holds the resume-only presentation copy, taken verbatim from `resume/resume.html`:
  - `titleLine`, `locationLine`;
  - `summary`;
  - per-role `{ scope?, context?, bullets[] }`, keyed by role order;
  - `skillLines[]` (Product / Technical / Engineering background / Languages);
  - `certifications[3]` (short display form);
  - `links[]` (display label + href, GitHub included).
- Facts such as companies, titles and dates still come from `experiences.ts`.
- **Verify [R3-fixture]:**
  - A committed fixture `tests/fixtures/resume-body.txt` holds the `<body>` text extracted from the approved `resume/resume.html`. It is the public resume, with no private terms.
  - The unit test renders `template.ts`, extracts `<body>` text, normalises whitespace and asserts equality with the fixture.
  - INPUTS-derived values (education, languages, location) are hardcoded in tests, never read from the uncommitted `INPUTS.md`.

**D4. Season strip [R1 content-3, tests-4]**
- Pure function `src/lib/seasonStrip.ts`: `seasonStrip(experiences, now)` returns `{ segments, ticks }`. Rules, matching the mockup's comment at kit-room-v2.html:843-846 [R2-strip]:
  - Day scale from the first start date to `now`.
  - Start = the 1st of the start month.
  - **End = the 1st of the month after `endDate`** (the role covers its whole end month, per Duy's pick B). Result on 2026-10-25:
    - Bizzi ends 2022-09-01: 31.60%
    - gap 2022-09-01 → 2022-12-01: 4.11%
    - Ringkas SWE ends 2024-08-01 (27.49%), exactly where APM starts (36.79%), so there is no gap.
  - Labels use `shortCompany`.
  - The gap segment carries the pick-B label and tooltip. The gap label text is derived from the computed gap months ("SEP–NOV 2022").
  - Gaps become `gap` segments.
  - A role's name label spans its segment plus any following gap.
  - Ticks: "Oct 2020" at 0, each Jan-1 year boundary, "Now" at 100%. Any year tick within 6% of either end is dropped.
- `ExperienceCard.astro` renders its output with `now = build date`.
- **Verify:**
  - Unit test with `now = 2026-10-25`: widths 31.60 / 4.11 / 27.49 / 36.79 (±0.05), ticks {Oct 2020, 2022, 2023, 2024, 2025, 2026, Now}, and gap label "SEP–NOV 2022".
  - A second test with `now = 2027-03-01`: widths change, and no tick lies within 6% of "Now".
  - E2E asserts only the order (Bizzi first, APM last) and the kicker text, never widths.

**D5. Content rules, one list [R1 tests-5]**
- `src/lib/contentRules.ts` exports `BANNED`, a list of case-insensitive patterns. **Each pattern is written with its own anchors** [R2-regex, R3-regex]: the default wrapper is `(?<![\w$])…(?!\w)`, but patterns ending in punctuation (e.g. `Indonesian \(`) omit the trailing `(?!\w)`. Plural and hyphen variants are included (`roadmaps?`, `bachelors?`, `user[- ]research`, `(re)?launch(es|ed|ing)?`).
  - `38K`, `38,000`, `1,900`, `launch(es|ed|ing)?`
  - `first-of-its-kind`, `Indonesia-first`, `top-3`
  - `\$1/day`, `\$200`, `\b5x\b`
  - `enabled deal closure`, `roadmap`, `user research`, `A/B`
  - `Bachelor`, `Dropout`, `notice period`
  - `(?<!Support-led )discovery`, `Indonesian \(`
- **Private terms [R2-public]:** client names that must never appear (see INPUTS #12e) are **not** written into any committed file, because the repo is PUBLIC.
  - They live in a gitignored `content-rules.local.json`. **T1 creates it** with the INPUTS #12e term(s).
  - The scanners merge it in when present. CI runs without it and says so in the test output.
- **Commit gate [R3-gate], two separate greps on `git diff --cached`, added lines only (`^\+`):**
  - (i) **Private terms:** no exclusions. It must be 0, and the gate **fails if `content-rules.local.json` is missing**.
  - (ii) **`BANNED`:** excludes the allowlisted files that must contain the patterns: `src/lib/contentRules.ts`, `tests/unit/content-rules*.test.ts` and its fixtures, and this plan file. It must be 0.
- Every pattern gets one positive and one negative unit fixture, including "Support-led discovery" as a negative case for `discovery`.
- The same list is used by:
  - (a) `tests/unit/content-rules.test.ts`: it deep-walks every export of every `src/data/*.ts` module (dynamic import via `readdirSync`), strips `**`, and skips `icons.ts` SVG paths;
  - (b) the e2e scan of `document.body.textContent`, which includes closed `<details>` and hidden strip text, plus `<title>`, the meta description and the JSON-LD on `/` and `/labs`;
  - (c) a CI step **after** `npm run build` (`node scripts/qa/scan-dist.mjs`) that scans `dist/**/*.html` text, plus a resume-text check inside the generator (the template HTML text must pass `BANNED`). It runs locally after build too.
- **Verify:** (a) fails on today's data (`personal.ts:29`, `experiences.ts:18,19,22`, and `skills.ts` "Cross-functional Launch Coordination") before T2's data edits, and passes after.

**D6. Resume generator [R1 build-NB, tests-2, content-7]**
- `template.ts` reproduces `resume.html`, filled from `resume.ts` + facts.
- Rendering moves into a side-effect-free `scripts/resume/render.ts`, which exports `renderPdf(html): Promise<Buffer>` and `assertOnePage(buf)`. `generate.ts` imports both. The `margin` option is deleted to match `render.mjs`.
- `generate.ts`:
  - copies `render.mjs`'s options exactly (`emulateMedia print`, `format A4`, `preferCSSPageSize: true`, `printBackground: false`, `tagged: true`, the `@page` margins in CSS);
  - renders to a **buffer**;
  - `countPdfPages(buffer)` (regex `/\/Type\s*\/Page\b(?!s)/g`) must equal 1, otherwise it throws before writing anything;
  - then writes `public/resume.pdf`, plus identical `resume-light.pdf` / `resume-dark.pdf` copies for old links.
- The dark resume theme and `HIGHLIGHTS` are removed, and `preview.ts` is updated.
- **Verify:**
  - A committed vitest test (`testTimeout: 60000`) renders an oversized fixture through `render.ts` and expects the guard to throw.
  - The same test asserts the buffer contains `/StructTreeRoot` (tagged output) and `/FontFile2` (embedded fonts).
  - A normal fixture passes.
  - `.gitignore` gains `.enola/`, `.playwright-mcp/`, `content-rules.local.json` and `public/resume.overflow.pdf`; `public/resume.pdf` is already listed.
  - `docs/mockups/` goes into `.git/info/exclude` (never committed) so `git add -A` cannot stage it.
  - On guard failure, the over-length render is written to `public/resume.overflow.pdf`, and CI uploads both PDFs with `if: always()`.

**D7. CI gate on the PR [R1 build-3, tests-1, content-7] (scope change, visible in the PR diff for Duy)**
- Add `pull_request: branches: [develop]` to `.github/workflows/deploy.yml`.
- Add `npx playwright install --with-deps chromium && npm run test:e2e` to the **test job only**. The deploy job keeps its existing push-only condition.
- Upload `public/resume.pdf` from the CI build as an artifact. It is the Linux (Liberation Sans) render, and it exercises the 1-page guard before merge.
- The Vercel-preview criterion is dropped. The ignore-build script is untouched.
- `playwright.config.ts`: `webServer.timeout: 120000` and `reuseExistingServer: !process.env.CI`.
- **Verify:** the PR shows a green test job. The artifact PDF has 1 page, and its `pdftotext` contents match the expected text.

**D8. Fidelity choices**
- **Section ids, aria-labels and links:**
  - Section ids follow v2: `#work`, `#experience`, `#about`, `#skills`, `#labs`, `#certifications`.
  - Labs aria-labels follow v2: "X live site" / "X on GitHub".
  - Resume links follow v2: two links (hero + footer), `target="_blank"`, no `download`.
  - Tests are updated to match the mockup, not the other way round.
- **Labs page** [R1 content-6]:
  - a Type column;
  - a status key showing Live / Building / Paused / Archived;
  - an empty-state row;
  - the kicker "Start list · {n} entries" and the filter counts "All · n / Live · n / Building · n", **computed from `labs.ts`**;
  - filters hidden without JS (`.js` class).
  - The "[Duy: question this tested]" slots are not shipped, and the labs intro becomes "Side builds."
  - The home Labs intro keeps the approved copy. The PR flags this as an open copy item.
- **Hero** carries every v2 element:
  - topbar wordmark + "Labs →"
  - bib-top kickers
  - name
  - literal title
  - "2020 · Career start"
  - sub line
  - positioning line
  - 3 proof chips
  - Email / LinkedIn / Resume CTAs
  - bib-foot
  - profile block: location, languages, education, email, and the "Phone & other profiles" `<details>`
  - no avatar
- **Footer:** the "Café stop" kicker, lead, Email / LinkedIn / Resume CTAs and footer-meta. Labs uses the slim footer.
- **Certifications:** sorted by parsed month, descending. 3 shown, plus "Show all (7)".
- **Favicon:** unchanged. `src/assets/avatar.jpg` stays on disk, unused.
- **Resume URL:** the change from `/resume-light.pdf` to `/resume.pdf` is called out in the PR, and the legacy copies keep old links alive.
- **JSON-LD Person** is kept in `Layout.astro` even though v2 has none (SEO + existing test).

**D9. Commit discipline [R1 build-NB]**
- Each commit passes `npm test` + `npm run build` [R2-commits]. Commit order:
  1. tooling: preflight, CI, gitignore, the playwright config, listener fix
  2. **one feature commit**: lib + data + components + pages + resume generator + all unit tests (data, content-rules, seasonStrip, guard, resume text)
  3. e2e tests
  4. this plan file, with no private client names
- **`docs/mockups/` is NOT committed [R2-public].** The repo is PUBLIC, and `INPUTS.md` plus the superseded mockups are private working material.
  - They stay local and untracked.
  - The PR says so, and Duy decides later whether a redacted subset goes public.
- Before each commit, grep the staged diff for the private terms and the `BANNED` list (`git diff --cached`).

---

## Tasks

**T0. Branch + baseline.** `git switch -c feat/kit-room-theme` from an up-to-date `develop`. Run `npm test` (expect 30) and `npm run test:e2e` (expect 18), and record the counts.

**T1. Tooling.**
- Apply D1's Tailwind config change and the global.css cleanup.
- Apply D7's CI change.
- Apply the gitignore additions.
- Fix `portfolio.spec.ts` so the `pageerror` / `console` listeners are attached before `goto`.

**T2. Lib + data (unit tests first).**
- Write `seasonStrip`, `contentRules`, `countPdfPages` and their unit tests (D4, D5, D6). Confirm the content-rules test fails on current data.
- Update `data.test.ts` to the D3 contract:
  - no bio test; a test for `positioning` instead
  - skills: 3 groups with Product first, and a Tools subhead
  - `caseStudies`: 2 entries
  - `domain` / `scope` present
  - education, languages and location equal INPUTS #5–7 exactly
  - certifications still 7
  - Easel description contains "menstrual-cycle"
  - `featured` holds 3 valid slugs
- Edit the data files verbatim from v2 and `resume.html`.

**T3. Shell + components + pages.**
- Apply D1's import in Layout, then D2, then D8.
- Components: `Navbar`, `Topbar`, `Hero` (replaces `Sidebar`), `SelectedWork`, `ExperienceCard` (uses `seasonStrip`), `AboutCard`, `SkillsCard`, `LabsPreview`, `CertsCoursesCard`, `Footer`, `ThemeToggle`, `LabCard`.
- Rewrite `index.astro` and `labs.astro`, and update the meta from v2.

**T4. Resume.**
- `resume.ts`, `template.ts`, `transform.ts`, `generate.ts` and `preview.ts` per D6, with the D3 equality test.
- Run `npm run resume:generate`. Check: 1 page, `pdffonts` embedded, `pdftotext` matches the approved text.

**T5. E2E tests.**
- `portfolio.spec.ts`:
  - title in the hero structure (replaces the `h1 + p` assertion at :17)
  - **zero `img` on `/`**
  - hero + main visible at 1280
  - `#skills` contains "Product" and "Support-led discovery" (replaces the "Product Management" assertion)
  - `#certifications a` count is 7
  - socials: LinkedIn (hero) + Telegram, Zalo, GitHub, all `https`, checked via `toHaveAttribute` (not visibility, since three sit in a closed `<details>`), with `tel:` excluded
  - resume links: select by link text "Resume", count 2, every href `/resume.pdf`
  - `request.get('/resume.pdf')` returns 200 with `application/pdf`
  - strip order + kicker
  - the D5 banned scan on `/`
  - the D1 computed-style checks in both themes
  - at 390: Menu opens, and closes after picking a link
- `labs.spec.ts`:
  - the back link to `/` is found by its v2 text, not "Portfolio"
  - h1
  - 6 rows
  - v2 aria-labels: 4 live, 6 GitHub
  - filters visible with JS, Live filter shows 4
  - empty state: `page.evaluate` sets every `tr.row` `data-s` to `live`, clicks **Building**, then expects `tr.empty` visible [R2-empty]
  - no-JS: a context with `javaScriptEnabled: false` expects `.filters` hidden and all 6 rows visible
  - the mobile test uses the new row selector and the v2 aria-labels
  - back link to `/`
  - the D5 banned scan

**T6. Final checks + PR.**
- Commit `scripts/qa/contrast.mjs` (computed-colour WCAG check) and run it on `astro preview` in light and dark at 1440 and 390. Every text pair must be ≥ 4.5 (≥ 3 for ≥ 24px). Record the lowest 8 in the PR.
- Run the D5 grep over `dist/` and the PDF text: 0 hits.
- Run `astro preview` and load `/`, `/labs` and `/resume.pdf`. Take screenshots at 1440 and 390, light and dark, and set them beside the mockup.
- **Do not commit `docs/mockups/`** (see D9). Run the two-part gate from D5 over the full branch diff (`git diff develop...HEAD`, added lines): private terms 0, `BANNED` 0 outside the allowlist.
- Push and open the PR to `develop`. The body includes:
  - summary
  - screenshots
  - test counts
  - the CI artifact note
  - **a "Copy items to confirm before merge" list:**
    - positioning line
    - case-study prose, including the case 02 version B copy
    - About lines
    - footer lead
    - home Labs intro
    - labs meta description vs the visible "Side builds."
  - the `/resume.pdf` URL change and the note that `docs/mockups/` is kept out
  - "not merged, Duy merges"
  - the review label line

---

## Acceptance criteria
1. Home and `/labs` match the v2 mockup in structure, copy and tokens, in light and dark, at 1440 and 390. Checked by screenshots plus the D1 computed-style e2e.
2. Every fact traces to `INPUTS.md` / `src/data`. The D5 list passes on the data (unit), the rendered pages (e2e) and the PDF text (grep).
3. `public/resume.pdf` is 1 A4 page (guard + CI artifact), tagged, with embedded fonts, single column, and text equal to `resume.html` (unit test).
4. The strip is computed by `seasonStrip` (unit-tested at 2 dates), runs left to right, and ends at "Now". Role cards stay newest-first.
5. Unit + e2e are green locally and in the PR's CI test job, and the build passes with the 1-page guard on Linux.
6. No avatar (no `img` on `/`), no notice period, no bicycle imagery, favicon unchanged.
7. The PR is open against `develop`, not merged, and its copy-confirmation list is present.
