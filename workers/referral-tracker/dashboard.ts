import {
  computeVisitorId,
  countryFlag,
  summarizeClient,
  type CfRequest,
  type D1DatabaseLike,
  type WorkerEnv,
} from "./index";

const ALLOWED_ADMIN_EMAILS = new Set(["phamanhduy.sg@gmail.com", "hello@duypham.me"]);
const SESSION_COOKIE_NAME = "__cf_radar_session";
const RADAR_IGNORE_COOKIE = "__cf_radar_ignore=1";

export interface HitRow {
  readonly id: number;
  readonly visitor_id: string | null;
  readonly channel: string;
  readonly path: string;
  readonly country: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly asn_org: string | null;
  readonly language: string | null;
  readonly referer: string | null;
  readonly user_agent: string | null;
  readonly is_bot: number;
  readonly created_at: string;
}

export interface MuteRow {
  readonly id: number;
  readonly kind: string;
  readonly value: string;
  readonly note: string | null;
  readonly created_at: string;
}

export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSixDigitOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

export function generateSessionToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

async function createCloudflareEmailMessage(from: string, to: string, rawMime: string): Promise<unknown> {
  try {
    const mod = (await import(/* @vite-ignore */ "cloudflare:email")) as {
      EmailMessage: new (from: string, to: string, raw: string) => unknown;
    };
    return new mod.EmailMessage(from, to, rawMime);
  } catch {
    return { from, to, raw: rawMime };
  }
}

export async function sendOtpEmail(env: WorkerEnv, code: string, requestedByIp: string | null): Promise<void> {
  if (!env.EMAIL) {
    throw new Error("EMAIL binding is not configured on this Worker.");
  }
  const from = "radar@duypham.me";
  const to = "phamanhduy.sg@gmail.com";
  const msgId = `<otp-${Date.now()}-${Math.random().toString(36).slice(2)}@duypham.me>`;
  const dateHeader = new Date().toUTCString();
  const rawMime = [
    `From: "Portfolio Radar" <${from}>`,
    `To: <${to}>`,
    `Subject: [duypham.me] Edge Radar OTP: ${code}`,
    `Message-ID: ${msgId}`,
    `Date: ${dateHeader}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    `Your 6-digit One-Time PIN for https://www.duypham.me/__radar is:`,
    ``,
    `    ${code}`,
    ``,
    `This code expires in 5 minutes (single use).`,
    `Requested from IP: ${requestedByIp ?? "unknown"}`,
  ].join("\r\n");

  const emailMessage = await createCloudflareEmailMessage(from, to, rawMime);
  await env.EMAIL.send(emailMessage);
}

