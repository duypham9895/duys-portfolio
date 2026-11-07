export type TrackedChannel = "cv" | "in" | "gh" | "resume_pdf" | "home" | "labs" | "page";

export interface CfProperties {
  readonly country?: string;
  readonly city?: string;
  readonly region?: string;
  readonly postalCode?: string;
  readonly latitude?: string;
  readonly longitude?: string;
  readonly timezone?: string;
  readonly colo?: string;
  readonly asn?: number;
  readonly asOrganization?: string;
  readonly httpProtocol?: string;
}

export interface CfRequest extends Request {
  readonly cf?: CfProperties;
}

export interface D1PreparedStatement {
  bind(...values: readonly unknown[]): {
    run(): Promise<unknown>;
  };
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
}

export interface WorkerEnv {
  /** Optional D1 database binding for persistent hit history. */
  readonly DB?: D1DatabaseLike;
  /** Optional Discord webhook URL for real-time human visit alerts. */
  readonly DISCORD_WEBHOOK_URL?: string;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface ReferralEvent {
  readonly type: "referral_hit";
  readonly channel: TrackedChannel;
  readonly path: string;
  readonly query: string | null;
  readonly method: string;
  readonly visitorId: string;
  readonly country: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly postalCode: string | null;
  readonly latitude: string | null;
  readonly longitude: string | null;
  readonly timezone: string | null;
  readonly colo: string | null;
  readonly asn: number | null;
  readonly asnOrg: string | null;
  readonly httpProtocol: string | null;
  readonly language: string | null;
  readonly referer: string | null;
  readonly userAgent: string | null;
  readonly clientSummary: string;
  readonly isBot: boolean;
  readonly timestamp: string;
}

const SHORT_LINK_CHANNELS: Readonly<Record<string, TrackedChannel>> = {
  "/cv": "cv",
  "/in": "in",
  "/gh": "gh",
};

const RESUME_PATHS = new Set(["/resume.pdf", "/resume-light.pdf", "/resume-dark.pdf"]);

const IGNORED_PREFIXES = ["/_astro/", "/fonts/", "/icons/", "/cdn-cgi/"];
const IGNORED_EXACT = new Set([
  "/favicon.svg",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/og-image.png",
  "/robots.txt",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
]);
const STATIC_ASSET_EXT = /\.(?:css|js|mjs|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|avif|ico|xml|txt|json|map)$/i;

const BOT_PATTERN =
  /bot\b|crawl|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|telegrambot|discordbot|whatsapp|headlesschrome|playwright|curl\/|wget\/|python-requests|uptimerobot|pingdom|ahrefs|semrush|mj12bot|bytespider|gptbot|claudebot|perplexitybot/i;

const REDIRECT_COOKIE = "__cf_ref_hop=1";
const RADAR_IGNORE_COOKIE = "__cf_radar_ignore=1";

function cookieDomainAttr(hostname: string): string {
  const lower = hostname.toLowerCase();
  if (lower === "duypham.me" || lower.endsWith(".duypham.me")) {
    return "; Domain=.duypham.me";
  }
  return "";
}

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function resolveChannel(pathname: string): {
  readonly channel: TrackedChannel;
  readonly isShortLink: boolean;
} | null {
  const clean = normalizePathname(pathname);

  if (clean in SHORT_LINK_CHANNELS) {
    return { channel: SHORT_LINK_CHANNELS[clean], isShortLink: true };
  }
  if (RESUME_PATHS.has(clean)) {
    return { channel: "resume_pdf", isShortLink: false };
  }
  if (IGNORED_EXACT.has(clean) || IGNORED_PREFIXES.some((prefix) => clean.startsWith(prefix))) {
    return null;
  }
  if (STATIC_ASSET_EXT.test(clean)) {
    return null;
  }
  if (clean === "/") {
    return { channel: "home", isShortLink: false };
  }
  if (clean === "/labs") {
    return { channel: "labs", isShortLink: false };
  }
  return { channel: "page", isShortLink: false };
}

export function isKnownBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) return true;
  return BOT_PATTERN.test(userAgent);
}

export function isPrefetchRequest(headers: Headers): boolean {
  const purpose = (headers.get("sec-purpose") ?? headers.get("purpose") ?? headers.get("x-purpose") ?? "").toLowerCase();
  return purpose.includes("prefetch") || purpose.includes("preview");
}

