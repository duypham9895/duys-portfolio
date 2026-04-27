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
      "Led launch of Ringkas AI Financial Assistant — first of its kind in the Indonesian fintech market — as PIC, coordinating BD, Engineering, AI, Design, and Compliance from private beta (Feb 2025) to public release (Jul 2025); 38K+ conversations and 1,900+ transactions post-launch",
      "Lifted OCR success rate from ~40% to >85% by tracing FE+BE source code to root-cause redundant auto-resizing and incorrect crop logic in the image preprocessing pipeline, then driving the cross-team fix",
      "Owned cross-team response to security questionnaire from a top-tier e-wallet partner — coordinating Engineering, AI, and Compliance inputs while drawing on prior SWE-era system knowledge — directly enabling deal closure",
      "Translated Ops/CS pain points (surfaced via hands-on SQL incident triage) into shipped CRs: Advanced Filter (consolidated dual-platform workflow into single CRM), cross-org account switch without re-login, AI cost guardrails (curbed anonymous spend, drove registration), real-time business-event notifications",
      "Diagnosed reCAPTCHA v3 site-key loading failures in client browsers and proposed v2 fallback design; rollout eliminated a recurring login-blocker (~3–4 support tickets/month → 0)",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    companyUrl: "https://ringkas.co.id",
    startDate: "Dec 2022",
    endDate: "Jul 2024",
    description: [
      "Engaged as Technical Solution Partner alongside engineering work — collaborated with PM and Design during PRD development to challenge assumptions, propose alternative implementations, and shape product decisions before code, not just receive specs and build",
      "Built features across the stack during the in-house rebuild of Ringkas's core loan origination platform (now Ringkas CRM), replacing prior outsourced delivery",
      "Stepped in as interim Data Reporting owner during the outsource handoff, keeping reporting outputs unblocked until a permanent hire was onboarded",
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
      "Built AI models for VAT invoice data extraction — YOLO and Faster RCNN for text localization, CRNN and VietOCR for text recognition — owning the pipeline from data collection and preprocessing through production deployment and prediction-time optimization",
      "Designed and shipped Purchase Order processing service end-to-end (DB schema, APIs, Serverless config, deployment) with ~75% unit-test coverage; system handled PO files up to 1,000 pages and covered ~30 partner PO templates",
      "Integrated Oracle and SAP systems for major enterprise retail clients — translated customer requirements into integration designs and maintained API contracts in production",
    ],
  },
] as const;
