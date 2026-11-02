import { personal } from "./personal";

/**
 * Resume-only presentation copy, verbatim from the approved resume
 * (docs/mockups/cycling-theme/resume/resume.html). Facts such as companies,
 * titles and dates come from experiences.ts.
 */

export interface ResumeRole {
  /** Rendered after a "Scope: " label. */
  readonly scope?: string;
  readonly context?: string;
  readonly bullets: readonly string[];
}

export interface ResumeSkillLine {
  readonly label: string;
  readonly text: string;
}

export interface ResumeLink {
  readonly label: string;
  readonly href: string;
}

export interface ResumeCopy {
  readonly titleLine: string;
  readonly locationLine: string;
  readonly links: readonly ResumeLink[];
  readonly summary: string;
  /** Same order as `experiences` (newest first). */
  readonly roles: readonly ResumeRole[];
  readonly skillLines: readonly ResumeSkillLine[];
  readonly education: string;
}

export const resume: ResumeCopy = {
  titleLine: "Associate Product Manager · Technical PM direction",
  locationLine: "Ho Chi Minh City · Hybrid preferred · Open to relocation with company support",
  links: [
    { label: "phamanhduy.sg@gmail.com", href: "mailto:phamanhduy.sg@gmail.com" },
    { label: "+84 963 769 049", href: "tel:+84963769049" },
    { label: "linkedin.com/in/phamanhduy", href: "https://www.linkedin.com/in/phamanhduy" },
    { label: "duypham.me", href: "https://www.duypham.me/cv" },
    { label: "github.com/duypham9895", href: "https://github.com/duypham9895" },
  ],
  summary:
    "Product manager with 5+ years in software, 3.5 as a software engineer. Drives platform features from PRD to delivery at Ringkas, an Indonesian mortgage (KPR) fintech, including Pillar Portal for a B2B AI-agent platform. Lifted OCR success from about 40% to 89% with Engineering, without adding a vendor.",
  roles: [
    {
      scope:
        "drive features across the Ringkas platform end to end, from PRD through engineering delivery and technical QA. Work directly with Design, QA, Engineering and Data; report to the Head of Product.",
      bullets: [
        "Owned Pillar Portal requirements, PRD to production, for a B2B AI-agent platform used in demos and enterprise tenders. Pillar's chat-widget SDK is rolling out to a first enterprise client.",
        "Traced OCR failures in parallel with second-vendor work; with Engineering, fixed an auth error and frontend/backend image resizing, lifting success from about 40% to 89%; vendor kept.",
        "Delivery PM for the Ringkas AI Financial Assistant, released on time; wrote its three-phase rollout behind cost gates and feature flags. Testing and evaluation owned by Indonesia-based PMs.",
        "Coordinated a major Indonesian e-wallet partner's security questionnaire with Engineering, AI and Compliance.",
        "Product Manager for platform changes: masked borrower contact details from lenders until an application is submitted to them, made the SPR issue date mandatory across CRM, consumer-app and API uploads, and let company admins change a user's login ID.",
        "Owned the API documentation (payload reference and changelog) for a Saudi bank partner integrating with the CRM through a housing-fund-compatible API (10 operations). Tested it against the live APIs, corrected about 30 doc-vs-live gaps, and filed a pagination defect that engineering fixed; ran the response to the bank's UAT feedback. The integration is in UAT.",
        "Wrote the PRD for document resubmission for Saudi lenders, wrote 13 demo test cases for a Saudi developer partner's CRM proof of value, and reviewed QA's 55-case UAT workbook, flagging problems in 37.",
        "Responsible for platform support tickets: root-cause with SQL, route code changes to Engineering, turn recurring Ops/CS pain into shipped change requests (Advanced Filter, cross-org switch, failure alerts).",
      ],
    },
    {
      bullets: [
        "Built core modules of the in-house loan platform (now Ringkas CRM, where developers, banks and agents run mortgage applications) in 300+ commits across a Node.js/GraphQL backend and React frontend: eKYC vendor integration, application status transitions, KPR asset forms, organization and workgroup management, and account security (OTP-verified login-ID change, forced password reset).",
        "Shipped bank contract signing (akad) to production with the team in April 2023, then built its backend on the rebuilt platform in 2024. Ran production data-fix scripts and investigated support bugs on the CRM.",
      ],
    },
    {
      context: "B2B SaaS, invoice automation",
      bullets: [
        "Built VAT invoice extraction models (YOLO, Faster R-CNN, CRNN, VietOCR) through to production.",
        "Shipped a Purchase Order processing service (database, APIs, serverless) with about 75% unit test coverage, handling files of up to 1,000 pages across about 30 partner templates.",
      ],
    },
  ],
  skillLines: [
    {
      label: "Product",
      text: "Delivery & execution · Prioritization · Staged rollouts & reversible bets · Support-led discovery",
    },
    { label: "Technical", text: "SQL · API design review · LLM and AI products · OCR · System architecture" },
    {
      label: "Engineering background",
      text: "Python · TypeScript · Node.js · React · AWS · Serverless · PostgreSQL",
    },
    { label: "Languages", text: personal.languages.join(" · ") },
  ],
  education: personal.education,
};
