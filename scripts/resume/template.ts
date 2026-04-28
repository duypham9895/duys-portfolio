import type { ResumeData } from "./transform";

export type ResumeTheme = "light" | "dark";

interface Palette {
  readonly pageBg: string;
  readonly surface: string;
  readonly surfaceAlt: string;
  readonly text: string;
  readonly muted: string;
  readonly mutedSoft: string;
  readonly border: string;
  readonly accent: string;
  readonly accent2: string;
  readonly accentSoftBg: string;
}

const PALETTES: Record<ResumeTheme, Palette> = {
  light: {
    pageBg: "#fbfaf7",
    surface: "#f2ede4",
    surfaceAlt: "#eae3d5",
    text: "#1f1d1a",
    muted: "#8b7355",
    mutedSoft: "#a8946f",
    border: "#e2d9c8",
    accent: "#b8541f",
    accent2: "#b8923a",
    accentSoftBg: "rgba(184, 84, 31, 0.10)",
  },
  dark: {
    pageBg: "#1a1816",
    surface: "#252220",
    surfaceAlt: "#302c29",
    text: "#f2ede4",
    muted: "#a8946f",
    mutedSoft: "#8b7355",
    border: "#3a352f",
    accent: "#e07a3e",
    accent2: "#d4b05a",
    accentSoftBg: "rgba(224, 122, 62, 0.12)",
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTemplate(data: ResumeData, theme: ResumeTheme = "light"): string {
  const p = PALETTES[theme];

  const highlightsHtml = data.highlights
    .map(
      (h) => `
        <div class="highlight-card">
          <div class="highlight-metric">${escapeHtml(h.metric)}</div>
          <div class="highlight-label">${escapeHtml(h.label)}</div>
        </div>`
    )
    .join("\n");

  const experienceHtml = data.experience
    .map(
      (exp) => `
        <div class="exp-item">
          <div class="exp-top">
            <div class="exp-role">${escapeHtml(exp.title)}</div>
            <div class="exp-dates">${escapeHtml(exp.dates)}</div>
          </div>
          <div class="exp-company">${escapeHtml(exp.company)}</div>
          <ul class="exp-bullets">
            ${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n            ")}
          </ul>
        </div>`
    )
    .join("\n");

  const skillsHtml = data.skillGroups
    .map(
      (group) => `
        <div class="sidebar-skill-group">
          <div class="sidebar-skill-label">${escapeHtml(group.category)}</div>
          <div class="sidebar-skill-items">
            ${group.skills.map((s) => `<span class="sidebar-skill">${escapeHtml(s)}</span>`).join("")}
          </div>
        </div>`
    )
    .join("\n");

  const certsHtml = data.certifications
    .map(
      (cert) => `
        <div class="cert-row">
          <div class="cert-name">${escapeHtml(cert.name)}</div>
          <div class="cert-detail">${escapeHtml(cert.org)} &middot; ${escapeHtml(cert.year)}</div>
        </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.name)} — Resume</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10px;
      line-height: 1.45;
      color: ${p.text};
      background: ${p.pageBg};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* ─── Page Layout ─── */
    .page {
      width: 210mm;
      height: 297mm;
      display: flex;
      background: ${p.pageBg};
    }

    /* ─── Sidebar ─── */
    .sidebar {
      width: 66mm;
      background: ${p.surface};
      color: ${p.text};
      padding: 24px 16px 24px 20px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }

    .sidebar a {
      color: ${p.text};
    }

    .sidebar-name {
      font-size: 22px;
      font-weight: 700;
      color: ${p.text};
      line-height: 1.15;
      margin-bottom: 3px;
    }

    .sidebar-title {
      font-size: 10px;
      font-weight: 600;
      color: ${p.accent};
      letter-spacing: 0.3px;
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .sidebar-location {
      font-size: 9px;
      font-weight: 500;
      color: ${p.muted};
      margin-bottom: 20px;
      letter-spacing: 0.2px;
    }

    .sidebar-section {
      margin-bottom: 18px;
    }

    .sidebar-section:last-child {
      margin-bottom: 0;
    }

    .sidebar-section-title {
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      color: ${p.accent};
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid ${p.border};
    }

    /* Contact */
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 7px;
      font-size: 8.5px;
      line-height: 1.3;
      color: ${p.text};
    }

    .contact-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: ${p.accentSoftBg};
      color: ${p.accent};
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      flex-shrink: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Skills in sidebar */
    .sidebar-skill-group {
      margin-bottom: 10px;
    }

    .sidebar-skill-group:last-child {
      margin-bottom: 0;
    }

    .sidebar-skill-label {
      font-size: 8.5px;
      font-weight: 600;
      color: ${p.text};
      margin-bottom: 6px;
      letter-spacing: 0.2px;
    }

    .sidebar-skill-items {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .sidebar-skill {
      display: inline-block;
      font-size: 7.5px;
      color: ${p.text};
      background: ${p.surfaceAlt};
      border: 1px solid ${p.border};
      border-radius: 3px;
      padding: 3px 7px;
      line-height: 1.3;
    }

    /* Certifications in sidebar */
    .cert-row {
      margin-bottom: 7px;
    }

    .cert-row:last-child {
      margin-bottom: 0;
    }

    .cert-name {
      font-size: 8px;
      color: ${p.text};
      line-height: 1.4;
      font-weight: 500;
    }

    .cert-detail {
      font-size: 7px;
      color: ${p.muted};
      margin-top: 2px;
    }

    /* ─── Main Content ─── */
    .main {
      flex: 1;
      padding: 24px 28px 24px 26px;
      display: flex;
      flex-direction: column;
      background: ${p.pageBg};
    }

    .main-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: ${p.text};
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${p.accent};
    }

    /* Highlights */
    .highlights-section {
      margin-bottom: 16px;
    }

    .highlights-grid {
      display: flex;
      gap: 10px;
    }

    .highlight-card {
      flex: 1;
      text-align: center;
      padding: 10px 6px 8px;
      background: ${p.surface};
      border-radius: 6px;
      border: 1px solid ${p.border};
    }

    .highlight-metric {
      font-size: 18px;
      font-weight: 800;
      color: ${p.accent};
      line-height: 1.1;
      margin-bottom: 2px;
    }

    .highlight-label {
      font-size: 6.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${p.muted};
    }

    /* Summary */
    .summary-section {
      margin-bottom: 16px;
    }

    .summary-text {
      font-size: 9.5px;
      color: ${p.text};
      line-height: 1.6;
    }

    /* Experience */
    .experience-section {
      /* no flex: 1 — let content flow naturally so Products section stays tight */
    }

    .exp-item {
      margin-bottom: 16px;
    }

    .exp-item:last-child {
      margin-bottom: 0;
    }

    .exp-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .exp-role {
      font-size: 11.5px;
      font-weight: 700;
      color: ${p.text};
    }

    .exp-company {
      font-size: 10px;
      color: ${p.accent};
      font-weight: 500;
      margin-bottom: 5px;
    }

    .exp-dates {
      font-size: 9px;
      color: ${p.muted};
      white-space: nowrap;
      font-weight: 500;
    }

    .exp-bullets {
      padding-left: 16px;
    }

    .exp-bullets li {
      font-size: 9px;
      color: ${p.text};
      line-height: 1.6;
      margin-bottom: 3px;
    }

    .exp-bullets li:last-child {
      margin-bottom: 0;
    }

    .exp-bullets li::marker {
      color: ${p.accent2};
      font-size: 8px;
    }

    /* Products */
    .products-section {
      margin-top: 16px;
    }

    .products-grid {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .product-card {
      padding: 8px 12px;
      background: ${p.surface};
      border-radius: 6px;
      border-left: 3px solid ${p.accent};
    }

    .product-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
    }

    .product-name {
      font-size: 10px;
      font-weight: 700;
      color: ${p.text};
    }

    .product-scope {
      font-size: 8px;
      color: ${p.muted};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-desc {
      font-size: 8.5px;
      color: ${p.text};
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="sidebar-name">${escapeHtml(data.name)}</div>
      <div class="sidebar-title">${escapeHtml(data.title)}</div>
      <div class="sidebar-location">${escapeHtml(data.contact.location)}</div>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Contact</div>
        <div class="contact-item">
          <span class="contact-icon">E</span>
          <a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a>
        </div>
        <div class="contact-item">
          <span class="contact-icon">P</span>
          <span>${escapeHtml(data.contact.phone)}</span>
        </div>
        ${data.links
          .map(
            (link) =>
              `<div class="contact-item"><span class="contact-icon">${link.label === "LinkedIn" ? "in" : link.label === "GitHub" ? "G" : "W"}</span><a href="${escapeHtml(link.url)}">${escapeHtml(link.url.replace("https://www.", "").replace("https://", ""))}</a></div>`
          )
          .join("\n        ")}
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Skills</div>
        ${skillsHtml}
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Certifications</div>
        ${certsHtml}
      </div>
    </aside>

    <main class="main">
      <section class="highlights-section">
        <div class="main-section-title">Highlights</div>
        <div class="highlights-grid">
          ${highlightsHtml}
        </div>
      </section>

      <section class="summary-section">
        <div class="main-section-title">Summary</div>
        <p class="summary-text">${escapeHtml(data.summary)}</p>
      </section>

      <section class="experience-section">
        <div class="main-section-title">Experience</div>
        ${experienceHtml}
      </section>
    </main>
  </div>
</body>
</html>`;
}
