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
      "Led Indonesia's first AI Financial Assistant launch (private beta Feb 2025, public Jul 2025) — aligned 5 functions; reached 38K+ conversations and 1,900+ transactions",
      "Lifted OCR success rate from 40% to over 85% — traced source for FE+BE redundant resizing/crop bugs, then drove cross-team fix",
      "Owned security questionnaire response for a major Indonesian e-wallet partner — coordinated Engineering, AI, Compliance using SWE-era system knowledge; enabled deal closure",
      "Surfaced Ops/CS workflow pain via hands-on SQL incident triage and shipped resulting CRs: Advanced Filter, cross-org switch, AI cost guardrails, real-time event notifications",
      "Diagnosed reCAPTCHA v3 site-key failures in client browsers; proposed v2 fallback that eliminated a login-blocker (3-4 monthly tickets reduced to zero)",
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
