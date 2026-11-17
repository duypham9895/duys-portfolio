import { personal } from "./personal";

/**
 * Single-page ATS-optimized resume copy, strictly synchronized with personal.ts,
 * experiences.ts, skills.ts, and certifications.ts.
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
  titleLine: "Associate Product Manager · Platform, APIs & AI (Ex-Software Engineer)",
  locationLine:
    "Ho Chi Minh City, Vietnam · Hybrid, Remote, or International Relocation (Visa Sponsorship)",
  links: [
    { label: "hello@duypham.me", href: "mailto:hello@duypham.me" },
    { label: "+84 963 769 049", href: "tel:+84963769049" },
    { label: "linkedin.com/in/phamanhduy", href: "https://www.linkedin.com/in/phamanhduy" },
    { label: "duypham.me", href: "https://www.duypham.me/cv" },
    { label: "github.com/duypham9895", href: "https://github.com/duypham9895" },
  ],
  summary:
    "Product Manager with nearly 4 years at Ringkas: engineer first, PM since Aug 2024. Ships B2B Generative AI agents, partner APIs, and digital mortgage lending products from PRD and user stories to production. Lifted OCR success from ~40% to ~89% without a new vendor. Targeting Technical Product Manager roles.",
  roles: [
    {
      scope:
        "Moved from SWE to PM. Own platform & AI features end to end (PRD, user stories, acceptance criteria, prototyping, delivery, UAT) with Design, Engineering, QA, and Data; report to the Head of Product.",
      bullets: [
        "Owned Pillar Portal requirements (PRD to production) for a B2B Generative AI agent platform with prompt governance; powers enterprise tenders and a chat-widget SDK rolling out to a first client.",
        "Traced OCR failures alongside second-vendor work; fixed auth and image-resize bugs with Engineering (~40% to ~89% success, avoiding a vendor) and benchmarked a VLM OCR PoC (−87% cost, +74% latency).",
        "Delivery PM from mid-project for Ringkas AI Financial Assistant (on-time release); wrote 3-phase rollout specs with feature flags, spend caps, and tiered limits to cap LLM cost and drive sign-ups.",
        "Co-owned API integration specs (payload reference, changelog) with Head of Product for a Saudi bank CRM integration; tested live APIs, fixed spec-vs-live payload gaps, filed a pagination bug, and ran UAT response.",
        "Wrote the document-resubmission PRD for Saudi lenders, authored CRM demo test scenarios for a Saudi developer, and audited QA's User Acceptance Testing (UAT) suite before partner sign-off.",
        "Shipped borrower PII masking before lender submission, mandatory booking-letter date validation across CRM/app/APIs, and tenant login-ID admin controls; led an e-wallet security & compliance response.",
        "Owned support triage & support-led discovery: root-caused defects via SQL analytics, prioritized backlog fixes, and shipped PRDs for recurring Ops/CS pain (Advanced Filter, multi-org switch, KYC/bank alerts).",
      ],
    },
    {
      bullets: [
        "Rebuilt the bank decision page and fixed contract-signing (akad) bugs before the April 2023 release. Built the akad confirmation API in 2024.",
        "Built core modules of the new platform, now Ringkas CRM (Node.js/GraphQL, React): the bank submission form and an async eKYC pipeline that starts the credit check automatically.",
        "Challenged PRDs with PM and Design; covered the Data Analyst gap and took over the data-lake ETL.",
      ],
    },
    {
      context: "B2B SaaS · FinTech & Invoice Automation",
      bullets: [
        "Translated enterprise retail requirements into SAP & Oracle integration specs, maintained API contracts, and shipped a serverless Purchase Order service (~75% test coverage, ~30 partner templates).",
        "Trained and deployed production Computer Vision / Deep Learning OCR models for VAT invoice extraction (YOLO, Faster R-CNN, CRNN, VietOCR).",
      ],
    },
  ],
  skillLines: [
    {
      label: "Product",
      text: "PRD Writing, User Stories, Acceptance Criteria, Backlog Prioritization, UAT, Stakeholders, Figma",
    },
    {
      label: "Technical & AI",
      text: "API Specs & Integration, GraphQL, SQL Analytics, GenAI (LLM, Agents, Prompts), OCR, Postman, Notion",
    },
    {
      label: "Domain & Stack",
      text: "Fintech, Digital Lending, eKYC, B2B SaaS, SAP/Oracle, Python, TypeScript, Node.js, React, PostgreSQL, AWS",
    },
    {
      label: "Languages & Certs",
      text: "Vietnamese (Native), English (Professional) · Coursera Product Management, Anthropic Claude 101",
    },
  ],
  education: personal.education,
};