/** Parses raw User-Agent into a clean "OS · Browser" summary for Discord notifications. */
export function summarizeClient(userAgent: string | null): string {
  if (!userAgent) return "Unknown client";

  let os = "Unknown OS";
  if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = "macOS";
  else if (/Windows NT/i.test(userAgent)) os = "Windows";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  let browser = "Browser";
  if (/LinkedInApp/i.test(userAgent)) browser = "LinkedIn App";
  else if (/Zalo/i.test(userAgent)) browser = "Zalo In-App";
  else if (/FBAN|FBAV/i.test(userAgent)) browser = "Facebook In-App";
  else if (/Edg\//i.test(userAgent)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(userAgent)) browser = "Opera";
  else if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) browser = "Chrome";
  else if (/Firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) browser = "Safari";

  return `${os} · ${browser}`;
}

/** Extracts top language codes from Accept-Language (e.g. "vi-VN,vi;q=0.9,en-US;q=0.8" -> "vi-VN, vi, en-US"). */
export function summarizeLanguage(acceptLanguage: string | null): string | null {
  if (!acceptLanguage || acceptLanguage.trim().length === 0) return null;
  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter((tag): tag is string => Boolean(tag) && tag !== "*");
  return tags.length > 0 ? tags.slice(0, 3).join(", ") : null;
}

/** Deterministic 6-hex visitor tag from IP + User-Agent (FNV-1a) so multi-page sessions can be correlated privately. */
export function computeVisitorId(ip: string | null, userAgent: string | null): string {
  const seed = `${ip ?? "no-ip"}|${userAgent ?? "no-ua"}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `#${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 6)}`;
}

export function countryFlag(countryCode: string | null): string {
  if (!countryCode || !/^[A-Z]{2}$/i.test(countryCode)) return "🌐";
  return [...countryCode.toUpperCase()]
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join("");
}

export function formatLocationField(event: ReferralEvent): string {
  const flag = countryFlag(event.country);
  const parts = [event.city, event.region, event.country].filter(Boolean);
  const base = parts.length > 0 ? parts.join(", ") : "Unknown";
  const withPostal = event.postalCode ? `${base} (${event.postalCode})` : base;
  if (event.latitude && event.longitude) {
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${event.latitude},${event.longitude}`)}`;
    return `${flag} [${withPostal} 📍](${mapsUrl})`;
  }
  return `${flag} ${withPostal}`;
}

export function buildEvent(request: CfRequest, channel: TrackedChannel, now: Date = new Date()): ReferralEvent {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
  return {
    type: "referral_hit",
    channel,
    path: url.pathname,
    query: url.search ? url.search : null,
    method: request.method,
    visitorId: computeVisitorId(ip, userAgent),
    country: request.cf?.country ?? null,
    city: request.cf?.city ?? null,
    region: request.cf?.region ?? null,
    postalCode: request.cf?.postalCode ?? null,
    latitude: request.cf?.latitude ?? null,
    longitude: request.cf?.longitude ?? null,
    timezone: request.cf?.timezone ?? null,
    colo: request.cf?.colo ?? null,
    asn: request.cf?.asn ?? null,
    asnOrg: request.cf?.asOrganization ?? null,
    httpProtocol: request.cf?.httpProtocol ?? null,
    language: summarizeLanguage(request.headers.get("accept-language")),
    referer: request.headers.get("referer"),
    userAgent,
    clientSummary: summarizeClient(userAgent),
    isBot: isKnownBot(userAgent),
    timestamp: now.toISOString(),
  };
}

const CHANNEL_META: Readonly<Record<TrackedChannel, { readonly title: string; readonly color: number }>> = {
  cv: { title: "📄 Short-link từ CV (/cv)", color: 0xf5c400 },
  resume_pdf: { title: "📥 Mở / Tải Resume PDF", color: 0xf5c400 },
  in: { title: "💼 Short-link từ LinkedIn (/in)", color: 0x1b39c9 },
  gh: { title: "🐙 Short-link từ GitHub (/gh)", color: 0x1b39c9 },
  home: { title: "🏠 Truy cập Trang chủ (/)", color: 0x1b39c9 },
  labs: { title: "🧪 Truy cập Trang Labs (/labs)", color: 0x2f9e8f },
  page: { title: "🧭 Truy cập Trang khác", color: 0x5a5a60 },
};

