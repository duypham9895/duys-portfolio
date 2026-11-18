export interface Experience {
  readonly jobTitle: string;
  readonly companyName: string;
  /** Short name for the season strip and nav, e.g. "Ringkas". */
  readonly shortCompany: string;
  readonly companyUrl: string;
  readonly startDate: string;
  readonly endDate: string | null;
  /** Business domain shown after the dates, e.g. "B2B SaaS / invoice automation". */
  readonly domain?: string;
  readonly scope?: string;
  readonly tag?: string;
  /** Site bullets. `**text**` marks strong text; `[text](#id)` marks an in-page link. */
  readonly description: readonly string[];
}

export const experiences: readonly Experience[] = [
  {
    jobTitle: "Product Manager",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    shortCompany: "Ringkas",
    companyUrl: "https://ringkas.co.id",
    startDate: "Aug 2024",
    endDate: null,
    domain: "Indonesian mortgage (KPR) fintech · Digital lending",
    scope:
      "Transitioned internally from Software Engineer · Own platform and AI features end to end across PRD, user stories, acceptance criteria, workflow prototyping, engineering delivery, and UAT · Work directly with Design, QA, Engineering, and Data · Report to the Head of Product",
    description: [
      "Owned end-to-end product requirements (PRD to production) for **Pillar Portal**, the configuration layer of Ringkas's B2B Generative AI agent platform with prompt-template governance. Pillar powers product demos and enterprise tenders, and its embeddable chat-widget SDK is rolling out to a first enterprise client",
      "Delivery PM from mid-project for **Ringkas AI Financial Assistant** in Indonesia's mortgage (KPR) market: ran cross-team delivery and release readiness for an on-time release, and wrote the 3-phase rollout specs with feature flags and spend caps so each phase stayed reversible",
      "Set daily and global usage caps on anonymous AI assistant traffic with higher quotas for signed-in users, controlling LLM spend while giving borrowers a reason to register",
      "Traced OCR failures in parallel with a second-vendor evaluation and fixed the root causes (vendor auth errors and frontend/backend image-resizing regressions) with Engineering: success rate rose **~40% → ~89%**, keeping the existing vendor and avoiding a second integration ([case 01](#h-case1))",
      "Built a vision-language model (VLM) OCR proof of concept with the AI team and benchmarked **87% lower cost** against **74% higher latency**; deprioritized for production after a company strategy shift",
      "Led the cross-functional response to a major Indonesian e-wallet partner's security and compliance questionnaire across Engineering, AI, and Compliance",
      "Shipped platform privacy, data-integrity, and multi-tenant admin controls: masked **borrower PII** from lenders until application submission, enforced mandatory **property booking-letter issue date** validation across CRM, mobile app, and API uploads, and built self-serve login-ID management for company admins",
      "Co-owned **API integration specs** (payload reference and changelog) with the Head of Product for a Saudi bank partner integrating with Ringkas CRM through a housing-fund-compatible API. Tested live endpoints against the spec, fixed **spec-vs-live payload gaps**, filed a pagination defect that Engineering resolved, and ran the UAT response",
      "Wrote the **document-resubmission PRD** for Saudi lenders, authored CRM proof-of-value demo test scenarios for a Saudi property developer, and audited QA's **User Acceptance Testing (UAT)** workbook before partner sign-off",
      "Point of contact for production support triage and **support-led discovery**: investigate defects with hands-on SQL analytics, prioritize backlog fixes with Engineering, and turn recurring Ops/CS pain into shipped PRDs (Advanced Filter, multi-org switch, real-time Discord alerts on KYC or bank-submission failures)",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    shortCompany: "Ringkas",
    companyUrl: "https://ringkas.co.id",
    startDate: "Dec 2022",
    endDate: "Jul 2024",
    description: [
      "Challenged PRDs with PM and Design as a Technical Solution Partner, and proposed changes to the commission data model that the team shipped",
      "Top contributor to the legacy loan CRM as engineering moved in-house (Dec 2022 to Jul 2023): borrower accounts, KYC with a consent check, and status mapping across user roles",
      "Rebuilt the bank decision page and fixed contract-signing (**akad**) bugs before the April 2023 release. Built the akad confirmation API in 2024",
      "Built core modules of the new platform, now **Ringkas CRM** (Node.js/GraphQL, React): the bank submission form and an async **eKYC** pipeline with dead-letter queues that starts the credit check automatically",
      "Covered the Data Analyst gap after the vendor handoff. Took over the data-lake ETL (May to Aug 2023), added partner-bank branch and staff tables, and fixed app-vs-report mismatches",
      "Tracked delivery between in-house and outsourced engineering teams during the platform migration and flagged timeline blockers early to leadership",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Bizzi Vietnam",
    shortCompany: "Bizzi Vietnam",
    companyUrl: "https://www.bizzi.vn/",
    startDate: "Oct 2020",
    endDate: "Aug 2022",
    domain: "B2B SaaS / invoice automation",
    description: [
      "Translated enterprise retail clients' business requirements into **SAP and Oracle** integration specs and maintained the production API contracts",
      "Trained and deployed production Computer Vision / Deep Learning OCR models for VAT invoice extraction (**YOLO, Faster R-CNN, CRNN, VietOCR**), from dataset curation through inference optimization",
      "Shipped an end-to-end serverless Purchase Order processing service (database, APIs, serverless) at **~75% unit-test coverage**, supporting **~30 partner templates**",
    ],
  },
] as const;
