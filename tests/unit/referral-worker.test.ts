import { describe, expect, it, vi } from "vitest";
import worker, {
  buildEvent,
  computeVisitorId,
  countryFlag,
  formatLocationField,
  isKnownBot,
  isPrefetchRequest,
  normalizePathname,
  resolveChannel,
  summarizeClient,
  summarizeLanguage,
  type CfRequest,
  type D1DatabaseLike,
  type WorkerExecutionContext,
} from "../../workers/referral-tracker/index";

describe("referral tracker worker", () => {
  it("normalizes trailing slashes without altering root", () => {
    expect(normalizePathname("/")).toBe("/");
    expect(normalizePathname("/cv/")).toBe("/cv");
    expect(normalizePathname("/labs/")).toBe("/labs");
  });

  it("resolves all page channels while ignoring static assets", () => {
    expect(resolveChannel("/")).toEqual({ channel: "home", isShortLink: false });
    expect(resolveChannel("/labs")).toEqual({ channel: "labs", isShortLink: false });
    expect(resolveChannel("/labs/")).toEqual({ channel: "labs", isShortLink: false });
    expect(resolveChannel("/cv")).toEqual({ channel: "cv", isShortLink: true });
    expect(resolveChannel("/cv/")).toEqual({ channel: "cv", isShortLink: true });
    expect(resolveChannel("/in")).toEqual({ channel: "in", isShortLink: true });
    expect(resolveChannel("/gh/")).toEqual({ channel: "gh", isShortLink: true });
    expect(resolveChannel("/resume.pdf")).toEqual({ channel: "resume_pdf", isShortLink: false });
    expect(resolveChannel("/resume-light.pdf")).toEqual({ channel: "resume_pdf", isShortLink: false });
    expect(resolveChannel("/custom-page")).toEqual({ channel: "page", isShortLink: false });

    // Ignored static sub-resources
    expect(resolveChannel("/_astro/index.abc123.css")).toBeNull();
    expect(resolveChannel("/fonts/archivo-latin-v25.woff2")).toBeNull();
    expect(resolveChannel("/favicon.svg")).toBeNull();
    expect(resolveChannel("/og-image.png")).toBeNull();
    expect(resolveChannel("/robots.txt")).toBeNull();
  });

  it("classifies bots vs real browsers, summarizes client/language, and computes visitor ID", () => {
    expect(isKnownBot(null)).toBe(true);
    expect(isKnownBot("LinkedInBot/1.0")).toBe(true);
    expect(isKnownBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    const macChrome =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    expect(isKnownBot(macChrome)).toBe(false);
    expect(summarizeClient(macChrome)).toBe("macOS · Chrome");
    expect(summarizeClient("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) LinkedInApp")).toBe(
      "iOS · LinkedIn App",
    );
    expect(summarizeLanguage("id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("id-ID, id, en-US");
    expect(computeVisitorId("203.0.113.10", macChrome)).toMatch(/^#[0-9A-F]{6}$/);
    expect(computeVisitorId("203.0.113.10", macChrome)).toBe(computeVisitorId("203.0.113.10", macChrome));
    expect(countryFlag("SG")).toBe("🇸🇬");
    expect(countryFlag("VN")).toBe("🇻🇳");
  });

  it("detects speculative browser prefetch requests", () => {
    expect(isPrefetchRequest(new Headers({ "sec-purpose": "prefetch" }))).toBe(true);
    expect(isPrefetchRequest(new Headers())).toBe(false);
  });

  it("extracts Cloudflare edge metadata and builds a Google Maps location link", () => {
    const req = Object.assign(
      new Request("https://www.duypham.me/cv?from=grab", {
        headers: {
          "cf-connecting-ip": "203.0.113.42",
          "accept-language": "en-SG,en;q=0.9,id;q=0.8",
        },
      }),
      {
        cf: {
          country: "SG",
          city: "Singapore",
          region: "Central Singapore",
          postalCode: "018989",
          latitude: "1.2897",
          longitude: "103.8501",
          timezone: "Asia/Singapore",
          colo: "SIN",
          asn: 3758,
          asOrganization: "Singtel Fibre",
          httpProtocol: "HTTP/3",
        },
      },
    ) as CfRequest;

    const event = buildEvent(req, "cv", new Date("2026-11-06T10:00:00.000Z"));
    expect(event.query).toBe("?from=grab");
    expect(event.language).toBe("en-SG, en, id");
    expect(event.visitorId).toMatch(/^#[0-9A-F]{6}$/);
    expect(formatLocationField(event)).toBe(
      "🇸🇬 [Singapore, Central Singapore, SG (018989) 📍](https://www.google.com/maps?q=1.2897%2C103.8501)",
    );
  });

  it("returns an edge 307 redirect for /cv, sets anti-dup cookie, and skips duplicate home notification", async () => {
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db: D1DatabaseLike = { prepare };

    const tasks: Promise<unknown>[] = [];
    const ctx: WorkerExecutionContext = {
      waitUntil: (promise) => tasks.push(promise),
    };

    const req = Object.assign(
      new Request("https://duypham.me/cv/", {
        headers: {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15",
        },
      }),
      { cf: { country: "VN", city: "Ho Chi Minh City" } },
    ) as CfRequest;

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const res = await worker.fetch(req, { DB: db }, ctx);
    await Promise.all(tasks);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toBe("https://www.duypham.me/");
    expect(res.headers.get("Set-Cookie")).toContain("__cf_ref_hop=1");
    expect(res.headers.get("Set-Cookie")).toContain("Domain=.duypham.me");
    expect(prepare).toHaveBeenCalledOnce();

    // Immediate landing on "/" carrying the hop cookie should not fire a second notification
    const originFetch = vi.fn().mockResolvedValue(new Response("<html></html>", { status: 200 }));
    const followUpReq = new Request("https://www.duypham.me/", {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15",
        cookie: "__cf_ref_hop=1",
      },
    }) as CfRequest;
    await worker.fetch(followUpReq, { DB: db }, ctx, originFetch);
    expect(prepare).toHaveBeenCalledOnce();
    logSpy.mockRestore();
  });

  it("supports ?radar=off and ?radar=on self-visit ignore cookie", async () => {
    const offRes = await worker.fetch(new Request("https://www.duypham.me/?radar=off") as CfRequest);
    expect(offRes.status).toBe(302);
    expect(offRes.headers.get("Location")).toBe("https://www.duypham.me/");
    expect(offRes.headers.get("Set-Cookie")).toContain("__cf_radar_ignore=1");

    const onRes = await worker.fetch(new Request("https://www.duypham.me/labs?radar=on") as CfRequest);
    expect(onRes.status).toBe(302);
    expect(onRes.headers.get("Location")).toBe("https://www.duypham.me/labs");
    expect(onRes.headers.get("Set-Cookie")).toContain("Max-Age=0");

    // Request with __cf_radar_ignore=1 skips logging
    const originFetch = vi.fn().mockResolvedValue(new Response("<html></html>", { status: 200 }));
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const ignoredReq = new Request("https://www.duypham.me/", {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15",
        cookie: "__cf_radar_ignore=1",
      },
    }) as CfRequest;
    const res = await worker.fetch(ignoredReq, {}, undefined, originFetch);
    expect(res.status).toBe(200);
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it("passes / and /resume.pdf through to origin while recording GET visits", async () => {
    const originFetch = vi.fn().mockResolvedValue(
      new Response("PDF_BYTES", {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
    );

    const tasks: Promise<unknown>[] = [];
    const ctx: WorkerExecutionContext = {
      waitUntil: (promise) => tasks.push(promise),
    };

    const req = new Request("https://www.duypham.me/resume.pdf", {
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0" },
    }) as CfRequest;

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const res = await worker.fetch(req, {}, ctx, originFetch);
    await Promise.all(tasks);

    expect(res.status).toBe(200);
    expect(originFetch).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledOnce();
    expect(JSON.parse(logSpy.mock.calls[0][0] as string)).toMatchObject({
      channel: "resume_pdf",
      path: "/resume.pdf",
      clientSummary: "Windows · Chrome",
      isBot: false,
    });
    logSpy.mockRestore();
  });
});
