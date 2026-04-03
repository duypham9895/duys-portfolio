import type { ResumeData } from "./transform";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTemplate(data: ResumeData): string {
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

  const productsHtml = data.products
    .map(
      (p) => `
        <div class="product-card">
          <div class="product-top">
            <span class="product-name">${escapeHtml(p.name)}</span>
            <span class="product-scope">${escapeHtml(p.scope)}</span>
          </div>
          <div class="product-desc">${escapeHtml(p.description)}</div>
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
      line-height: 1.5;
      color: #2d2d2d;
      background: #ffffff;
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
    }

    /* ─── Sidebar ─── */
    .sidebar {
      width: 66mm;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 32px 16px 32px 20px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }

    .sidebar a {
      color: #c0c0c0;
    }

    .sidebar-name {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.15;
      margin-bottom: 4px;
    }

    .sidebar-title {
      font-size: 10px;
      font-weight: 600;
      color: #FA5252;
      letter-spacing: 0.3px;
      margin-bottom: 28px;
      line-height: 1.4;
    }

    .sidebar-section {
      margin-bottom: 24px;
    }

    .sidebar-section:last-child {
      margin-bottom: 0;
    }

    .sidebar-section-title {
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      color: #FA5252;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(250, 82, 82, 0.25);
    }

    /* Contact */
    .contact-item {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 9px;
      font-size: 8.5px;
      line-height: 1.4;
      color: #c0c0c0;
    }

    .contact-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: rgba(250, 82, 82, 0.12);
      color: #FA5252;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      flex-shrink: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Skills in sidebar */
    .sidebar-skill-group {
      margin-bottom: 14px;
    }

    .sidebar-skill-group:last-child {
      margin-bottom: 0;
    }

    .sidebar-skill-label {
      font-size: 8.5px;
      font-weight: 600;
      color: #ffffff;
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
      color: #d0d0d0;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 3px;
      padding: 3px 7px;
      line-height: 1.3;
    }

    /* Certifications in sidebar */
    .cert-row {
      margin-bottom: 10px;
    }

    .cert-row:last-child {
      margin-bottom: 0;
    }

    .cert-name {
      font-size: 8px;
      color: #e0e0e0;
      line-height: 1.4;
      font-weight: 500;
    }

    .cert-detail {
      font-size: 7px;
      color: #777;
      margin-top: 2px;
    }

    /* ─── Main Content ─── */
    .main {
      flex: 1;
      padding: 32px 28px 32px 26px;
      display: flex;
      flex-direction: column;
    }

    .main-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #1a1a2e;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #FA5252;
    }

    /* Highlights */
    .highlights-section {
      margin-bottom: 22px;
    }

    .highlights-grid {
      display: flex;
      gap: 10px;
    }

    .highlight-card {
      flex: 1;
      text-align: center;
      padding: 12px 6px 10px;
      background: #f8f8fa;
      border-radius: 6px;
      border: 1px solid #eeeef0;
    }

    .highlight-metric {
      font-size: 20px;
      font-weight: 800;
      color: #FA5252;
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .highlight-label {
      font-size: 6.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
    }

    /* Summary */
    .summary-section {
      margin-bottom: 22px;
    }

    .summary-text {
      font-size: 10px;
      color: #444;
      line-height: 1.7;
    }

    /* Experience */
    .experience-section {
      flex: 1;
    }

    .exp-item {
      margin-bottom: 22px;
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
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .exp-company {
      font-size: 10px;
      color: #FA5252;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .exp-dates {
      font-size: 9px;
      color: #999;
      white-space: nowrap;
      font-weight: 500;
    }

    .exp-bullets {
      padding-left: 16px;
    }

    .exp-bullets li {
      font-size: 9.5px;
      color: #444;
      line-height: 1.7;
      margin-bottom: 5px;
    }

    .exp-bullets li:last-child {
      margin-bottom: 0;
    }

    .exp-bullets li::marker {
      color: #FA5252;
      font-size: 8px;
    }

    /* Products */
    .products-section {
      margin-top: 22px;
    }

    .products-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .product-card {
      padding: 10px 14px;
      background: #f8f8fa;
      border-radius: 6px;
      border-left: 3px solid #FA5252;
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
      color: #1a1a2e;
    }

    .product-scope {
      font-size: 8px;
      color: #999;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-desc {
      font-size: 9px;
      color: #555;
      line-height: 1.55;
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="sidebar-name">${escapeHtml(data.name)}</div>
      <div class="sidebar-title">${escapeHtml(data.title)}</div>

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
        <div class="contact-item">
          <span class="contact-icon">L</span>
          <span>${escapeHtml(data.contact.location)}</span>
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

      <section class="products-section">
        <div class="main-section-title">Products I Own</div>
        <div class="products-grid">
          ${productsHtml}
        </div>
      </section>
    </main>
  </div>
</body>
</html>`;
}
