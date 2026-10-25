import type { ResumeData, ResumeRoleView } from "./transform";

/**
 * Single-column ATS resume. Reproduces the approved resume.html: same markup,
 * same print CSS, same text. Line breaks inside the contact line are kept so
 * the extracted text matches the approved text line for line.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STYLE = `
  /* Font: the spec asks for Inter self-hosted; no font file is in the repo,
     so this uses the spec's own fallback (Arial, Helvetica). */
  @page { size: A4; margin: 13mm 17mm; }
  :root {
    --ink: #111;
    --meta: #444;
    --accent: #111;
    --rule: #bbb;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #fff;
    color: var(--ink);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.3;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "calt" 0;
    -webkit-font-smoothing: antialiased;
  }
  /* Screen preview only: show an A4 sheet. Print uses @page margins. */
  @media screen {
    body { background: #e9e9e9; padding: 24px 16px; }
    .page { background: #fff; max-width: 210mm; margin: 0 auto; padding: 13mm 17mm; box-shadow: 0 1px 4px rgba(0,0,0,.15); }
  }
  a { color: inherit; text-decoration: none; }
  p, ul, h1, h2, h3 { margin: 0; }

  .name { font-size: 20pt; font-weight: 600; line-height: 1.15; }
  .title { font-size: 11pt; margin-top: 2pt; }
  .meta { color: var(--meta); margin-top: 2pt; }

  h2 {
    font-size: 11pt;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0;
    text-transform: none;
    border-bottom: 0.5pt solid var(--rule);
    padding-bottom: 1.5pt;
    margin: 6.5pt 0 2.5pt;
  }

  .role { margin-top: 5pt; }
  .role:first-of-type { margin-top: 0; }
  /* Title and dates stay in one left-aligned text flow (no flex/float) so
     block-grouping ATS parsers keep the dates next to their role. */
  .role-line { font-size: 10.5pt; font-weight: 600; }
  .dates { font-weight: 400; color: var(--meta); }
  .context { color: var(--meta); }
  .scope { margin-top: 1.5pt; }

  /* Literal bullet glyph in the text layer, so parsers can split achievements. */
  ul { list-style: none; padding-left: 0; margin-top: 2pt; }
  li { padding-left: 10pt; text-indent: -10pt; margin-top: 1pt; }
  li::before { content: "\\2022"; display: inline-block; width: 10pt; text-indent: 0; }

  .skills p { margin-top: 1.5pt; }
  .skills p:first-child { margin-top: 0; }
  .label { font-weight: 600; }
`;

function renderRole(role: ResumeRoleView): string {
  const scope = role.scope ? `\n    <p class="scope">Scope: ${escapeHtml(role.scope)}</p>` : "";
  const context = role.context ? `\n    <div class="context">${escapeHtml(role.context)}</div>` : "";
  const bullets = role.bullets.map((b) => `      <li>${escapeHtml(b)}</li>`).join("\n");
  return `  <div class="role">
    <div class="role-line">${escapeHtml(role.jobTitle)} | ${escapeHtml(role.companyName)} <span class="dates">| ${escapeHtml(role.dates)}</span></div>${scope}${context}
    <ul>
${bullets}
    </ul>
  </div>`;
}

export function renderTemplate(data: ResumeData): string {
  const links = data.links
    .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join(" ·\n    ");
  const skills = data.skillLines
    .map((line) => `    <p><span class="label">${escapeHtml(line.label)}:</span> ${escapeHtml(line.text)}</p>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.name)} Resume</title>
<style>${STYLE}</style>
</head>
<body>
<div class="page">

  <div class="name">${escapeHtml(data.name)}</div>
  <div class="title">${escapeHtml(data.titleLine)}</div>
  <div class="meta">${escapeHtml(data.locationLine)}</div>
  <div class="meta">
    ${links}
  </div>

  <h2>Summary</h2>
  <p>${escapeHtml(data.summary)}</p>

  <h2>Experience</h2>

${data.roles.map(renderRole).join("\n\n")}

  <h2>Skills</h2>
  <div class="skills">
${skills}
  </div>

  <h2>Certifications</h2>
  <div class="skills">
    <p>${escapeHtml(data.certifications.join(" · "))}</p>
  </div>

  <h2>Education</h2>
  <p>${escapeHtml(data.education)}</p>

</div>
</body>
</html>
`;
}
