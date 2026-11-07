import { describe, expect, it } from "vitest";
import { personal } from "../../src/data/personal";
import { resume } from "../../src/data/resume";

interface DohAnswer {
  readonly name: string;
  readonly type: number;
  readonly data: string;
}

interface DohResponse {
  readonly Status: number;
  readonly Answer?: readonly DohAnswer[];
}

async function queryDoh(name: string, type: "MX" | "TXT"): Promise<DohResponse | null> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) return null;
    return (await res.json()) as DohResponse;
  } catch {
    return null;
  }
}

describe("hello@duypham.me email routing & consistency", () => {
  it("keeps website contact email and resume mailto link synchronized on hello@duypham.me", () => {
    expect(personal.contact.email).toBe("hello@duypham.me");
    const domain = personal.contact.email.split("@")[1];
    expect(domain).toBe("duypham.me");

    const mailLink = resume.links.find((link) => link.href.startsWith("mailto:"));
    expect(mailLink).toEqual({
      label: personal.contact.email,
      href: `mailto:${personal.contact.email}`,
    });

    // Guard against accidental reversion to personal Gmail in public data
    expect(JSON.stringify({ personal, resume })).not.toContain("phamanhduy.sg@gmail.com");
  });

  it("verifies duypham.me publishes Cloudflare Email Routing MX, SPF, and DKIM DNS records", async (ctx) => {
    const [mx, txt, dkim] = await Promise.all([
      queryDoh("duypham.me", "MX"),
      queryDoh("duypham.me", "TXT"),
      queryDoh("cf2024-1._domainkey.duypham.me", "TXT"),
    ]);

    if (!mx || !txt || !dkim) {
      ctx.skip();
      return;
    }

    expect(mx.Status).toBe(0);
    const mxHosts = (mx.Answer ?? []).map((a) => a.data.toLowerCase());
    expect(mxHosts.some((d) => d.includes("route1.mx.cloudflare.net"))).toBe(true);
    expect(mxHosts.some((d) => d.includes("route2.mx.cloudflare.net"))).toBe(true);
    expect(mxHosts.some((d) => d.includes("route3.mx.cloudflare.net"))).toBe(true);

    expect(txt.Status).toBe(0);
    const txtValues = (txt.Answer ?? []).map((a) => a.data);
    expect(txtValues.some((d) => d.includes("v=spf1") && d.includes("_spf.mx.cloudflare.net"))).toBe(true);

    expect(dkim.Status).toBe(0);
    const dkimValues = (dkim.Answer ?? []).map((a) => a.data);
    expect(dkimValues.some((d) => d.includes("v=DKIM1"))).toBe(true);
  });

  it("verifies Cloudflare Email Routing is enabled with an active forward rule for hello@duypham.me", async (ctx) => {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!token) {
      ctx.skip();
      return;
    }

    let zoneId: string | undefined;
    try {
      const zRes = await fetch("https://api.cloudflare.com/client/v4/zones?name=duypham.me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const zData = (await zRes.json()) as { result?: Array<{ id: string }> };
      zoneId = zData.result?.[0]?.id;
    } catch {
      ctx.skip();
      return;
    }

    if (!zoneId) {
      ctx.skip();
      return;
    }

    const [erRes, rulesRes] = await Promise.all([
      fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const er = (await erRes.json()) as {
      success?: boolean;
      result?: { enabled: boolean; status: string };
    };
    const rules = (await rulesRes.json()) as {
      success?: boolean;
      result?: Array<{
        enabled: boolean;
        matchers: Array<{ type: string; field?: string; value?: string }>;
        actions: Array<{ type: string; value?: string[] }>;
      }>;
    };

    if (!er.success || !rules.success) {
      ctx.skip();
      return;
    }

    expect(er.result?.enabled).toBe(true);
    expect(er.result?.status).toBe("ready");

    const matchingRule = (rules.result ?? []).find(
      (rule) =>
        rule.enabled &&
        rule.matchers.some((m) => m.type === "literal" && m.field === "to" && m.value === personal.contact.email) &&
        rule.actions.some((a) => a.type === "forward" && (a.value?.length ?? 0) > 0),
    );
    expect(matchingRule).toBeDefined();
  });
});
