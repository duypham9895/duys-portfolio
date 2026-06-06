import { describe, it, expect } from "vitest";
import { personal } from "../../src/data/personal";
import { experiences } from "../../src/data/experiences";
import { skillGroups } from "../../src/data/skills";
import { certifications } from "../../src/data/certifications";
import { labs } from "../../src/data/labs";

describe("personal data", () => {
  it("has correct name", () => {
    expect(personal.fullName).toBe("Duy Pham");
  });

  it("has correct title", () => {
    expect(personal.title).toBe("Associate Product Manager");
  });

  it("has bio with 2 paragraphs covering both companies", () => {
    expect(personal.bio).toHaveLength(2);
    expect(personal.bio[0]).toContain("Product Manager");
    const fullBio = personal.bio.join(" ");
    expect(fullBio).toContain("Ringkas");
    expect(fullBio).toContain("Bizzi");
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
  it("has 5 skill groups", () => {
    expect(skillGroups).toHaveLength(5);
  });

  it("Product Management is first group", () => {
    expect(skillGroups[0].category).toBe("Product Management");
  });

  it("each group has at least 2 skills", () => {
    skillGroups.forEach((group) => {
      expect(group.skills.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("has primary skills marked", () => {
    const allSkills = skillGroups.flatMap((g) => g.skills);
    const primaries = allSkills.filter((s) => s.primary);
    expect(primaries.length).toBeGreaterThan(0);
  });

  it("skills with icons have valid paths", () => {
    const allSkills = skillGroups.flatMap((g) => g.skills);
    allSkills.filter((s) => s.icon).forEach((skill) => {
      expect(skill.icon).toMatch(/^\/icons\/.+\.svg$/);
    });
  });
});

describe("certifications data", () => {
  it("has 7 certifications", () => {
    expect(certifications).toHaveLength(7);
  });

  it("each cert has required fields", () => {
    certifications.forEach((cert) => {
      expect(cert.name.length).toBeGreaterThan(0);
      expect(cert.organization.length).toBeGreaterThan(0);
      expect(cert.date).toMatch(/\w+ \d{4}/);
      expect(cert.credentialUrl).toMatch(/^https:\/\//);
    });
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
});
