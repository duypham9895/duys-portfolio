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
    name: "Where Money Sleeps",
    slug: "where-money-sleeps",
    description:
      "Traces a card payment in Vietnam through card schemes, interbank settlement, and double-entry bank ledgers.",
    status: "Live",
    type: "Financial explainer",
    tags: ["Fintech", "Accounting", "Cloudflare"],
    liveUrl: "https://wheremoneysleeps.duyslab.icu/",
    githubUrl: "https://github.com/duypham9895/where-money-sleeps",
    updatedAt: "2026-11-12",
    accent: "#ebb553",
  },
  {
    name: "PM Bench",
    slug: "pm-assessment-gym",
    description:
      "Timed multiple-choice mock tests and topic drills for PM analytical interviews, with answer breakdowns and weak-spot tracking.",
    status: "Live",
    type: "Product practice",
    tags: ["PM", "Analytics", "React"],
    liveUrl: "https://pmbench.duypham.me",
    githubUrl: "https://github.com/duypham9895/pm-assessment-gym",
    updatedAt: "2026-10-27",
    accent: "#b8541f",
  },
  {
    name: "EVoyage",
    slug: "evoyage",
    description:
      "Plans EV road trips across Vietnam with battery-range math and charging stops along the route.",
    status: "Live",
    type: "Travel tool",
    tags: ["EV", "Maps", "Next.js"],
    liveUrl: "https://evoyage.duypham.me/",
    githubUrl: "https://github.com/duypham9895/evoyage",
    updatedAt: "2026-10-01",
    accent: "#2f9e8f",
  },
  {
    name: "Easel",
    slug: "easel",
    description:
      "A couples app that turns menstrual-cycle tracking into practical daily notes for partners.",
    status: "Building",
    type: "AI companion",
    tags: ["AI", "Wellbeing", "TypeScript"],
    githubUrl: "https://github.com/duypham9895/easel",
    updatedAt: "2026-03-23",
    accent: "#c9567c",
  },
  {
    name: "Split Bill",
    slug: "split-bill",
    description:
      "A client-side group expense splitter built for Vietnamese trips, with VND rounding, VietQR codes, and bilingual UI.",
    status: "Building",
    type: "Finance utility",
    tags: ["Finance", "VietQR", "TypeScript"],
    githubUrl: "https://github.com/duypham9895/split-bill",
    updatedAt: "2026-06-06",
    accent: "#b8923a",
  },
  {
    name: "Đà Lạt Random Picker",
    slug: "dalat-random-picker",
    description:
      "Picks random food stops and places to visit in Đà Lạt, filtered by category and saved in browser storage.",
    status: "Live",
    type: "Local travel tool",
    tags: ["Travel", "Vietnam", "JavaScript"],
    liveUrl: "https://duypham9895.github.io/dalat-random-picker/",
    githubUrl: "https://github.com/duypham9895/dalat-random-picker",
    updatedAt: "2025-10-27",
    accent: "#4c9f70",
  },
];

/** Slugs shown in the home Labs preview, in display order. */
export const featured: readonly string[] = ["where-money-sleeps", "pm-assessment-gym", "evoyage"];

export const featuredLabs: readonly LabProject[] = featured.map((slug) => {
  const lab = labs.find((item) => item.slug === slug);
  if (!lab) throw new Error(`Unknown featured lab: ${slug}`);
  return lab;
});

export const liveLabs = labs.filter((lab) => lab.status === "Live");
export const buildingLabs = labs.filter((lab) => lab.status === "Building");
