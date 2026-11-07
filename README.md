# duypham.me — Personal Portfolio & Edge Referral Tracker

Personal site and single-page resume for **Duy Pham** (`duypham.me`), built with **Astro 5** in the **Kit Room v2** editorial style.

## Architecture

- **Single source of truth (`src/data/*`)** — All page copy, work timeline, metrics, skills, education, side projects (`labs.ts`), and resume layout (`resume.ts`) live in typed TypeScript data modules.
- **Editorial pages (`src/pages/*`)** —
  - `/` (`index.astro`): Full portfolio with hero, selected impact, experience timeline, capabilities, labs preview, education & languages, and contact section.
  - `/labs` (`labs.astro`): Interactive start-list of side builds with status filtering (`Live`, `Building`, `Paused`, `Archived`).
  - `/404` (`404.astro`): Kit Room v2 off-route fallback page.
- **Deterministic 1-page ATS Resume PDF (`scripts/resume/generate.ts`)** — Renders `resume.ts` via headless Chromium (Playwright) into `public/resume.pdf`, verifying a strict 1-page tagged PDF fit with embedded fonts before every production build.
- **Cloudflare Edge Referral & Traffic Tracker (`workers/referral-tracker/`)** — Lightweight Cloudflare Worker + D1 (`portfolio-referrals`) + Discord Webhook (`#portfolio-radar`) running at the edge in front of `duypham.me`:
  - Logs page views, short-link redirects (`/cv`, `/in`, `/gh`), and PDF downloads (`/resume*.pdf`) with zero added latency via `ctx.waitUntil()`.
  - Sends rich 9-field Discord notifications (Visitor ID, Path, Query Params, Location + Google Maps link, Device/Browser, Browser Language, Network ASN/ISP/Colo, Referer, Visitor Timezone).
  - Supports self-visit muting on any device via `?radar=off` (sets `__cf_radar_ignore=1` cookie on `.duypham.me` for 1 year) and `?radar=on`.

## Quality Gates

- **Unit & Content Rules (`tests/unit/*`)** — Vitest suite enforcing data invariants, banned-phrase guardrails (`src/lib/contentRules.ts`), private client-term filtering, 1-page PDF guard, and Cloudflare Worker edge logic.
- **Dist Content Scanner (`scripts/qa/scan-dist.mjs`)** — Post-build scan of all generated HTML in `dist/` to ensure zero banned or private terms slip into production markup.
- **WCAG AA Contrast Audit (`scripts/qa/contrast.mjs`)** — Headless Chromium audit across `/`, `/labs`, and `/404` in both light and dark themes at desktop (`1440px`) and mobile (`390px`) widths (`>= 4.5:1` for body text, `>= 3.0:1` for large text and UI controls).
- **Playwright E2E (`tests/e2e/*`)** — End-to-end verification of `/`, `/labs`, `/404`, theme toggling, JSON-LD person schema, OpenGraph cards, and PDF asset availability.

## Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Astro dev server at `localhost:4321` |
| `npm test` | Run Vitest unit test suite |
| `npm run build` | Generate 1-page `public/resume.pdf` and build static site to `dist/` |
| `npm run test:e2e` | Run Playwright end-to-end tests against production preview |
| `npm run qa:scan` | Scan built HTML in `dist/` against content rules |
| `npm run qa:contrast` | Run WCAG AA contrast check across light and dark themes |
| `npm run worker:deploy` | Deploy Cloudflare Worker (`duypham-referral-tracker`) |
| `npm run worker:d1:init` | Apply `workers/referral-tracker/schema.sql` to remote Cloudflare D1 |
| `npm run worker:secret:discord` | Configure `DISCORD_WEBHOOK_URL` secret on Cloudflare Worker |
| `npm run worker:stats` | Query latest 20 hits from remote Cloudflare D1 (`portfolio-referrals`) |
