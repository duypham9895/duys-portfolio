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

  it("protects /__radar with Zero-Trust Email OTP and blocks unauthorized emails or API calls", async () => {
    const sentEmails: unknown[] = [];
    let storedOtp: {
      id: number;
      code_hash: string;
      ip: string | null;
      attempts: number;
      expires_at: string;
      created_at: string;
    } | null = null;
    let storedSessionHash: string | null = null;

    const db: D1DatabaseLike = {
      prepare: (query: string) => ({
        bind: (...values: readonly unknown[]) => ({
          run: async () => {
            if (query.startsWith("INSERT INTO radar_otps")) {
              storedOtp = {
                id: 1,
                code_hash: values[0] as string,
                ip: (values[1] as string | null) ?? null,
                attempts: 0,
                expires_at: values[2] as string,
                created_at: values[3] as string,
              };
            } else if (query.startsWith("UPDATE radar_otps SET attempts")) {
              if (storedOtp) storedOtp.attempts = values[0] as number;
            } else if (query.startsWith("DELETE FROM radar_otps") && !query.includes("expires_at <=")) {
              storedOtp = null;
            } else if (query.startsWith("INSERT INTO radar_sessions")) {
              storedSessionHash = values[0] as string;
            }
            return {};
          },
          first: async <T>() => {
            if (query.includes("FROM radar_sessions") && values[0] === storedSessionHash) {
              return { email: "phamanhduy.sg@gmail.com" } as unknown as T;
            }
            if (query.includes("SELECT created_at FROM radar_otps") && storedOtp) {
              return { created_at: storedOtp.created_at } as unknown as T;
            }
            if (query.includes("SELECT id, code_hash, ip, attempts FROM radar_otps") && storedOtp) {
              return storedOtp as unknown as T;
            }
            return null;
          },
          all: async <T>() => ({
            results: query.includes("FROM referral_hits")
              ? ([
                  {
                    id: 10,
                    visitor_id: "#A4F91C",
                    channel: "cv",
                    path: "/cv?from=grab",
                    country: "SG",
                    city: "Singapore",
                    region: "Central Singapore",
                    asn_org: "Singtel Fibre",
                    language: "en-SG",
                    referer: null,
                    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Chrome/130.0.0.0",
                    is_bot: 0,
                    created_at: "2026-11-07T03:00:00.000Z",
                  },
                ] as unknown as readonly T[])
              : ([] as readonly T[]),
          }),
        }),
      }),
    };

    const env = {
      DB: db,
      EMAIL: {
        send: async (msg: unknown) => {
          sentEmails.push(msg);
        },
      },
    };

    // 1. Unauthenticated GET /__radar renders login screen, not dashboard
    const loginRes = await worker.fetch(new Request("https://www.duypham.me/__radar") as CfRequest, env);
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const loginHtml = await loginRes.text();
    expect(loginHtml).toContain("ZERO TRUST OTP");
    expect(loginHtml).not.toContain("#A4F91C");

    // 2. Unauthenticated API call is rejected with 401
    const unauthApi = await worker.fetch(
      new Request("https://www.duypham.me/__radar/api/purge-bots", { method: "POST" }) as CfRequest,
      env,
    );
    expect(unauthApi.status).toBe(401);

    // 3. Unauthorized email is rejected with 403 and sends 0 emails
    const badOtpReq = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "intruder@example.com" }),
      }) as CfRequest,
      env,
    );
    expect(badOtpReq.status).toBe(403);
    expect(sentEmails).toHaveLength(0);

    // 4. Authorized owner email (hello@duypham.me) triggers OTP email
    const goodOtpReq = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ email: "hello@duypham.me" }),
      }) as CfRequest,
      env,
    );
    expect(goodOtpReq.status).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(storedOtp?.code_hash).toBeTruthy();

    // 4b. Immediate repeat OTP request within 60s cooldown is throttled with 429
    const rapidOtpReq = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ email: "hello@duypham.me" }),
      }) as CfRequest,
      env,
    );
    expect(rapidOtpReq.status).toBe(429);
    expect(sentEmails).toHaveLength(1);

    // Extract the 6-digit OTP from the sent raw MIME message
    const rawMime = JSON.stringify(sentEmails[0]);
    const codeMatch = rawMime.match(/Edge Radar OTP: ([0-9]{6})/);
    expect(codeMatch).not.toBeNull();
    const otpCode = codeMatch![1];

    // 5. Verify OTP -> receives HttpOnly session cookie
    const verifyRes = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ code: otpCode }),
      }) as CfRequest,
      env,
    );
    expect(verifyRes.status).toBe(200);
    const setCookie = verifyRes.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("__cf_radar_session=");
    const sessionCookie = setCookie.split(";")[0];

    // 6. Authenticated GET /__radar renders live D1 telemetry
    const dashRes = await worker.fetch(
      new Request("https://www.duypham.me/__radar", {
        headers: { cookie: sessionCookie },
      }) as CfRequest,
      env,
    );
    expect(dashRes.status).toBe(200);
    const dashHtml = await dashRes.text();
    expect(dashHtml).toContain("#A4F91C");
    expect(dashHtml).toContain("Singtel Fibre");
    expect(dashHtml).toContain("/cv?from=grab");
  });

  it("locks and destroys OTP after 5 failed brute-force attempts or IP mismatch", async () => {
    const sentEmails: unknown[] = [];
    let storedOtp: {
      id: number;
      code_hash: string;
      ip: string | null;
      attempts: number;
      expires_at: string;
      created_at: string;
    } | null = null;

    const db: D1DatabaseLike = {
      prepare: (query: string) => ({
        bind: (...values: readonly unknown[]) => ({
          run: async () => {
            if (query.startsWith("INSERT INTO radar_otps")) {
              storedOtp = {
                id: 1,
                code_hash: values[0] as string,
                ip: (values[1] as string | null) ?? null,
                attempts: 0,
                expires_at: values[2] as string,
                created_at: values[3] as string,
              };
            } else if (query.startsWith("UPDATE radar_otps SET attempts")) {
              if (storedOtp) storedOtp.attempts = values[0] as number;
            } else if (query.startsWith("DELETE FROM radar_otps") && !query.includes("expires_at <=")) {
              storedOtp = null;
            }
            return {};
          },
          first: async <T>() => {
            if (query.includes("SELECT created_at FROM radar_otps") && storedOtp) {
              return { created_at: storedOtp.created_at } as unknown as T;
            }
            if (query.includes("SELECT id, code_hash, ip, attempts FROM radar_otps") && storedOtp) {
              return storedOtp as unknown as T;
            }
            return null;
          },
          all: async <T>() => ({ results: [] as readonly T[] }),
        }),
      }),
    };

    const env = {
      DB: db,
      EMAIL: {
        send: async (msg: unknown) => {
          sentEmails.push(msg);
        },
      },
    };

    await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ email: "hello@duypham.me" }),
      }) as CfRequest,
      env,
    );

    const rawMime = JSON.stringify(sentEmails[0]);
    const validOtp = rawMime.match(/Edge Radar OTP: ([0-9]{6})/)![1];
    const wrongOtp = validOtp === "000000" ? "999999" : "000000";

    // Attempt 1: Valid OTP from a DIFFERENT IP is rejected with 401 (IP Pinning)
    const wrongIpRes = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "198.51.100.77" },
        body: JSON.stringify({ code: validOtp }),
      }) as CfRequest,
      env,
    );
    expect(wrongIpRes.status).toBe(401);

    // Attempts 2, 3, 4: Wrong OTP from the original IP -> 401 with remaining count
    for (let i = 2; i <= 4; i++) {
      const res = await worker.fetch(
        new Request("https://www.duypham.me/__radar/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
          body: JSON.stringify({ code: wrongOtp }),
        }) as CfRequest,
        env,
      );
      expect(res.status).toBe(401);
    }

    // Attempt 5: 5th failed attempt locks & destroys the OTP with HTTP 429
    const fifthRes = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ code: wrongOtp }),
      }) as CfRequest,
      env,
    );
    expect(fifthRes.status).toBe(429);
    expect(storedOtp).toBeNull();

    // Attempt 6: Even submitting the real OTP now fails with 401 because the OTP was destroyed
    const afterLockRes = await worker.fetch(
      new Request("https://www.duypham.me/__radar/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
        body: JSON.stringify({ code: validOtp }),
      }) as CfRequest,
      env,
    );
    expect(afterLockRes.status).toBe(401);
  });
});