export async function recordVisit(
  event: ReferralEvent,
  env: WorkerEnv = {},
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  // 1. Always emit structured JSON for Cloudflare Workers Observability (free 0.5 GB/day).
  console.log(JSON.stringify(event));

  // 2. Persist to Cloudflare D1 if bound.
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO referral_hits (
          visitor_id, channel, path, country, city, region, asn_org, language, referer, user_agent, is_bot, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          event.visitorId,
          event.channel,
          event.query ? `${event.path}${event.query}` : event.path,
          event.country,
          event.city,
          event.region,
          event.asnOrg,
          event.language,
          event.referer,
          event.userAgent,
          event.isBot ? 1 : 0,
          event.timestamp,
        )
        .run();
    } catch (error) {
      console.error("D1 insert failed:", error);
    }
  }

  // 3. Optional real-time Discord rich embed alert for non-bot hits.
  if (env.DISCORD_WEBHOOK_URL && !event.isBot) {
    try {
      const meta = CHANNEL_META[event.channel];
      const locationText = formatLocationField(event);
      const networkParts = [
        event.asnOrg ?? "Unknown ISP",
        event.asn ? `AS${event.asn}` : null,
        event.colo ? `Edge: ${event.colo}` : null,
      ].filter(Boolean);
      const refererText = event.referer ?? "Direct / Bookmark / PDF";

      await fetchImpl(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: meta.title,
              color: meta.color,
              fields: [
                { name: "Visitor ID", value: `\`${event.visitorId}\``, inline: true },
                { name: "Path", value: `\`${event.path}\``, inline: true },
                { name: "Query Params", value: event.query ? `\`${event.query}\`` : "None", inline: true },
                { name: "Location", value: locationText, inline: true },
                { name: "Device / Browser", value: event.clientSummary, inline: true },
                { name: "Browser Language", value: event.language ?? "Unknown", inline: true },
                { name: "Network (ISP / ASN / Edge)", value: networkParts.join(" · "), inline: true },
                { name: "Referer", value: refererText, inline: true },
                { name: "Visitor Timezone", value: event.timezone ?? "Unknown", inline: true },
              ],
              timestamp: event.timestamp,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Webhook notification failed:", error);
    }
  }
}

export default {
  async fetch(
    request: CfRequest,
    env: WorkerEnv = {},
    ctx?: WorkerExecutionContext,
    originFetch: typeof fetch = fetch,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Self-visit opt-out / opt-in toggle via `?radar=off` or `?radar=on`
    const radarToggle = url.searchParams.get("radar");
    if (radarToggle === "off" || radarToggle === "on") {
      url.searchParams.delete("radar");
      const domainAttr = cookieDomainAttr(url.hostname);
      const cookie =
        radarToggle === "off"
          ? `${RADAR_IGNORE_COOKIE}; Max-Age=31536000; Path=/${domainAttr}; HttpOnly; SameSite=Lax; Secure`
          : `__cf_radar_ignore=; Max-Age=0; Path=/${domainAttr}; HttpOnly; SameSite=Lax; Secure`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.toString(),
          "Cache-Control": "no-store",
          "Set-Cookie": cookie,
        },
      });
    }

    const matched = resolveChannel(url.pathname);
    if (!matched) {
      return originFetch(request);
    }

    const cookies = request.headers.get("cookie") ?? "";
    const isSelfIgnored = cookies.includes(RADAR_IGNORE_COOKIE);
    const isRedirectLanding = matched.channel === "home" && cookies.includes(REDIRECT_COOKIE);

    // Track real GET page/PDF visits unless opted out via `__cf_radar_ignore=1`.
    if (request.method === "GET" && !isSelfIgnored && !isPrefetchRequest(request.headers) && !isRedirectLanding) {
      const event = buildEvent(request, matched.channel);
      const task = recordVisit(event, env, originFetch);
      if (ctx) {
        ctx.waitUntil(task);
      } else {
        await task;
      }
    }

    if (matched.isShortLink) {
      const targetOrigin = url.hostname.toLowerCase() === "duypham.me" ? "https://www.duypham.me" : url.origin;
      const destination = new URL("/", targetOrigin).toString();
      const domainAttr = cookieDomainAttr(url.hostname);
      return new Response(null, {
        status: 307,
        headers: {
          Location: destination,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          // Suppress duplicate "home" notification when browser follows the 307 redirect to "/"
          "Set-Cookie": `${REDIRECT_COOKIE}; Max-Age=5; Path=/${domainAttr}; HttpOnly; SameSite=Lax; Secure`,
        },
      });
    }

    return originFetch(request);
  },
};
