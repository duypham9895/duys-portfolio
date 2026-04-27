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

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

const HIGHLIGHTS: readonly ResumeHighlight[] = [
  { metric: "1", label: "First-of-Kind Launch" },
  { metric: "SE→PM", label: "Career Growth" },
  { metric: "5+", label: "Years Experience" },
];

export function transform(): ResumeData {
  const experience: ResumeExperience[] = experiences.map((exp) => ({
    title: exp.jobTitle,
    company: exp.companyName,
    dates: `${exp.startDate} — ${exp.endDate ?? "Present"}`,
    bullets: exp.description,
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
    summary: stripMarkdownBold(personal.bio[0]),
    contact: {
      email: personal.contact.email,
      phone: personal.contact.phone,
      location: personal.contact.location,
    },
    links,
    highlights: HIGHLIGHTS,
    experience,
    skillGroups: resumeSkillGroups,
    certifications: resumeCerts,
  };
}
