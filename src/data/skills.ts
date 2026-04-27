export interface Skill {
  readonly title: string;
  readonly icon?: string;
  readonly primary?: boolean;
}

export interface SkillGroup {
  readonly category: string;
  readonly skills: readonly Skill[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    category: "Product Management",
    skills: [
      { title: "PRD Writing", primary: true },
      { title: "API Design Review", primary: true },
      { title: "SQL for Analytics", primary: true },
      { title: "Cross-functional Launch Coordination" },
      { title: "Stakeholder Management" },
      { title: "Compliance & Risk Coordination" },
    ],
  },
  {
    category: "Technical",
    skills: [
      { title: "System Architecture" },
      { title: "AI / ML Products", primary: true },
      { title: "LLM / Chatbot" },
      { title: "Source Code Investigation" },
    ],
  },
  {
    category: "Tools & Workflow",
    skills: [
      { title: "Notion", primary: true },
      { title: "Figma" },
      { title: "Postman" },
      { title: "Claude Code (CLI)", primary: true },
      { title: "GitLab" },
      { title: "GitHub" },
    ],
  },
  {
    category: "Languages & Frameworks",
    skills: [
      { title: "TypeScript", icon: "/icons/typescript.svg", primary: true },
      { title: "JavaScript", icon: "/icons/javascript.svg" },
      { title: "Python", icon: "/icons/python.svg", primary: true },
      { title: "React", icon: "/icons/react.svg" },
      { title: "Node.js", icon: "/icons/nodejs.svg" },
      { title: "Golang", icon: "/icons/golang.svg" },
    ],
  },
  {
    category: "Infrastructure & Data",
    skills: [
      { title: "AWS", icon: "/icons/aws.svg", primary: true },
      { title: "PostgreSQL", icon: "/icons/postgresql.svg" },
      { title: "GraphQL", icon: "/icons/graphql.svg" },
      { title: "Serverless", icon: "/icons/serverless.svg" },
      { title: "Git", icon: "/icons/git.svg" },
    ],
  },
] as const;
