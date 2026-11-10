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
    jobTitle: "Associate Product Manager",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    shortCompany: "Ringkas",
    companyUrl: "https://ringkas.co.id",
    startDate: "Aug 2024",
    endDate: null,
    domain: "Indonesian mortgage (KPR) fintech",
    scope:
      "Drive features across the Ringkas platform end to end, from problem framing and PRD through engineering delivery and technical QA · Work directly with Design, QA, Engineering and Data · Report to the Head of Product",
    tag: "Same team, new role",
    description: [
      "Owned the requirements for **Pillar Portal**, the configuration layer of Ringkas's B2B platform for building and customizing AI agents, from PRD through engineering delivery to production. Pillar powers product demos and enterprise tenders, and its embeddable chat-widget SDK is in rollout to a first enterprise client",
      "Delivery PM from mid-project for **Ringkas AI Financial Assistant**, an AI assistant for Indonesia's mortgage (KPR) market: ran the timeline and cross-team coordination to an on-time release, and wrote the release requirements: a 3-phase rollout with cost gates and admin-panel feature-flag transitions, to cap spend as access widened and keep each phase reversible. Indonesia-based PMs owned testing and evaluation",
      "Capped anonymous AI assistant usage with daily and global limits, and set higher limits for signed-in users, trading open anonymous access for capped cost and a reason to register",
      "Traced OCR failures while a second vendor was being integrated and fixed the causes with Engineering: success rate **~40% → ~89%**, existing vendor kept and the second vendor dropped ([case 01](#h-case1))",
      "Built a vision-language model (VLM) OCR proof of concept with the AI team: benchmarked **87% lower cost** against **74% higher latency**. Deprioritised for production after a company strategy shift",
      "Coordinated the security questionnaire response for a major Indonesian e-wallet partner, bringing Engineering, AI and Compliance into one response using system knowledge from my engineering years",
      "Product Manager for platform changes: masked borrower contact details from lenders until an application is submitted to them, made the **SPR issue date** mandatory across CRM, consumer-app and API uploads, and let company admins change a user's login ID",
      "Co-owned the **API documentation** (payload reference and changelog) with the Head of Product for a Saudi bank partner integrating with the CRM through a housing-fund-compatible API (10 operations). Tested it against the live APIs, corrected **about 30 doc-vs-live gaps**, and filed a pagination defect that engineering fixed; ran the response to the bank's UAT feedback. The integration is in UAT",
      "Wrote the PRD for **document resubmission** for Saudi lenders, wrote 13 demo test cases for a Saudi developer partner's CRM proof of value, and reviewed QA's **55-case UAT workbook**, flagging problems in 37",
      "As point of contact for platform support tickets, I triage and root-cause issues with hands-on SQL, route code changes to Engineering, and turn recurring Ops/CS pain into PRDs for shipped change requests: Advanced Filter, cross-org switch, real-time Discord alerts when KYC checks or bank submissions fail",
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
      "Operated as Technical Solution Partner alongside engineering: challenged PRDs and proposed alternatives with PM and Design, not just receiving specs to build",
      "Built core modules of the in-house loan platform (now **Ringkas CRM**, where developers, banks and agents run mortgage applications) in **300+ commits** across a Node.js/GraphQL backend and React frontend: eKYC vendor integration, application status transitions, KPR asset forms, organization and workgroup management, and account security (OTP-verified login-ID change, forced password reset), replacing prior outsourced delivery",
      "Shipped **bank contract signing (akad)** to production with the team in April 2023, then built its backend on the rebuilt platform in 2024. Ran production data-fix scripts and investigated support bugs on the CRM",
      "Covered the Data Analyst gap during the outsource handoff: kept Ops/CS reports accurate by correcting their datapoints until a permanent hire joined",
      "Coordinated progress tracking between in-house and outsourced engineering teams during the platform transition, surfacing blockers and timeline risk to leadership",
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
      "Translated enterprise retail clients' requirements into Oracle and SAP integration designs, and maintained the API contracts in production",
      "Built AI models for VAT invoice extraction (YOLO, Faster R-CNN, CRNN, VietOCR): worked across the pipeline from data collection through production and inference optimization",
      "Shipped an end-to-end Purchase Order processing service (DB, APIs, Serverless, deployment) at **about 75% unit-test coverage**, handling **about 30 partner templates**",
    ],
  },
] as const;
