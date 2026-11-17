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
  /** Set on the first role of a run of roles at one company: the company line shown above them. */
  readonly group?: { readonly companyName: string; readonly dates: string };
  /** True for every role inside a multi-role company run; its own line then omits the company name. */
  readonly grouped: boolean;
}

export interface ResumeData {
  readonly name: string;
  readonly titleLine: string;
  readonly locationLine: string;
  readonly links: readonly ResumeLink[];
  readonly summary: string;
  readonly roles: readonly ResumeRoleView[];
  readonly skillLines: readonly ResumeSkillLine[];
  readonly education: string;
}

/** Joins the resume-only copy (resume.ts) with the facts (personal.ts, experiences.ts). */
export function transform(): ResumeData {
  if (resume.roles.length !== experiences.length) {
    throw new Error(
      `resume.ts has ${resume.roles.length} roles but experiences.ts has ${experiences.length}`,
    );
  }

  // Roles are newest first, so a company run starts at its newest role and ends at its oldest.
  const sameCompany = (a: number, b: number): boolean =>
    b >= 0 && b < experiences.length && experiences[a].companyName === experiences[b].companyName;

  const roles: ResumeRoleView[] = experiences.map((exp, i) => {
    const grouped = sameCompany(i, i - 1) || sameCompany(i, i + 1);
    let group: ResumeRoleView["group"];
    if (grouped && !sameCompany(i, i - 1)) {
      let last = i;
      while (sameCompany(i, last + 1)) last += 1;
      group = {
        companyName: exp.companyName,
        dates: `${experiences[last].startDate} - ${exp.endDate ?? "Present"}`,
      };
    }
    return {
      jobTitle: exp.jobTitle,
      companyName: exp.companyName,
      dates: `${exp.startDate} - ${exp.endDate ?? "Present"}`,
      scope: resume.roles[i].scope,
      context: resume.roles[i].context,
      bullets: resume.roles[i].bullets,
      group,
      grouped,
    };
  });

  return {
    name: personal.fullName,
    titleLine: resume.titleLine,
    locationLine: resume.locationLine,
    links: resume.links,
    summary: resume.summary,
    roles,
    skillLines: resume.skillLines,
    education: resume.education,
  };
}
