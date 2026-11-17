export interface Skill {
  readonly title: string;
  readonly primary?: boolean;
  /** One-line evidence shown under a primary product skill. */
  readonly story?: string;
}

export interface SkillSubgroup {
  readonly heading: string;
  readonly skills: readonly Skill[];
}

export interface SkillGroup {
  readonly category: string;
  readonly skills: readonly Skill[];
  readonly subgroups?: readonly SkillSubgroup[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    category: "Product",
    skills: [
      {
        title: "End-to-end delivery & execution",
        primary: true,
        story: "PRD, user stories, acceptance criteria, and UAT sign-off across Engineering, Design, QA, and Data.",
      },
      {
        title: "Backlog prioritization & cost trade-offs",
        primary: true,
        story: "Root-cause OCR fix avoided a second vendor; tiered LLM quotas capped anonymous spend; VLM PoC deprioritized after a strategy shift.",
      },
      {
        title: "Staged rollouts & feature flags",
        primary: true,
        story: "3-phase AI assistant release behind spend caps and admin feature flags so every widening step stayed reversible.",
      },
      {
        title: "Support-led discovery",
        primary: true,
        story:
          "Triage production tickets with SQL, isolate root causes for Engineering, and turn recurring Ops/CS bottlenecks into PRDs.",
      },
    ],
    subgroups: [
      {
        heading: "Also",
        skills: [
          { title: "PRD Writing" },
          { title: "User Stories & Acceptance Criteria" },
          { title: "Workflow Prototyping" },
          { title: "UAT Governance" },
          { title: "Stakeholder Management" },
          { title: "Compliance & Risk Coordination" },
        ],
      },
    ],
  },
  {
    category: "Technical depth",
    skills: [
      { title: "Generative AI & LLM Agents", primary: true },
      { title: "API Specs & System Integration", primary: true },
      { title: "SQL for Analytics", primary: true },
      { title: "OCR & Computer Vision" },
      { title: "Digital Lending & eKYC" },
      { title: "System Architecture" },
      { title: "Source Code Investigation" },
      { title: "Data Privacy & PII Controls" },
    ],
    subgroups: [
      {
        heading: "Tools",
        skills: [{ title: "Figma" }, { title: "Postman" }, { title: "Notion" }, { title: "Claude Code" }],
      },
    ],
  },
  {
    category: "Engineering background",
    skills: [
      { title: "TypeScript" },
      { title: "JavaScript" },
      { title: "Python" },
      { title: "React" },
      { title: "Node.js" },
      { title: "AWS" },
      { title: "PostgreSQL" },
      { title: "Serverless" },
      { title: "SAP & Oracle Integration" },
      { title: "Git" },
    ],
  },
] as const;
