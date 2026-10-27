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
  readonly certifications: readonly string[];
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
    "Product manager with 5+ years in software, 3.5 as a software engineer. Drives platform features from PRD to delivery at Ringkas, an Indonesian mortgage (KPR) fintech, including Pillar, a B2B AI-agent platform in production. Lifted OCR success from about 40% to 89% by fixing the causes, not adding a vendor.",
  roles: [
    {
      scope:
        "drive features across the Ringkas platform end to end, from PRD through engineering delivery and technical QA. Work directly with Design, QA, Engineering and Data; report to the Head of Product.",
      bullets: [
        "Owned Pillar Portal requirements, PRD to production, for a B2B AI-agent platform used in demos and enterprise tenders. Its chat-widget SDK is rolling out to a first enterprise client.",
        "Traced OCR failures before adding a second vendor: with Engineering, fixed an auth error and image resizing in frontend and backend, lifting OCR success from about 40% to 89%; existing vendor kept.",
        "Built a vision-language model (VLM) OCR proof of concept with the AI team: benchmarked 87% lower cost against 74% higher latency; not taken to production after a company strategy shift.",
        "Delivery PM for the Ringkas AI Financial Assistant, released on time; wrote its three-phase rollout behind cost gates and feature flags. Testing and evaluation owned by Indonesia-based PMs.",
        "Capped anonymous assistant usage (daily and global limits), trading open access for capped cost.",
        "Coordinated a major Indonesian e-wallet partner's security questionnaire with Engineering, AI and Compliance.",
        "Responsible for platform support tickets: root-cause with SQL, route code changes to Engineering, turn recurring Ops/CS pain into shipped change requests (Advanced Filter, cross-org switch, failure alerts).",
      ],
    },
    {
      bullets: [
        "Built features across the stack in the in-house rebuild of the loan platform (now Ringkas CRM).",
        "Challenged PRDs and proposed alternatives with PM and Design before build.",
        "Tracked in-house and outsourced teams during the handover, raising blockers and timeline risk to leadership; kept Ops/CS report data accurate until a data analyst joined.",
      ],
    },
    {
      context: "B2B SaaS, invoice automation",
      bullets: [
        "Built VAT invoice extraction models (YOLO, Faster R-CNN, CRNN, VietOCR) through to production.",
        "Shipped a Purchase Order processing service (database, APIs, serverless) with about 75% unit test coverage, handling files of up to 1,000 pages across about 30 partner templates.",
        "Translated enterprise retail clients' requirements into Oracle and SAP integration designs and maintained their API contracts.",
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
  certifications: [
    "Product Management: Foundations & Stakeholder Collaboration (Coursera, Apr 2026)",
    "Claude 101 (Anthropic, Mar 2026)",
    "Product Management: An Introduction (Coursera, Mar 2025)",
  ],
  education: personal.education,
};
