import { describe, expect, it } from "vitest";
import { personal } from "../../src/data/personal";
import { resume } from "../../src/data/resume";

describe("contact email consistency", () => {
  it("keeps website contact email and resume mailto link synchronized on phamanhduy.sg@gmail.com", () => {
    expect(personal.contact.email).toBe("phamanhduy.sg@gmail.com");

    const mailLink = resume.links.find((link) => link.href.startsWith("mailto:"));
    expect(mailLink).toEqual({
      label: personal.contact.email,
      href: `mailto:${personal.contact.email}`,
    });

    // Guard against stale custom domain email in public portfolio/resume data
    expect(JSON.stringify({ personal, resume })).not.toContain("hello@duypham.me");
  });
});
