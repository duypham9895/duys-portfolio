export interface Experience {
  readonly jobTitle: string;
  readonly companyName: string;
  readonly companyUrl: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly description: readonly string[];
}

export const experiences: readonly Experience[] = [
  {
    jobTitle: "Associate Product Manager",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    companyUrl: "https://ringkas.co.id",
    startDate: "Aug 2024",
    endDate: null,
    description: [
      "Led Indonesia-first AI Financial Assistant launch via 3-phase rollout PRD (cost gates, admin-panel feature-flag transitions); reached 38K+ conversations, 1,900+ transactions",
      "Capped anonymous AI Financial Assistant usage ($1/day, $200 global) — 5x higher for authenticated users; protected runway and drove registration funnel",
      "Paused OCR vendor-swap PRD to investigate first — lifted success rate from 40% to over 85% by tracing redundant FE+BE preprocessing",
      "Built Vision-Language-Model (VLM) OCR POC with AI team — quantified 89% cost reduction with 48% latency tradeoff to inform vendor decision",
      "Owned security questionnaire response for a top-3 Indonesian e-wallet partner — coordinated Engineering, AI, Compliance using SWE-era system knowledge; enabled deal closure",
      "Wrote PRDs translating Ops/CS pain (surfaced via hands-on SQL triage) into shipped CRs post-HoP approval: Advanced Filter, cross-org switch, real-time event notifications",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    companyUrl: "https://ringkas.co.id",
    startDate: "Dec 2022",
    endDate: "Jul 2024",
    description: [
      "Operated as Technical Solution Partner alongside engineering — challenged PRDs and proposed alternatives with PM/Design, not just receiving specs to build",
      "Built features across the stack during the in-house rebuild of Ringkas's core loan origination platform (now Ringkas CRM), replacing prior outsourced delivery",
      "Filled interim Data Reporting role during outsource handoff, keeping reports unblocked until a permanent hire onboarded",
      "Coordinated progress tracking between in-house and outsourced engineering teams during the platform transition, surfacing blockers and timeline risk to leadership",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Bizzi Vietnam",
    companyUrl: "https://www.bizzi.vn/",
    startDate: "Oct 2020",
    endDate: "Aug 2022",
    description: [
      "Built AI models for VAT invoice extraction (YOLO, Faster RCNN, CRNN, VietOCR) — owned pipeline from data collection through production and prediction-time optimization",
      "Shipped end-to-end Purchase Order processing service (DB, APIs, Serverless, deployment) at 75% unit-test coverage — handled 1,000-page files across 30 partner templates",
      "Integrated Oracle and SAP systems for major enterprise retail clients — translated customer requirements into integration designs and maintained API contracts in production",
    ],
  },
] as const;
