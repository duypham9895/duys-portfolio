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

<!-- claude-reflect: learned rules (saved from the band; edit freely) -->
## Learned rules
- After opening a PR with no review blockers, auto-merge it without asking for confirmation.
- Always communicate with the user in Vietnamese.
- Always verify that information on the website matches the information in the PDF file (e.g., CV) and flag or fix any inconsistencies.
- Describe Duy's role on the original RISA AI chatbot as delivery PM (coordination, timeline, release readiness, light requirements), not as PRD author; avoid 'Drove from PRD'.
- Filter job scans to associate and PM-level roles; exclude senior, lead, staff, principal, and head titles.
- Run this project in Docker, not by launching it directly with npm.
- Do not say Duy doesn't make mockups; he builds prototypes so Engineering can visualize workflows, and Design later refines them into final visuals.
- Always proactively self-test changes like a Principal QA Engineer before reporting completion: never ask the user to manually test what can be verified automatically (unit tests, build, dist content scan, WCAG AA contrast audit, Playwright E2E for every route including new pages, cross-checking website vs. PDF copy, and live production/edge verification for deployed Workers/APIs).
<!-- end claude-reflect -->
