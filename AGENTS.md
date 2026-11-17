## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:

- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## Principal QA Standard

Always proactively self-test all changes like a Principal QA Engineer before reporting completion:
- Never leave testing to the user when you can execute and verify it yourself.
- Run and verify the full quality gate suite: unit tests (`npm test`), build & PDF generation (`npm run build`), built HTML content-rule scan (`npm run qa:scan`), WCAG AA contrast audit across all pages/viewports/themes (`npm run qa:contrast`), and Playwright E2E tests (`npm run test:e2e`), adding new E2E tests whenever new routes or behaviors are introduced.
- For edge/cloud deployments (e.g., Cloudflare Workers & D1), execute live end-to-end HTTP and database assertions against the deployed endpoint (redirect hops, cookies, cross-subdomain behavior, bot/ignore filters, and database persistence).
- When opening a PR, watch CI checks (`gh pr checks --watch`) and once all checks are green with no review blockers, auto-merge the PR (`gh pr merge --squash --delete-branch`) and verify the production deployment without asking for confirmation.

## Content & Copy Guardrails

- Do not include granular internal task, endpoint, gap, test-case, or commit counts in CV PDF or website portfolio copy: specifically omit exact Saudi API endpoint/operation counts (`10`), Saudi spec-vs-live gap counts (`~30` / `30`), Saudi demo test-case counts (`13`), QA UAT workbook counts (`55` / `37`), and Ringkas commit counts (`300+`); express Ringkas SWE work through concrete engineering achievements grounded in commit history rather than commit volume.
- Never label the Ringkas OCR investigation (`~40% → ~89%`) as `eKYC OCR` — it is OCR only, with no KYC (`eKYC` applies solely to the Ringkas SWE vendor-integration module).
- Omit obscure local acronyms like `SPR`; describe domain concepts in plain English.
- Question every fact before adding ATS keywords: never attach unverified tech stacks, causal reasons, titles, or role labels without direct source proof or explicit confirmation from Duy.
- Apply `anti-ai-writing` (`A1–A5`) across all website portfolio and CV PDF copy while keeping website and PDF facts strictly synchronized.
