export type LabStatus = "Live" | "Building" | "Paused" | "Archived";

export interface LabProject {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly status: LabStatus;
  readonly type: string;
  readonly tags: readonly string[];
  readonly liveUrl?: string;
  readonly githubUrl: string;
  readonly updatedAt: string;
  readonly accent: string;
}

export const labs: readonly LabProject[] = [
  {
    name: "EVoyage",
    slug: "evoyage",
    description:
      "Plan EV road trips with range calculations, charger-aware stops, and a route flow tuned for Vietnamese travel.",
    status: "Live",
    type: "Travel tool",
    tags: ["EV", "Maps", "Next.js"],
    liveUrl: "https://evoyage.duypham.me/",
    githubUrl: "https://github.com/duypham9895/evoyage",
    updatedAt: "2026-06-06",
    accent: "#2f9e8f",
  },
  {
    name: "PM Assessment Gym",
    slug: "pm-assessment-gym",
    description:
      "Practice analytical product-management cases with mock prompts, answer structure, and focused scoring rubrics.",
    status: "Live",
    type: "Product practice",
    tags: ["PM", "Analytics", "React"],
    liveUrl: "https://pmbench.duypham.me",
    githubUrl: "https://github.com/duypham9895/pm-assessment-gym",
    updatedAt: "2026-06-06",
    accent: "#b8541f",
  },
  {
    name: "Easel",
    slug: "easel",
    description:
      "A couples wellbeing app concept that turns cycle tracking into phase-aware guidance and timely support signals.",
    status: "Live",
    type: "AI companion",
    tags: ["AI", "Wellbeing", "TypeScript"],
    liveUrl: "https://duypham9895.github.io/easel/",
    githubUrl: "https://github.com/duypham9895/easel",
    updatedAt: "2026-03-23",
    accent: "#c9567c",
  },
  {
    name: "Split Bill",
    slug: "split-bill",
    description:
      "A no-backend trip expense splitter for Vietnamese groups, with VND-first flows, VietQR support, and bilingual UI.",
    status: "Building",
    type: "Finance utility",
    tags: ["Finance", "VietQR", "TypeScript"],
    githubUrl: "https://github.com/duypham9895/split-bill",
    updatedAt: "2026-06-01",
    accent: "#b8923a",
  },
  {
    name: "Foray",
    slug: "foray",
    description:
      "A campaign room for job hunting: capture applications, ingest recruiter emails, classify movement, and decide the next action.",
    status: "Building",
    type: "Job search tool",
    tags: ["Careers", "Gmail", "TypeScript"],
    githubUrl: "https://github.com/duypham9895/foray",
    updatedAt: "2026-05-12",
    accent: "#6f67d8",
  },
  {
    name: "Đà Lạt Random Picker",
    slug: "dalat-random-picker",
    description:
      "A lightweight picker for food and travel ideas in Đà Lạt, with categories, local storage, and mobile-friendly interactions.",
    status: "Live",
    type: "Local travel tool",
    tags: ["Travel", "Vietnam", "JavaScript"],
    liveUrl: "https://duypham9895.github.io/dalat-random-picker/",
    githubUrl: "https://github.com/duypham9895/dalat-random-picker",
    updatedAt: "2025-10-27",
    accent: "#4c9f70",
  },
];

export const liveLabs = labs.filter((lab) => lab.status === "Live");
export const buildingLabs = labs.filter((lab) => lab.status === "Building");
