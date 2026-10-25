import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { personal } from "../../src/data/personal";
import { experiences } from "../../src/data/experiences";
import { skillGroups } from "../../src/data/skills";
import { certifications } from "../../src/data/certifications";
import { labs, featured, featuredLabs } from "../../src/data/labs";
import { caseStudies } from "../../src/data/caseStudies";
import { resume } from "../../src/data/resume";

describe("personal data", () => {
  it("has correct name", () => {
    expect(personal.fullName).toBe("Duy Pham");
  });

  it("has correct title", () => {
    expect(personal.title).toBe("Associate Product Manager");
  });

  it("has a positioning line aimed at Technical PM roles", () => {
    expect(personal.positioning).toContain("Technical Product Manager");
    expect(personal.positioning).toContain("Indonesian mortgage (KPR) fintech");
  });

  // INPUTS #5–7, hardcoded here on purpose (INPUTS.md is not committed).
  it("has location, languages and education exactly as approved", () => {
    expect(personal.location).toBe(
      "Based in Ho Chi Minh City · Hybrid preferred · Open to relocation with company support",
    );
    expect(personal.languages.join(" · ")).toBe("Vietnamese (Native) · English (Professional working)");
    expect(personal.education).toBe("Ton Duc Thang University · Software Engineering · Degree not completed");
  });

  it("has an About opener and 3 how-I-work lines", () => {
    expect(personal.about.opener.length).toBeGreaterThan(20);
    expect(personal.about.howIWork).toHaveLength(3);
    personal.about.howIWork.forEach((line) => {
      expect(line.title.length).toBeGreaterThan(0);
      expect(line.body.length).toBeGreaterThan(20);
    });
  });

  it("has contact info", () => {
    expect(personal.contact.email).toContain("@gmail.com");
    expect(personal.contact.phone).toMatch(/^\+84/);
    expect(personal.contact.location).toContain("Ho Chi Minh");
  });

  it("has 4 social links", () => {
    expect(personal.socials).toHaveLength(4);
    const titles = personal.socials.map((s) => s.title);
    expect(titles).toContain("LinkedIn");
    expect(titles).toContain("GitHub");
    expect(titles).toContain("Telegram");
    expect(titles).toContain("Zalo");
  });

  it("social URLs are valid", () => {
    personal.socials.forEach((social) => {
      expect(social.url).toMatch(/^https:\/\//);
    });
  });

  it("points to the single resume PDF", () => {
    expect(personal.resumeUrl).toBe("/resume.pdf");
  });
});

describe("experiences data", () => {
  it("has 3 experiences", () => {
    expect(experiences).toHaveLength(3);
  });

  it("exactly one current role (endDate null)", () => {
    const current = experiences.filter((exp) => exp.endDate === null);
    expect(current).toHaveLength(1);
    expect(current[0].companyName).toContain("Ringkas");
    expect(current[0].jobTitle).toBe("Associate Product Manager");
  });

  it("APM Ringkas is first (current role)", () => {
    expect(experiences[0].companyName).toContain("Ringkas");
    expect(experiences[0].endDate).toBeNull();
    expect(experiences[0].jobTitle).toBe("Associate Product Manager");
  });

  it("SWE Ringkas is second (prior internal role)", () => {
    expect(experiences[1].companyName).toContain("Ringkas");
    expect(experiences[1].endDate).toBe("Jul 2024");
    expect(experiences[1].jobTitle).toBe("Software Engineer");
  });

  it("Bizzi is third (earliest role)", () => {
    expect(experiences[2].companyName).toContain("Bizzi");
    expect(experiences[2].endDate).toBe("Aug 2022");
    expect(experiences[2].jobTitle).toBe("Software Engineer");
  });

  it("every role has a short company name", () => {
    expect(experiences.map((exp) => exp.shortCompany)).toEqual(["Ringkas", "Ringkas", "Bizzi Vietnam"]);
  });

  it("domain is set for APM and Bizzi only", () => {
    expect(experiences[0].domain).toBe("Indonesian mortgage (KPR) fintech");
    expect(experiences[1].domain).toBeUndefined();
    expect(experiences[2].domain).toBe("B2B SaaS / invoice automation");
  });

  it("APM role has scope and the same-team tag", () => {
    expect(experiences[0].scope).toContain("Report to the Head of Product");
    expect(experiences[0].tag).toBe("Same team, new role");
  });

  it("each experience has description bullets", () => {
    experiences.forEach((exp) => {
      expect(exp.description.length).toBeGreaterThan(0);
      exp.description.forEach((bullet) => {
        expect(bullet.length).toBeGreaterThan(10);
      });
    });
  });

  it("each experience has a valid company URL", () => {
    experiences.forEach((exp) => {
      expect(exp.companyUrl).toMatch(/^https:\/\//);
    });
  });
});

describe("skills data", () => {
  it("has 3 skill groups with Product first", () => {
    expect(skillGroups.map((g) => g.category)).toEqual(["Product", "Technical depth", "Engineering background"]);
  });

  it("Product leads with 4 primary skills, each with a story line", () => {
    const product = skillGroups[0];
    expect(product.skills).toHaveLength(4);
    product.skills.forEach((skill) => {
      expect(skill.primary).toBe(true);
      expect(skill.story?.length ?? 0).toBeGreaterThan(10);
    });
    expect(product.skills.map((s) => s.title)).toContain("Support-led discovery");
    expect(product.subgroups?.[0].skills.map((s) => s.title)).toEqual([
      "PRD Writing",
      "Stakeholder Management",
      "Compliance & Risk Coordination",
    ]);
  });

  it("Technical depth has a Tools subhead", () => {
    const tools = skillGroups[1].subgroups?.find((sub) => sub.heading === "Tools");
    expect(tools?.skills.map((s) => s.title)).toEqual(["Figma", "Postman", "Notion", "Claude Code"]);
  });

  it("drops GitLab, GitHub, Golang and GraphQL", () => {
    const titles = skillGroups.flatMap((g) => [...g.skills, ...(g.subgroups ?? []).flatMap((s) => s.skills)]).map(
      (s) => s.title,
    );
    ["GitLab", "GitHub", "Golang", "GraphQL"].forEach((dropped) => expect(titles).not.toContain(dropped));
  });
});

describe("case studies data", () => {
  it("has 2 case studies: OCR then Pillar", () => {
    expect(caseStudies).toHaveLength(2);
    expect(caseStudies[0].kicker).toContain("OCR");
    expect(caseStudies[1].kicker).toContain("Pillar");
  });

  it("case 02 (Pillar, version B) shows the decision with its options", () => {
    const pillar = caseStudies[1];
    expect(pillar.title).toBe("Why partners can't rewrite the AI agents they run");
    const options = pillar.rows.find((r) => r.label === "Options")?.options ?? [];
    expect(options).toHaveLength(2);
    expect(options.find((o) => o.chosen)?.key).toBe("2");
    const decision = pillar.rows.find((r) => r.label === "Decision")?.paragraphs.join(" ") ?? "";
    expect(decision).toContain("I recommended option 2");
    expect(decision).toContain("in return");
    expect(decision).toContain("Ringkas's review");
    expect(decision).toContain("planned, not yet built");
    const outcome = pillar.rows.find((r) => r.label === "Outcome")?.paragraphs.join(" ") ?? "";
    expect(outcome).toContain("uses it in enterprise tenders");
    const all = pillar.rows.flatMap((r) => [...r.paragraphs, ...(r.options ?? []).map((o) => o.text)]).join(" ");
    expect(all).not.toContain("bids");
  });
});

describe("certifications data", () => {
  it("has 7 certifications", () => {
    expect(certifications).toHaveLength(7);
  });

  it("each cert has required fields", () => {
    certifications.forEach((cert) => {
      expect(cert.name.length).toBeGreaterThan(0);
      expect(cert.shortName.length).toBeGreaterThan(0);
      expect(cert.organization.length).toBeGreaterThan(0);
      expect(cert.date).toMatch(/\w+ \d{4}/);
      expect(cert.credentialUrl).toMatch(/^https:\/\//);
    });
  });

  it("uses short names for aria-labels", () => {
    expect(certifications.find((c) => c.name.includes("Claude 101"))?.shortName).toBe("Claude 101");
  });

  it("no Basic-level certs remain", () => {
    certifications.forEach((cert) => {
      expect(cert.name).not.toMatch(/\(Basic\)/);
    });
  });
});

describe("labs data", () => {
  it("has a useful starter catalog", () => {
    expect(labs.length).toBeGreaterThanOrEqual(4);
  });

  it("has unique slugs", () => {
    const slugs = labs.map((lab) => lab.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has at least one live project", () => {
    expect(labs.some((lab) => lab.status === "Live")).toBe(true);
  });

  it("uses valid project links when provided", () => {
    labs.forEach((lab) => {
      if (lab.liveUrl) expect(lab.liveUrl).toMatch(/^https:\/\//);
      if (lab.githubUrl) expect(lab.githubUrl).toMatch(/^https:\/\//);
      expect(lab.tags.length).toBeGreaterThan(0);
      expect(lab.description.length).toBeGreaterThan(20);
    });
  });

  it("describes Easel as menstrual-cycle tracking", () => {
    expect(labs.find((lab) => lab.slug === "easel")?.description).toContain("menstrual-cycle");
  });

  it("features 3 valid slugs in order", () => {
    expect(featured).toEqual(["split-bill", "pm-assessment-gym", "evoyage"]);
    expect(featuredLabs.map((lab) => lab.slug)).toEqual(featured);
  });
});

describe("resume copy", () => {
  const fixture = readFileSync(resolve(__dirname, "../fixtures/resume-body.txt"), "utf8");

  it("has one copy block per role", () => {
    expect(resume.roles).toHaveLength(experiences.length);
  });

  it("every resume line appears verbatim in the approved resume text", () => {
    const lines = [
      resume.titleLine,
      resume.locationLine,
      resume.summary,
      ...resume.links.map((link) => link.label),
      ...resume.roles.flatMap((role) => [
        ...(role.scope ? [`Scope: ${role.scope}`] : []),
        ...(role.context ? [role.context] : []),
        ...role.bullets,
      ]),
      ...resume.skillLines.map((line) => `${line.label}: ${line.text}`),
      resume.certifications.join(" · "),
      resume.education,
    ];
    lines.forEach((line) => expect(fixture).toContain(line));
  });
});
