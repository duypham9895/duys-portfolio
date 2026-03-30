import { describe, it, expect } from "vitest";
import { personal } from "../../src/data/personal";
import { experiences } from "../../src/data/experiences";
import { skillGroups } from "../../src/data/skills";
import { certifications } from "../../src/data/certifications";

describe("personal data", () => {
  it("has correct name", () => {
    expect(personal.fullName).toBe("Duy Pham");
  });

  it("has correct title", () => {
    expect(personal.title).toBe("Associate Product Manager");
  });

  it("has bio with 2 paragraphs", () => {
    expect(personal.bio).toHaveLength(2);
    expect(personal.bio[0]).toContain("Product Manager");
    expect(personal.bio[1]).toContain("Ringkas");
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
  it("has 2 experiences", () => {
    expect(experiences).toHaveLength(2);
  });

  it("Ringkas is first (current role)", () => {
    expect(experiences[0].companyName).toContain("Ringkas");
    expect(experiences[0].endDate).toBeNull();
    expect(experiences[0].jobTitle).toBe("Associate Product Manager");
  });

  it("Bizzi is second (past role)", () => {
    expect(experiences[1].companyName).toContain("Bizzi");
    expect(experiences[1].endDate).toBe("Aug 2022");
    expect(experiences[1].jobTitle).toBe("Software Engineer");
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
  it("has 4 skill groups", () => {
    expect(skillGroups).toHaveLength(4);
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
  it("has 4 certifications", () => {
    expect(certifications).toHaveLength(4);
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