export async function getAuthenticatedSession(
  request: Request,
  db?: D1DatabaseLike,
): Promise<{ readonly email: string; readonly tokenHash: string } | null> {
  if (!db) return null;
  const rawToken = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!rawToken || rawToken.length < 32) return null;

  const tokenHash = await sha256Hex(rawToken);
  const nowIso = new Date().toISOString();
  const row = await db
    .prepare(`SELECT email FROM radar_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1`)
    .bind(tokenHash, nowIso)
    .first<{ email: string }>();

  if (!row?.email) return null;
  return { email: row.email, tokenHash };
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      ...extraHeaders,
    },
  });
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function renderLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Zero Trust Access · Portfolio Radar</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    :root, [data-theme="light"] {
      --bg: #FAFAF7; --surface: #F0F0EA; --card: #FFFFFF; --border: #D9D9D1;
      --border-strong: #8A8A90; --text: #111114; --muted: #5A5A60;
      --accent: #1B39C9; --accent-hover: #142B9C; --on-accent: #FFFFFF;
      --yellow: #F5C400; --red: #C41E3A; --stripe-2: #111114;
    }
    [data-theme="dark"] {
      --bg: #0B1120; --surface: #172038; --card: #172038; --border: #34425F;
      --border-strong: #6878A0; --text: #DADFE8; --muted: #98A3B9;
      --accent: #7393FF; --accent-hover: #9DB3FF; --on-accent: #0B1120;
      --yellow: #F5C400; --red: #FF6B81; --stripe-2: #26314F;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; background: var(--bg); color: var(--text);
      font-family: "Archivo", system-ui, -apple-system, sans-serif;
      display: flex; flex-direction: column;
    }
    .stripes {
      height: 5px;
      background: linear-gradient(to right, var(--accent) 0 33.33%, var(--stripe-2) 33.33% 66.66%, var(--yellow) 66.66% 100%);
    }
    .mono {
      font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.08em;
    }
    .wrap {
      flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .bib {
      width: 100%; max-width: 440px; background: var(--card);
      border: 1px solid var(--border-strong); border-radius: 6px;
      overflow: hidden; box-shadow: 0 24px 48px -24px rgba(17,17,20,.28);
    }
    .bib-body { padding: 32px 28px; }
    h1 { margin: 8px 0 6px; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; }
    p { margin: 0 0 20px; font-size: 14px; color: var(--muted); line-height: 1.5; }
    label { display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 6px; color: var(--muted); }
    input {
      width: 100%; height: 44px; padding: 0 12px; font-size: 15px;
      background: var(--bg); color: var(--text);
      border: 1.5px solid var(--border-strong); border-radius: 2px;
      margin-bottom: 14px;
    }
    input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
    button.primary {
      width: 100%; height: 46px; background: var(--accent); color: var(--on-accent);
      border: 2px solid var(--accent); border-radius: 2px;
      font-weight: 700; font-size: 14px; text-transform: uppercase; cursor: pointer;
    }
    button.primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
    button.ghost {
      width: 100%; height: 40px; margin-top: 8px; background: transparent; color: var(--muted);
      border: 1px solid var(--border); border-radius: 2px; font-size: 12px; text-transform: uppercase; cursor: pointer;
    }
    .msg {
      padding: 10px 12px; border-radius: 2px; font-size: 13px; margin-bottom: 14px;
      border-left: 4px solid var(--yellow); background: var(--surface);
    }
    .msg.err { border-left-color: var(--red); }
  </style>
</head>
<body>
  <div class="stripes"></div>
  <main class="wrap">
    <div class="bib">
      <div class="stripes"></div>
      <div class="bib-body">
        <div class="mono" style="font-size:11px;text-transform:uppercase;color:var(--muted);">
          DUYPHAM.ME / __RADAR · ZERO TRUST OTP
        </div>
        <h1>Portfolio Radar</h1>
        <p>Enter your authorized owner email to receive a 6-digit One-Time PIN via Cloudflare Email Routing.</p>

        <div id="statusBox" class="msg" hidden></div>

        <form id="stepEmail" onsubmit="requestOtp(event)">
          <label class="mono" for="emailInput">Authorized Owner Email</label>
          <input id="emailInput" type="email" required placeholder="hello@duypham.me" autocomplete="email" />
          <button id="sendBtn" type="submit" class="primary mono">Send 6-Digit OTP →</button>
        </form>

        <form id="stepOtp" onsubmit="verifyOtp(event)" hidden>
          <label class="mono" for="otpInput">6-Digit One-Time PIN (Check Inbox)</label>
          <input id="otpInput" class="mono" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="123456" autocomplete="one-time-code" />
          <button id="verifyBtn" type="submit" class="primary mono">Verify & Unlock Radar →</button>
          <button type="button" class="ghost mono" onclick="resetFlow()">← Back to Email</button>
        </form>
      </div>
    </div>
  </main>
  <script>
    const statusBox = document.getElementById("statusBox");
    function showMsg(text, isErr) {
      statusBox.textContent = text;
      statusBox.className = isErr ? "msg err" : "msg";
      statusBox.hidden = false;
    }
    function resetFlow() {
      document.getElementById("stepOtp").hidden = true;
      document.getElementById("stepEmail").hidden = false;
      statusBox.hidden = true;
    }
    async function requestOtp(e) {
      e.preventDefault();
      const btn = document.getElementById("sendBtn");
      const email = document.getElementById("emailInput").value.trim();
      btn.disabled = true;
      btn.textContent = "Dispatching OTP...";
      try {
        const res = await fetch("/__radar/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          showMsg(data.error || "Failed to request OTP.", true);
        } else {
          showMsg(data.message || "6-digit OTP sent to your verified inbox.", false);
          document.getElementById("stepEmail").hidden = true;
          document.getElementById("stepOtp").hidden = false;
          document.getElementById("otpInput").focus();
        }
      } catch {
        showMsg("Network error while requesting OTP.", true);
      } finally {
        btn.disabled = false;
        btn.textContent = "Send 6-Digit OTP →";
      }
    }
    async function verifyOtp(e) {
      e.preventDefault();
      const btn = document.getElementById("verifyBtn");
      const code = document.getElementById("otpInput").value.trim();
      btn.disabled = true;
      btn.textContent = "Verifying...";
      try {
        const res = await fetch("/__radar/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          showMsg(data.error || "Invalid or expired OTP code.", true);
          btn.disabled = false;
          btn.textContent = "Verify & Unlock Radar →";
        } else {
          window.location.href = "/__radar";
        }
      } catch {
        showMsg("Network error while verifying OTP.", true);
        btn.disabled = false;
        btn.textContent = "Verify & Unlock Radar →";
      }
    }
  </script>
</body>
</html>`;
}

function rangeCutoffIso(range: string, now = new Date()): string | null {
  const ms = now.getTime();
  if (range === "24h") return new Date(ms - 24 * 3600 * 1000).toISOString();
  if (range === "7d") return new Date(ms - 7 * 24 * 3600 * 1000).toISOString();
  if (range === "30d") return new Date(ms - 30 * 24 * 3600 * 1000).toISOString();
  return null;
}

function formatVnTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace(" ", " · ");
  } catch {
    return iso;
  }
}

export async function renderDashboardPage(
  request: CfRequest,
  env: WorkerEnv,
  adminEmail: string,
): Promise<Response> {
  const url = new URL(request.url);
  const range = ["24h", "7d", "30d", "all"].includes(url.searchParams.get("range") ?? "")
    ? (url.searchParams.get("range") as string)
    : "7d";
  const cutoff = rangeCutoffIso(range);

  let hits: HitRow[] = [];
  let mutes: MuteRow[] = [];

  if (env.DB) {
    const hitsQuery = cutoff
      ? env.DB.prepare(
          `SELECT id, visitor_id, channel, path, country, city, region, asn_org, language, referer, user_agent, is_bot, created_at
           FROM referral_hits WHERE created_at >= ? ORDER BY id DESC LIMIT 200`,
        ).bind(cutoff)
      : env.DB.prepare(
          `SELECT id, visitor_id, channel, path, country, city, region, asn_org, language, referer, user_agent, is_bot, created_at
           FROM referral_hits ORDER BY id DESC LIMIT 200`,
        ).bind();

    const hitsRes = await hitsQuery.all<HitRow>();
    hits = [...(hitsRes.results ?? [])];

    try {
      const mutesRes = await env.DB.prepare(
        `SELECT id, kind, value, note, created_at FROM radar_mutes ORDER BY id DESC`,
      )
        .bind()
        .all<MuteRow>();
      mutes = [...(mutesRes.results ?? [])];
    } catch {
      mutes = [];
    }
  }

  const humanHits = hits.filter((h) => h.is_bot === 0);
  const botHits = hits.filter((h) => h.is_bot === 1);
  const cvHits = humanHits.filter((h) => h.channel === "cv" || h.channel === "resume_pdf");
  const uniqueVisitors = new Set(humanHits.map((h) => h.visitor_id ?? `anon-${h.id}`)).size;

  const channelCounts = new Map<string, number>();
  const locationCounts = new Map<string, { label: string; count: number }>();
  const networkCounts = new Map<string, number>();

  for (const h of humanHits) {
    channelCounts.set(h.channel, (channelCounts.get(h.channel) ?? 0) + 1);
    const locKey = `${h.city ?? "Unknown"}, ${h.country ?? "XX"}`;
    const locLabel = `${countryFlag(h.country)} ${h.city ?? "Unknown"}, ${h.country ?? "??"}`;
    const prevLoc = locationCounts.get(locKey);
    locationCounts.set(locKey, { label: locLabel, count: (prevLoc?.count ?? 0) + 1 });

    const net = h.asn_org ?? "Unknown ISP";
    networkCounts.set(net, (networkCounts.get(net) ?? 0) + 1);
  }

  const totalHuman = Math.max(humanHits.length, 1);
  const channelOrder = [
    { key: "home", label: "🏠 Home (/)", color: "#1B39C9" },
    { key: "cv", label: "📄 CV Short-link (/cv)", color: "#F5C400" },
    { key: "resume_pdf", label: "📥 Resume PDF (/resume.pdf)", color: "#F5C400" },
    { key: "in", label: "💼 LinkedIn (/in)", color: "#1B39C9" },
    { key: "labs", label: "🧪 Labs (/labs)", color: "#2F9E8F" },
    { key: "gh", label: "🐙 GitHub (/gh)", color: "#5A5A60" },
  ];

  const topLocations = [...locationCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topNetworks = [...networkCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const cookies = request.headers.get("cookie") ?? "";
  const isSelfIgnored = cookies.includes(RADAR_IGNORE_COOKIE);
  const currentIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
  const currentVisitorId = computeVisitorId(currentIp, request.headers.get("user-agent"));

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Portfolio Radar · Duy Pham</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    [data-theme="light"] {
      --kr-bg: #FAFAF7; --kr-surface: #F0F0EA; --kr-surface-2: #E6E6DF;
      --kr-card: #FFFFFF; --kr-border: #D9D9D1; --kr-border-strong: #8A8A90;
      --kr-text: #111114; --kr-muted: #5A5A60; --kr-accent: #1B39C9;
      --kr-accent-hover: #142B9C; --kr-on-accent: #FFFFFF;
      --kr-yellow: #F5C400; --kr-teal: #2F9E8F; --kr-red: #C41E3A; --kr-stripe-2: #111114;
    }
    [data-theme="dark"] {
      --kr-bg: #0B1120; --kr-surface: #172038; --kr-surface-2: #202A46;
      --kr-card: #172038; --kr-border: #34425F; --kr-border-strong: #6878A0;
      --kr-text: #DADFE8; --kr-muted: #98A3B9; --kr-accent: #7393FF;
      --kr-accent-hover: #9DB3FF; --kr-on-accent: #0B1120;
      --kr-yellow: #F5C400; --kr-teal: #3CC5B3; --kr-red: #FF6B81; --kr-stripe-2: #26314F;
    }
    body {
      background-color: var(--kr-bg); color: var(--kr-text);
      font-family: "Archivo", system-ui, -apple-system, sans-serif;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .mono {
      font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.08em;
    }
    .kit-stripes {
      height: 5px;
      background: linear-gradient(to right, var(--kr-accent) 0 33.33%, var(--kr-stripe-2) 33.33% 66.66%, var(--kr-yellow) 66.66% 100%);
    }
    .kit-stripes-v {
      width: 12px; height: 12px; display: inline-block;
      background: linear-gradient(to bottom, var(--kr-accent) 0 33.33%, var(--kr-stripe-2) 33.33% 66.66%, var(--kr-yellow) 66.66% 100%);
    }
    .table-region {
      overflow-x: auto; max-inline-size: 100%; container-type: inline-size;
    }
    .table-region thead { position: sticky; inset-block-start: 0; z-index: 2; }
  </style>
</head>
<body class="min-h-screen antialiased pb-16">
  <div class="kit-stripes sticky top-0 z-50"></div>

  <header class="sticky top-[5px] z-40 border-b border-[var(--kr-border)] bg-[var(--kr-bg)]/95 backdrop-blur">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="kit-stripes-v rounded-[1px]"></span>
        <a href="/" class="font-extrabold tracking-tight text-base hover:underline">DUYPHAM.ME</a>
        <span class="mono text-xs uppercase px-2 py-0.5 rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)]">
          /__radar · Live D1
        </span>
        <span class="hidden md:inline-flex items-center gap-1.5 mono text-xs text-[var(--kr-muted)]">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          ${escapeHtml(adminEmail)} · You: ${escapeHtml(currentVisitorId)}
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <a
          href="${isSelfIgnored ? "/?radar=on" : "/?radar=off"}"
          class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] hover:border-[var(--kr-accent)] transition flex items-center gap-2"
        >
          <span class="w-2 h-2 rounded-full ${isSelfIgnored ? "bg-[#F5C400]" : "bg-emerald-500"}"></span>
          <span>${isSelfIgnored ? "Device: Muted (?radar=off)" : "Device: Tracking (?radar=on)"}</span>
        </a>

        <button
          type="button"
          onclick="sendTestPing()"
          class="mono text-xs uppercase px-3 py-2 rounded-[2px] border-2 border-[var(--kr-accent)] bg-[var(--kr-accent)] text-[var(--kr-on-accent)] font-bold hover:opacity-90 transition cursor-pointer"
        >
          ⚡ Test Discord
        </button>

        <button
          type="button"
          onclick="toggleTheme()"
          id="themeBtn"
          class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer"
        >
          ◐ Night Stage
        </button>

        <button
          type="button"
          onclick="logout()"
          class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border)] text-[var(--kr-muted)] hover:text-[#C41E3A] cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
    <div
      id="toastBanner"
      hidden
      class="border-l-4 border-[#F5C400] bg-[var(--kr-surface)] border border-[var(--kr-border-strong)] p-4 rounded-[2px] flex items-center justify-between gap-4 shadow-sm"
    >
      <div>
        <div class="mono text-xs uppercase font-bold" id="toastTitle">Action Completed</div>
        <div class="text-sm text-[var(--kr-muted)]" id="toastBody"></div>
      </div>
      <button type="button" onclick="document.getElementById('toastBanner').hidden = true" class="mono text-xs uppercase underline cursor-pointer">Dismiss</button>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--kr-border)] pb-6">
      <div>
        <div class="flex items-center gap-2.5 mb-2">
          <span class="kit-stripes-v"></span>
          <span class="mono text-xs uppercase text-[var(--kr-muted)]">Cloudflare Edge Worker · D1 portfolio-referrals</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none">Portfolio Radar</h1>
      </div>

      <div class="flex items-center gap-1.5" role="group" aria-label="Time window">
        ${(["24h", "7d", "30d", "all"] as const)
          .map(
            (r) =>
              `<a href="/__radar?range=${r}" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border ${
                range === r
                  ? "border-[var(--kr-accent)] bg-[var(--kr-accent)] text-[var(--kr-on-accent)] font-bold"
                  : "border-[var(--kr-border-strong)]"
              }">${r === "all" ? "All Time" : r.toUpperCase()}</a>`,
          )
          .join("")}
      </div>
    </div>

    <!-- 4 Bib KPI Cards -->
    <section aria-label="Key telemetry metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[var(--kr-card)] border border-[var(--kr-border)] rounded-[4px] overflow-hidden shadow-sm">
        <div class="h-1.5 bg-[#1B39C9]"></div>
        <div class="p-5">
          <div class="flex justify-between items-center">
            <span class="mono text-xs uppercase text-[var(--kr-muted)]">01 · Human Hits</span>
            <span class="mono text-xs px-1.5 py-0.5 bg-[var(--kr-surface)] rounded-[2px]">is_bot = 0</span>
          </div>
          <div class="text-4xl font-black mt-3 tabular-nums">${humanHits.length}</div>
          <div class="text-xs text-[var(--kr-muted)] mt-2">${hits.length} total hits in window</div>
        </div>
      </div>

      <div class="bg-[var(--kr-card)] border border-[var(--kr-border)] rounded-[4px] overflow-hidden shadow-sm">
        <div class="h-1.5 bg-[#F5C400]"></div>
        <div class="p-5">
          <div class="flex justify-between items-center">
            <span class="mono text-xs uppercase text-[var(--kr-muted)]">02 · CV & PDF Opens</span>
            <span class="mono text-xs px-1.5 py-0.5 bg-[#F5C400]/25 font-semibold rounded-[2px]">High Intent</span>
          </div>
          <div class="text-4xl font-black mt-3 tabular-nums">${cvHits.length}</div>
          <div class="text-xs text-[var(--kr-muted)] mt-2">
            ${channelCounts.get("cv") ?? 0} via /cv · ${channelCounts.get("resume_pdf") ?? 0} /resume.pdf
          </div>
        </div>
      </div>

      <div class="bg-[var(--kr-card)] border border-[var(--kr-border)] rounded-[4px] overflow-hidden shadow-sm">
        <div class="h-1.5 bg-[#2F9E8F]"></div>
        <div class="p-5">
          <div class="flex justify-between items-center">
            <span class="mono text-xs uppercase text-[var(--kr-muted)]">03 · Unique Visitors</span>
            <span class="mono text-xs px-1.5 py-0.5 bg-[var(--kr-surface)] rounded-[2px]">FNV-1a #ID</span>
          </div>
          <div class="text-4xl font-black mt-3 tabular-nums">${uniqueVisitors}</div>
          <div class="text-xs text-[var(--kr-muted)] mt-2">Distinct human sessions</div>
        </div>
      </div>

      <div class="bg-[var(--kr-card)] border border-[var(--kr-border)] rounded-[4px] overflow-hidden shadow-sm">
        <div class="h-1.5 bg-[var(--kr-border-strong)]"></div>
        <div class="p-5">
          <div class="flex justify-between items-center">
            <span class="mono text-xs uppercase text-[var(--kr-muted)]">04 · Bots Filtered</span>
            <span class="mono text-xs px-1.5 py-0.5 bg-[var(--kr-surface)] rounded-[2px]">0 Discord Pings</span>
          </div>
          <div class="text-4xl font-black mt-3 tabular-nums">${botHits.length}</div>
          <div class="text-xs text-[var(--kr-muted)] mt-2">${mutes.length} active custom mute rule(s)</div>
        </div>
      </div>
    </section>

    <!-- 3-Column Breakdown -->
    <section aria-label="Traffic breakdown" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-[var(--kr-surface)] border border-[var(--kr-border)] rounded-[4px] p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--kr-border)] pb-3">
          <span class="mono text-xs uppercase font-bold">Channel Split (Click to filter)</span>
          <button type="button" onclick="filterByChannel('all')" class="mono text-xs underline cursor-pointer">Reset</button>
        </div>
        <div class="space-y-3 text-sm">
          ${channelOrder
            .map((ch) => {
              const c = channelCounts.get(ch.key) ?? 0;
              const pct = Math.round((c / totalHuman) * 100);
              return `<button type="button" onclick="filterByChannel('${ch.key}')" class="w-full text-left group cursor-pointer">
                <div class="flex justify-between mb-1">
                  <span class="font-semibold group-hover:text-[var(--kr-accent)]">${ch.label}</span>
                  <span class="mono text-xs">${c} (${pct}%)</span>
                </div>
                <div class="h-2 bg-[var(--kr-bg)] rounded-full overflow-hidden">
                  <div class="h-full" style="width:${pct}%;background:${ch.color}"></div>
                </div>
              </button>`;
            })
            .join("")}
        </div>
      </div>

      <div class="bg-[var(--kr-surface)] border border-[var(--kr-border)] rounded-[4px] p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--kr-border)] pb-3">
          <span class="mono text-xs uppercase font-bold">Top Locations (Edge Geo)</span>
          <span class="mono text-xs text-[var(--kr-muted)]">Human hits</span>
        </div>
        <ul class="divide-y divide-[var(--kr-border)] text-sm">
          ${
            topLocations.length > 0
              ? topLocations
                  .map(
                    (loc) => `<li class="py-2.5 flex items-center justify-between">
                      <span class="font-semibold">${escapeHtml(loc.label)}</span>
                      <span class="mono text-xs font-bold px-2 py-1 bg-[var(--kr-bg)] rounded-[2px]">${loc.count}</span>
                    </li>`,
                  )
                  .join("")
              : `<li class="py-4 text-[var(--kr-muted)] text-xs mono">No human hits in this range yet.</li>`
          }
        </ul>
      </div>

      <div class="bg-[var(--kr-surface)] border border-[var(--kr-border)] rounded-[4px] p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--kr-border)] pb-3">
          <span class="mono text-xs uppercase font-bold">Top Networks (ISP / ASN)</span>
          <span class="mono text-xs text-[var(--kr-muted)]">One-click Mute</span>
        </div>
        <ul class="divide-y divide-[var(--kr-border)] text-sm">
          ${
            topNetworks.length > 0
              ? topNetworks
                  .map(
                    ([net, count]) => `<li class="py-2.5 flex items-center justify-between gap-2">
                      <span class="font-semibold truncate">${escapeHtml(net)}</span>
                      <div class="flex items-center gap-2 shrink-0">
                        <span class="mono text-xs">${count}</span>
                        <button type="button" onclick="addMute('asn_org', '${escapeHtml(net)}')" class="mono text-xs uppercase px-2 py-1 border border-[var(--kr-border-strong)] rounded-[2px] hover:border-[var(--kr-accent)] cursor-pointer">Mute</button>
                      </div>
                    </li>`,
                  )
                  .join("")
              : `<li class="py-4 text-[var(--kr-muted)] text-xs mono">No network records in this range yet.</li>`
          }
        </ul>
      </div>
    </section>

    <!-- Visitor Journey Drawer -->
    <section
      id="journeyPanel"
      hidden
      class="border-2 border-[var(--kr-accent)] bg-[var(--kr-surface)] rounded-[4px] p-5 space-y-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--kr-border)] pb-3">
        <div class="flex items-center gap-3">
          <span class="mono text-xs uppercase px-2 py-1 bg-[var(--kr-accent)] text-[var(--kr-on-accent)] font-bold rounded-[2px]" id="journeyBadge"></span>
          <span class="font-bold text-sm" id="journeyMeta"></span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="muteSelectedVisitor()" class="mono text-xs uppercase px-3 py-1.5 border border-[var(--kr-border-strong)] bg-[var(--kr-bg)] rounded-[2px] cursor-pointer">
            🔕 Mute Visitor
          </button>
          <button type="button" onclick="deleteSelectedVisitor()" class="mono text-xs uppercase px-3 py-1.5 border border-[#C41E3A] text-[#C41E3A] bg-[var(--kr-bg)] rounded-[2px] cursor-pointer">
            🗑️ Delete All Hits for Visitor
          </button>
        </div>
      </div>
      <div id="journeySteps" class="grid grid-cols-1 md:grid-cols-4 gap-3"></div>
    </section>

    <!-- Live Feed Table -->
    <section aria-label="Live referral hits" class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="filterByChannel('all')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">All (${hits.length})</button>
          <button type="button" onclick="filterByChannel('human')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">Human (${humanHits.length})</button>
          <button type="button" onclick="filterByChannel('cv')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">📄 /cv</button>
          <button type="button" onclick="filterByChannel('resume_pdf')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">📥 PDF</button>
          <button type="button" onclick="filterByChannel('in')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">💼 /in</button>
          <button type="button" onclick="filterByChannel('labs')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">🧪 /labs</button>
          <button type="button" onclick="filterByChannel('bot')" class="mono text-xs uppercase px-3 py-2 rounded-[2px] border border-[var(--kr-border-strong)] cursor-pointer">🤖 Bots (${botHits.length})</button>
        </div>
        <input
          type="search"
          oninput="searchTable(this.value)"
          placeholder="Search #VisitorID, city, ISP, path..."
          class="px-3 py-2 text-sm rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-card)] w-full md:w-72"
        />
      </div>

      <div tabindex="0" role="region" aria-labelledby="hits-table-caption" class="table-region border border-[var(--kr-border)] rounded-[4px] bg-[var(--kr-card)]">
        <table class="w-full text-left border-collapse text-sm">
          <caption id="hits-table-caption" class="sr-only">Live referral hits from Cloudflare D1</caption>
          <thead>
            <tr class="bg-[var(--kr-surface-2)] border-b border-[var(--kr-border-strong)] mono text-xs uppercase text-[var(--kr-muted)]">
              <th scope="col" class="py-3 px-4">Visitor</th>
              <th scope="col" class="py-3 px-4">Channel & Path</th>
              <th scope="col" class="py-3 px-4">Location</th>
              <th scope="col" class="py-3 px-4">Device / Lang</th>
              <th scope="col" class="py-3 px-4">Network (ISP)</th>
              <th scope="col" class="py-3 px-4">Time (UTC+7)</th>
              <th scope="col" class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="hitsTableBody" class="divide-y divide-[var(--kr-border)]">
            ${hits
              .map((h) => {
                const vid = h.visitor_id ?? `#ANON${h.id}`;
                const loc = [h.city, h.region, h.country].filter(Boolean).join(", ") || "Unknown";
                const client = summarizeClient(h.user_agent);
                return `<tr class="hit-row hover:bg-[var(--kr-surface)] transition ${h.is_bot ? "opacity-70" : ""}"
                  data-id="${h.id}"
                  data-visitor="${escapeHtml(vid)}"
                  data-channel="${escapeHtml(h.channel)}"
                  data-path="${escapeHtml(h.path)}"
                  data-time="${escapeHtml(formatVnTime(h.created_at))}"
                  data-meta="${escapeHtml(`${countryFlag(h.country)} ${loc} · ${client} · ${h.asn_org ?? "Unknown ISP"}`)}"
                  data-bot="${h.is_bot}">
                  <th scope="row" class="py-3 px-4 font-normal">
                    <button type="button" onclick="inspectVisitor('${escapeHtml(vid)}')" class="mono text-xs font-bold px-2 py-1 rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-surface)] hover:border-[var(--kr-accent)] cursor-pointer">
                      ${escapeHtml(vid)}
                    </button>
                  </th>
                  <td class="py-3 px-4">
                    <span class="mono text-xs font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-[var(--kr-surface-2)] mr-1.5">${escapeHtml(h.channel)}</span>
                    <code class="mono text-xs">${escapeHtml(h.path)}</code>
                  </td>
                  <td class="py-3 px-4">${countryFlag(h.country)} ${escapeHtml(loc)}</td>
                  <td class="py-3 px-4">
                    <div>${escapeHtml(client)}</div>
                    <div class="mono text-xs text-[var(--kr-muted)]">${escapeHtml(h.language ?? "—")}</div>
                  </td>
                  <td class="py-3 px-4">${escapeHtml(h.asn_org ?? "Unknown ISP")}</td>
                  <td class="py-3 px-4 mono text-xs text-[var(--kr-muted)]">${escapeHtml(formatVnTime(h.created_at))}</td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" onclick="deleteHit(${h.id}, this)" class="mono text-xs uppercase text-[#C41E3A] hover:underline cursor-pointer">Delete</button>
                  </td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Bottom Management & Hygiene Panel -->
    <section aria-label="Database hygiene and mute rules" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
      <div class="bg-[var(--kr-surface)] border border-[var(--kr-border)] rounded-[4px] p-5 space-y-4">
        <div class="border-b border-[var(--kr-border)] pb-3">
          <span class="mono text-xs uppercase font-bold block">Discord Mute Rules (D1 radar_mutes)</span>
          <span class="text-xs text-[var(--kr-muted)]">Muted Visitor IDs or ISP/ASNs are still stored in D1 but will never ping Discord.</span>
        </div>
        <form onsubmit="submitMuteForm(event)" class="flex gap-2">
          <select id="muteKind" class="px-2 py-2 text-xs mono uppercase rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-card)]">
            <option value="visitor_id">Visitor ID</option>
            <option value="asn_org">ISP / ASN Name</option>
          </select>
          <input id="muteVal" type="text" required placeholder="e.g. #C33FD0 or Hetzner Online GmbH" class="flex-1 px-3 py-2 text-sm rounded-[2px] border border-[var(--kr-border-strong)] bg-[var(--kr-card)]" />
          <button type="submit" class="mono text-xs uppercase px-4 py-2 rounded-[2px] bg-[var(--kr-accent)] text-[var(--kr-on-accent)] font-bold cursor-pointer">+ Add</button>
        </form>
        <ul class="divide-y divide-[var(--kr-border)] text-sm">
          ${
            mutes.length > 0
              ? mutes
                  .map(
                    (m) => `<li class="py-2 flex items-center justify-between">
                      <span><code class="mono text-xs font-bold">${escapeHtml(m.value)}</code> <span class="mono text-xs text-[var(--kr-muted)]">(${escapeHtml(m.kind)})</span></span>
                      <button type="button" onclick="removeMute(${m.id}, this)" class="mono text-xs uppercase text-[#C41E3A] hover:underline cursor-pointer">Remove</button>
                    </li>`,
                  )
                  .join("")
              : `<li class="py-3 text-xs mono text-[var(--kr-muted)]">No active mute rules.</li>`
          }
        </ul>
      </div>

      <div class="bg-[var(--kr-surface)] border border-[var(--kr-border)] rounded-[4px] p-5 space-y-4">
        <div class="border-b border-[var(--kr-border)] pb-3">
          <span class="mono text-xs uppercase font-bold block">Cloudflare D1 Hygiene (portfolio-referrals)</span>
          <span class="text-xs text-[var(--kr-muted)]">Direct maintenance operations on your remote D1 database.</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button type="button" onclick="purgeBots()" class="p-3 text-left border border-[var(--kr-border-strong)] bg-[var(--kr-card)] rounded-[2px] hover:border-[var(--kr-accent)] cursor-pointer">
            <div class="mono text-xs uppercase font-bold">🧹 Purge All Bot Rows</div>
            <div class="text-xs text-[var(--kr-muted)] mt-1">DELETE WHERE is_bot = 1</div>
          </button>

          <button type="button" onclick="deleteVisitorById('${escapeHtml(currentVisitorId)}')" class="p-3 text-left border border-[var(--kr-border-strong)] bg-[var(--kr-card)] rounded-[2px] hover:border-[var(--kr-accent)] cursor-pointer">
            <div class="mono text-xs uppercase font-bold">🧼 Clean My Test Hits</div>
            <div class="text-xs text-[var(--kr-muted)] mt-1">DELETE visitor ${escapeHtml(currentVisitorId)}</div>
          </button>

          <a href="/__radar/api/export.csv" class="p-3 text-left border border-[var(--kr-border-strong)] bg-[var(--kr-card)] rounded-[2px] hover:border-[var(--kr-accent)] block">
            <div class="mono text-xs uppercase font-bold">📥 Export D1 to CSV</div>
            <div class="text-xs text-[var(--kr-muted)] mt-1">Download referral_hits.csv</div>
          </a>

          <button type="button" onclick="sendTestPing()" class="p-3 text-left border border-[var(--kr-border-strong)] bg-[var(--kr-card)] rounded-[2px] hover:border-[var(--kr-accent)] cursor-pointer">
            <div class="mono text-xs uppercase font-bold">🔔 Verify Discord Webhook</div>
            <div class="text-xs text-[var(--kr-muted)] mt-1">Send live 9-field test embed</div>
          </button>
        </div>
      </div>
    </section>
  </main>

  <script>
    let selectedVisitor = null;

    function showToast(title, body) {
      const b = document.getElementById("toastBanner");
      document.getElementById("toastTitle").textContent = title;
      document.getElementById("toastBody").textContent = body;
      b.hidden = false;
    }

    function toggleTheme() {
      const html = document.documentElement;
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      document.getElementById("themeBtn").textContent = next === "dark" ? "☀ Kit Room" : "◐ Night Stage";
      try { localStorage.setItem("radar_theme", next); } catch {}
    }
    try {
      if (localStorage.getItem("radar_theme") === "dark") toggleTheme();
    } catch {}

    function filterByChannel(ch) {
      document.querySelectorAll("#hitsTableBody .hit-row").forEach((row) => {
        if (ch === "all") row.hidden = false;
        else if (ch === "human") row.hidden = row.dataset.bot !== "0";
        else if (ch === "bot") row.hidden = row.dataset.bot !== "1";
        else row.hidden = row.dataset.channel !== ch;
      });
    }

    function searchTable(q) {
      const lower = q.toLowerCase();
      document.querySelectorAll("#hitsTableBody .hit-row").forEach((row) => {
        row.hidden = !row.textContent.toLowerCase().includes(lower);
      });
    }

    function inspectVisitor(vid) {
      selectedVisitor = vid;
      const rows = [...document.querySelectorAll("#hitsTableBody .hit-row")].filter((r) => r.dataset.visitor === vid).reverse();
      if (!rows.length) return;
      document.getElementById("journeyBadge").textContent = "VISITOR " + vid;
      document.getElementById("journeyMeta").textContent = rows[0].dataset.meta || "";
      const container = document.getElementById("journeySteps");
      container.innerHTML = rows.map((r, idx) =>
        '<div class="bg-[var(--kr-card)] border border-[var(--kr-border)] p-3 rounded-[2px] border-l-4 border-l-[#F5C400]">' +
        '<div class="mono text-xs text-[var(--kr-muted)]">STEP ' + String(idx + 1).padStart(2, "0") + ' · ' + r.dataset.time + '</div>' +
        '<div class="font-bold text-sm mt-1">' + r.dataset.path + '</div>' +
        '<div class="mono text-xs text-[var(--kr-muted)] mt-1">Channel: ' + r.dataset.channel + '</div>' +
        '</div>'
      ).join("");
      document.getElementById("journeyPanel").hidden = false;
    }

    async function deleteHit(id, btn) {
      const res = await fetch("/__radar/api/delete-hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        btn.closest("tr").remove();
        showToast("Deleted Hit", "Removed row #" + id + " from Cloudflare D1.");
      }
    }

    async function deleteVisitorById(visitorId) {
      const res = await fetch("/__radar/api/delete-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      if (res.ok) window.location.reload();
    }

    function deleteSelectedVisitor() {
      if (selectedVisitor) deleteVisitorById(selectedVisitor);
    }

    function muteSelectedVisitor() {
      if (selectedVisitor) addMute("visitor_id", selectedVisitor);
    }

    async function purgeBots() {
      const res = await fetch("/__radar/api/purge-bots", { method: "POST" });
      if (res.ok) window.location.reload();
    }

    async function addMute(kind, value) {
      const res = await fetch("/__radar/api/mutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, value }),
      });
      if (res.ok) window.location.reload();
    }

    function submitMuteForm(e) {
      e.preventDefault();
      addMute(document.getElementById("muteKind").value, document.getElementById("muteVal").value.trim());
    }

    async function removeMute(id, btn) {
      const res = await fetch("/__radar/api/mutes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) btn.closest("li").remove();
    }

    async function sendTestPing() {
      const res = await fetch("/__radar/api/test-webhook", { method: "POST" });
      if (res.ok) {
        showToast("⚡ Discord Ping Sent", "Delivered test 9-field rich embed to #portfolio-radar.");
      } else {
        showToast("Webhook Error", "Could not send test Discord alert.");
      }
    }

    async function logout() {
      await fetch("/__radar/auth/logout", { method: "POST" });
      window.location.reload();
    }
  </script>
</body>
</html>`;

  return htmlResponse(html);
}

export async function handleRadarRequest(
  request: CfRequest,
  env: WorkerEnv = {},
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/__radar";

  // 1. Public OTP Auth Endpoints
  if (path === "/__radar/auth/request-otp" && request.method === "POST") {
    if (!env.DB) return jsonResponse({ error: "D1 database is not bound." }, 500);
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = (body.email ?? "").trim().toLowerCase();

    if (!ALLOWED_ADMIN_EMAILS.has(email)) {
      return jsonResponse({ error: "Unauthorized email address." }, 403);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    // Clean expired OTPs first
    await env.DB.prepare(`DELETE FROM radar_otps WHERE expires_at <= ?`).bind(nowIso).run();

    const code = generateSixDigitOtp();
    const codeHash = await sha256Hex(code);
    const expiresIso = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");

    await env.DB.prepare(
      `INSERT INTO radar_otps (code_hash, ip, attempts, expires_at, created_at) VALUES (?, ?, 0, ?, ?)`,
    )
      .bind(codeHash, ip, expiresIso, nowIso)
      .run();

    await sendOtpEmail(env, code, ip);
    return jsonResponse({ ok: true, message: "Sent 6-digit OTP to phamanhduy.sg@gmail.com." });
  }

  if (path === "/__radar/auth/verify-otp" && request.method === "POST") {
    if (!env.DB) return jsonResponse({ error: "D1 database is not bound." }, 500);
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    const code = (body.code ?? "").trim();
    if (!/^[0-9]{6}$/.test(code)) {
      return jsonResponse({ error: "Enter a valid 6-digit code." }, 400);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const codeHash = await sha256Hex(code);

    const match = await env.DB.prepare(
      `SELECT id FROM radar_otps WHERE code_hash = ? AND expires_at > ? AND attempts < 5 LIMIT 1`,
    )
      .bind(codeHash, nowIso)
      .first<{ id: number }>();

    if (!match) {
      await env.DB.prepare(`UPDATE radar_otps SET attempts = attempts + 1 WHERE expires_at > ?`)
        .bind(nowIso)
        .run();
      return jsonResponse({ error: "Invalid or expired OTP code." }, 401);
    }

    // Consume all active OTPs and issue a 30-day session
    await env.DB.prepare(`DELETE FROM radar_otps`).bind().run();
    const sessionToken = generateSessionToken();
    const tokenHash = await sha256Hex(sessionToken);
    const expiresAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();

    await env.DB.prepare(
      `INSERT INTO radar_sessions (token_hash, email, user_agent, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(tokenHash, "phamanhduy.sg@gmail.com", request.headers.get("user-agent"), expiresAt, nowIso)
      .run();

    return jsonResponse(
      { ok: true },
      200,
      {
        "Set-Cookie": `${SESSION_COOKIE_NAME}=${sessionToken}; Max-Age=2592000; Path=/__radar; HttpOnly; SameSite=Strict; Secure`,
      },
    );
  }

  if (path === "/__radar/auth/logout" && request.method === "POST") {
    const session = await getAuthenticatedSession(request, env.DB);
    if (session && env.DB) {
      await env.DB.prepare(`DELETE FROM radar_sessions WHERE token_hash = ?`).bind(session.tokenHash).run();
    }
    return jsonResponse(
      { ok: true },
      200,
      {
        "Set-Cookie": `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/__radar; HttpOnly; SameSite=Strict; Secure`,
      },
    );
  }

  // 2. Verify Session for UI and Management APIs
  const session = await getAuthenticatedSession(request, env.DB);
  if (!session) {
    if (path.startsWith("/__radar/api/")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    return htmlResponse(renderLoginPage(), 200);
  }

  // 3. Authenticated Management APIs
  if (path === "/__radar/api/delete-hit" && request.method === "POST" && env.DB) {
    const { id } = (await request.json().catch(() => ({}))) as { id?: number };
    if (typeof id === "number") {
      await env.DB.prepare(`DELETE FROM referral_hits WHERE id = ?`).bind(id).run();
    }
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/delete-visitor" && request.method === "POST" && env.DB) {
    const { visitorId } = (await request.json().catch(() => ({}))) as { visitorId?: string };
    if (visitorId) {
      await env.DB.prepare(`DELETE FROM referral_hits WHERE visitor_id = ?`).bind(visitorId).run();
    }
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/purge-bots" && request.method === "POST" && env.DB) {
    await env.DB.prepare(`DELETE FROM referral_hits WHERE is_bot = 1`).bind().run();
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/mutes" && request.method === "POST" && env.DB) {
    const { kind, value } = (await request.json().catch(() => ({}))) as { kind?: string; value?: string };
    if ((kind === "visitor_id" || kind === "asn_org") && value?.trim()) {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO radar_mutes (kind, value, created_at) VALUES (?, ?, ?)`,
      )
        .bind(kind, value.trim(), new Date().toISOString())
        .run();
    }
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/mutes" && request.method === "DELETE" && env.DB) {
    const { id } = (await request.json().catch(() => ({}))) as { id?: number };
    if (typeof id === "number") {
      await env.DB.prepare(`DELETE FROM radar_mutes WHERE id = ?`).bind(id).run();
    }
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/test-webhook" && request.method === "POST") {
    if (!env.DISCORD_WEBHOOK_URL) {
      return jsonResponse({ error: "DISCORD_WEBHOOK_URL not configured" }, 400);
    }
    await fetchImpl(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🔔 Radar Dashboard — Webhook Verification Ping",
            color: 0x2f9e8f,
            fields: [
              { name: "Triggered By", value: `\`${session.email}\``, inline: true },
              { name: "Path", value: "`/__radar`", inline: true },
              { name: "Status", value: "D1 & Discord Connected", inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    return jsonResponse({ ok: true });
  }

  if (path === "/__radar/api/export.csv" && request.method === "GET" && env.DB) {
    const res = await env.DB.prepare(
      `SELECT id, visitor_id, channel, path, country, city, region, asn_org, language, referer, is_bot, created_at
       FROM referral_hits ORDER BY id DESC LIMIT 2000`,
    )
      .bind()
      .all<HitRow>();
    const rows = res.results ?? [];
    const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = "id,visitor_id,channel,path,country,city,region,asn_org,language,referer,is_bot,created_at";
    const lines = rows.map((r) =>
      [
        r.id,
        r.visitor_id,
        r.channel,
        r.path,
        r.country,
        r.city,
        r.region,
        r.asn_org,
        r.language,
        r.referer,
        r.is_bot,
        r.created_at,
      ]
        .map(csvEscape)
        .join(","),
    );
    return new Response([header, ...lines].join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="portfolio-referrals.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  return renderDashboardPage(request, env, session.email);
}
