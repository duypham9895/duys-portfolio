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
        title: "Delivery & execution",
        primary: true,
        story: "PRD to production across Engineering, Design, QA and Data.",
      },
      {
        title: "Prioritization (cost/benefit trade-offs)",
        primary: true,
        story: "OCR fix over a vendor switch; VLM deprioritised; anonymous usage caps.",
      },
      {
        title: "Staged rollouts & time-boxed bets",
        primary: true,
        story: "3-phase rollout behind feature flags; a 2-week time-box with a stop rule.",
      },
      {
        title: "Support-led discovery",
        primary: true,
        story:
          "Point of contact for platform support tickets: triage → route code changes to Engineering → recurring pain into PRDs.",
      },
    ],
    subgroups: [
      {
        heading: "Also",
        skills: [
          { title: "PRD Writing" },
          { title: "Stakeholder Management" },
          { title: "Compliance & Risk Coordination" },
        ],
      },
    ],
  },
  {
    category: "Technical depth",
    skills: [
      { title: "AI / ML Products", primary: true },
      { title: "API Design Review", primary: true },
      { title: "SQL for Analytics", primary: true },
      { title: "LLM / Chatbot" },
      { title: "System Architecture" },
      { title: "Source Code Investigation" },
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
      { title: "Git" },
    ],
  },
] as const;
