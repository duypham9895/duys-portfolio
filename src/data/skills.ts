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
      { title: "Cross-team Coordination" },
      { title: "Stakeholder Management" },
      { title: "Agile / Scrum" },
    ],
  },
  {
    category: "Technical",
    skills: [
      { title: "System Architecture" },
      { title: "Microservices" },
      { title: "AI / ML Products", primary: true },
      { title: "LLM / Chatbot" },
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
