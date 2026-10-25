import { personal } from "../../src/data/personal";
import { experiences } from "../../src/data/experiences";
import { resume, type ResumeLink, type ResumeSkillLine } from "../../src/data/resume";

export interface ResumeRoleView {
  readonly jobTitle: string;
  readonly companyName: string;
  /** "Aug 2024 - Present" */
  readonly dates: string;
  readonly scope?: string;
  readonly context?: string;
  readonly bullets: readonly string[];
}

export interface ResumeData {
  readonly name: string;
  readonly titleLine: string;
  readonly locationLine: string;
  readonly links: readonly ResumeLink[];
  readonly summary: string;
  readonly roles: readonly ResumeRoleView[];
  readonly skillLines: readonly ResumeSkillLine[];
  readonly certifications: readonly string[];
  readonly education: string;
}

/** Joins the resume-only copy (resume.ts) with the facts (personal.ts, experiences.ts). */
export function transform(): ResumeData {
  if (resume.roles.length !== experiences.length) {
    throw new Error(
      `resume.ts has ${resume.roles.length} roles but experiences.ts has ${experiences.length}`,
    );
  }

  const roles: ResumeRoleView[] = experiences.map((exp, i) => ({
    jobTitle: exp.jobTitle,
    companyName: exp.companyName,
    dates: `${exp.startDate} - ${exp.endDate ?? "Present"}`,
    scope: resume.roles[i].scope,
    context: resume.roles[i].context,
    bullets: resume.roles[i].bullets,
  }));

  return {
    name: personal.fullName,
    titleLine: resume.titleLine,
    locationLine: resume.locationLine,
    links: resume.links,
    summary: resume.summary,
    roles,
    skillLines: resume.skillLines,
    certifications: resume.certifications,
    education: resume.education,
  };
}
