import { personal } from "../../src/data/personal";
import { experiences } from "../../src/data/experiences";
import { skillGroups } from "../../src/data/skills";
import { certifications } from "../../src/data/certifications";

export interface ResumeLink {
  readonly label: string;
  readonly url: string;
}

export interface ResumeHighlight {
  readonly metric: string;
  readonly label: string;
}

export interface ResumeExperience {
  readonly title: string;
  readonly company: string;
  readonly dates: string;
  readonly bullets: readonly string[];
}

export interface ResumeSkillGroup {
  readonly category: string;
  readonly skills: readonly string[];
}

export interface ResumeCertification {
  readonly name: string;
  readonly org: string;
  readonly year: string;
}

export interface ResumeProduct {
  readonly name: string;
  readonly description: string;
  readonly scope: string;
}

export interface ResumeData {
  readonly name: string;
  readonly title: string;
  readonly summary: string;
  readonly contact: {
    readonly email: string;
    readonly phone: string;
    readonly location: string;
  };
  readonly links: readonly ResumeLink[];
  readonly highlights: readonly ResumeHighlight[];
  readonly experience: readonly ResumeExperience[];
  readonly products: readonly ResumeProduct[];
  readonly skillGroups: readonly ResumeSkillGroup[];
  readonly certifications: readonly ResumeCertification[];
}

function extractYear(dateStr: string): string {
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : dateStr;
}

function sortPrimariesFirst(
  skills: readonly { title: string; primary?: boolean }[]
): string[] {
  const primaries = skills.filter((s) => s.primary).map((s) => s.title);
  const others = skills.filter((s) => !s.primary).map((s) => s.title);
  return [...primaries, ...others];
}

/**
 * Resume-specific experience bullets, rewritten for PM impact framing.
 * The website data (experiences.ts) uses general descriptions.
 * The resume needs: action verb + scope + scale + outcome.
 */
const RESUME_BULLETS: Record<string, readonly string[]> = {
  "Ringkas (PT Ringkas Asia Technology)": [
    "Own end-to-end loan origination platform serving multiple banking partners across Southeast Asian markets",
    "Drive product strategy for AI-powered document processing and conversational AI platform, reducing manual lending operations",
    "Built and manage central configuration hub governing feature flags and rollout controls across all products and markets",
    "Author PRDs, define API contracts, and align cross-border architecture decisions between Vietnam and Indonesia engineering teams",
    "Transitioned from Software Engineer to Product Manager through demonstrated product ownership and cross-functional leadership",
  ],
  "Bizzi Vietnam": [
    "Led development of AI-powered invoice extraction pipeline, reducing manual data entry for major enterprise clients",
    "Designed and shipped PO email processing service end-to-end, from database schema to production deployment",
    "Delivered Oracle and SAP enterprise integrations, enabling automated data exchange across multiple retail chains",
  ],
};

const RESUME_SUMMARY =
  "Software Engineer turned Product Manager with 5+ years in fintech and AI. " +
  "Own three platform products at Ringkas spanning loan origination, AI document processing, " +
  "and configuration management, coordinating engineering teams across Vietnam and Indonesia.";

const PRODUCTS: readonly ResumeProduct[] = [
  {
    name: "LOS Core",
    description:
      "Loan origination platform powering end-to-end mortgage workflows for multiple banking partners across Southeast Asian markets",
    scope: "Multi-market",
  },
  {
    name: "RISA",
    description:
      "AI-powered platform combining document processing, data extraction, and conversational AI to automate lending operations",
    scope: "AI / ML",
  },
  {
    name: "Tarvos",
    description:
      "Central configuration hub managing feature flags, system configs, and rollout controls across all products and markets",
    scope: "Cross-platform",
  },
];

const HIGHLIGHTS: readonly ResumeHighlight[] = [
  { metric: "3", label: "Products Owned" },
  { metric: "SE→PM", label: "Career Growth" },
  { metric: "2", label: "Markets" },
  { metric: "5+", label: "Years Experience" },
];

export function transform(): ResumeData {
  const experience: ResumeExperience[] = experiences.map((exp) => ({
    title: exp.jobTitle,
    company: exp.companyName,
    dates: `${exp.startDate} — ${exp.endDate ?? "Present"}`,
    bullets: RESUME_BULLETS[exp.companyName] ?? exp.description,
  }));

  const resumeSkillGroups: ResumeSkillGroup[] = skillGroups.map((group) => ({
    category: group.category,
    skills: sortPrimariesFirst(group.skills),
  }));

  const sortedCerts = [...certifications].sort((a, b) => {
    const yearA = parseInt(extractYear(a.date), 10);
    const yearB = parseInt(extractYear(b.date), 10);
    return yearB - yearA;
  });

  const resumeCerts: ResumeCertification[] = sortedCerts.map((cert) => ({
    name: cert.name,
    org: cert.organization,
    year: extractYear(cert.date),
  }));

  const links: ResumeLink[] = [
    { label: "Website", url: "https://www.duypham.me" },
    ...personal.socials
      .filter((s) => s.title === "LinkedIn" || s.title === "GitHub")
      .map((s) => ({ label: s.title, url: s.url })),
  ];

  return {
    name: personal.fullName,
    title: personal.title,
    summary: RESUME_SUMMARY,
    contact: {
      email: personal.contact.email,
      phone: personal.contact.phone,
      location: personal.contact.location,
    },
    links,
    highlights: HIGHLIGHTS,
    experience,
    products: PRODUCTS,
    skillGroups: resumeSkillGroups,
    certifications: resumeCerts,
  };
}
