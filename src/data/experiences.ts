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
      "Delivery PM for **Ringkas AI Financial Assistant**, an AI assistant for Indonesia's mortgage (KPR) market: ran the timeline and cross-team coordination to an on-time release, and wrote the release requirements: a 3-phase rollout with cost gates and admin-panel feature-flag transitions, to cap spend per phase and keep each phase reversible. Indonesia-based PMs owned testing and evaluation",
      "Capped anonymous AI assistant usage with daily and global limits, and set higher limits for signed-in users, trading open anonymous access for capped cost and a reason to register",
      "Traced OCR failures before adding a second vendor: success rate **~40% → ~89%**, existing vendor kept ([case 01](#h-case1))",
      "Built a vision-language model (VLM) OCR proof of concept with the AI team: benchmarked **87% lower cost** against **74% higher latency**. Deprioritised for production after a company strategy shift",
      "Coordinated the security questionnaire response for a major Indonesian e-wallet partner, bringing Engineering, AI and Compliance into one response using system knowledge from my engineering years",
      "As point of contact for platform support tickets, I triage and root-cause issues with hands-on SQL, route code changes to Engineering, and turn recurring Ops/CS pain into PRDs for shipped change requests: Advanced Filter, cross-org switch, real-time Discord alerts when partner checks fail",
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
      "Built features across the stack during the in-house rebuild of Ringkas's core loan origination platform (now Ringkas CRM), replacing prior outsourced delivery",
      "Filled an interim Data Reporting role during the outsource handoff, keeping reports unblocked until a permanent hire onboarded",
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
      "Built AI models for VAT invoice extraction (YOLO, Faster R-CNN, CRNN, VietOCR): owned the pipeline from data collection through production and prediction-time optimization",
      "Shipped an end-to-end Purchase Order processing service (DB, APIs, Serverless, deployment) at **75% unit-test coverage**, handling **1,000-page files** across **30 partner templates**",
    ],
  },
] as const;
