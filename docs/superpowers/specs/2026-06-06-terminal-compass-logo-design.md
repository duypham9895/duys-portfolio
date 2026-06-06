# Terminal Compass Logo Design

## Goal

Replace the current `DP` gradient favicon with a more distinctive identity for `duypham.me`. The new logo should feel like a compact product-command mark for a software-engineer-turned-product-manager: technical, directional, personal, and less template-like.

## Current Problem

The current favicon is a red-pink gradient circle with white `DP` text. It is readable, but it feels generic and disconnected from the site's warm earth-tone visual system.

The new mark should avoid:

- Literal `DP` text inside a badge.
- Startup-style red/pink gradients.
- Decorative shapes that do not connect to Duy's story.
- A mark that works only at large sizes.

## Approved Direction

Use the **Terminal Compass** concept from the original option 1 anatomy.

The mark combines:

- A rounded-square technical container.
- A clear `D` silhouette as the main structural read.
- An orange command arrow that implies direction, product judgment, and a hidden `P` gesture.
- A mustard underline that references a terminal prompt, engineering origin, and action line.

The `P` should remain implied rather than forced into a literal second letter. The user explicitly rejected revisions that made the `P` more visible because they reduced the originality of the original mark.

## Brand Meaning

The logo should communicate:

- **System literacy:** Duy can read and reason through technical systems.
- **Product direction:** Duy can turn ambiguity into decisions and shipped work.
- **Engineering origin:** The underline and command-like arrow reference terminal/console language.
- **Personal signature:** The `D` anchors the mark to Duy without making it a plain monogram.

Working interpretation: **D as system, arrow as product decision, underline as engineering origin.**

## Visual Specification

Use the existing site palette:

- Outer/background dark: `#252220` or token equivalent `var(--surface)` in dark contexts.
- Light stroke: `#f2ede4` or token equivalent `var(--text)` in dark contexts.
- Primary arrow/accent: `#e07a3e` or `var(--accent)` in dark mode.
- Secondary underline: `#d4b05a` or `var(--accent-2)` in dark mode.

Shape characteristics:

- Rounded-square container, not a circle.
- Thick simple strokes that survive favicon scale.
- No text nodes inside the SVG.
- No gradients.
- No decorative shadows.
- Maintain clear contrast in both light and dark browser contexts.

## Usage

### Favicon

Primary use. The favicon should render as a standalone SVG in `public/favicon.svg`.

At small size, prioritize:

- The rounded-square container.
- The white `D` silhouette.
- The orange arrow.

The mustard underline may remain if it is visually clear at 16px. If it blurs or crowds the mark, it can be simplified or removed only for the tiny favicon variant.

### Sidebar Signature

Optional use. The mark can appear in the sidebar as a compact signature near the profile identity, but it should not compete with the avatar.

If used, pair it with:

- `Duy Pham`
- A small descriptor such as `Product x engineering`

If the sidebar feels cleaner without a visible logo, keep the logo favicon-only.

### Labs / Domain Lockup

Future use. The mark can pair with `duypham.me` or `Duy Labs` as an umbrella identity for projects, experiments, and subdomains.

## Implementation Scope

The first implementation should stay small:

- Replace `public/favicon.svg` with the approved Terminal Compass SVG.
- Add reusable SVG markup only if the logo is also introduced in the visible sidebar UI.
- Do not redesign the page layout.
- Do not change the avatar treatment unless needed for balance.
- Do not introduce new brand colors beyond the current palette.

## Testing and Verification

Verify:

- `npm run build` passes.
- The favicon loads in the browser.
- The favicon remains legible at 16px, 32px, and browser-tab scale.
- The mark looks intentional against both light and dark site themes.
- If the sidebar signature is added, the sidebar remains visually balanced on desktop and mobile.

## Decisions Made

- Chosen direction: original **Terminal Compass** anatomy.
- Rejected: literal `DP` badge.
- Rejected: revised variants that made the `P` explicit.
- Rejected: generic gradient icon styling.
- Favored: hidden/implied initials, technical signal language, and a compact favicon-first mark.
