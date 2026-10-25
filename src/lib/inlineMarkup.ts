/**
 * Renders the two inline marks used in src/data copy to HTML:
 * `**text**` → a highlight element, `[text](#id)` → an in-page link.
 * Everything else is HTML-escaped, so data strings can never inject markup.
 */
export interface InlineMarkupOptions {
  /** Opening/closing tags for `**text**`. Defaults to <strong>. */
  readonly strong?: readonly [open: string, close: string];
}

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export function renderInline(text: string, options: InlineMarkupOptions = {}): string {
  const [open, close] = options.strong ?? ["<strong>", "</strong>"];
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, (_, inner: string) => `${open}${inner}${close}`)
    .replace(/\[([^\]]+)\]\((#[\w-]+)\)/g, (_, label: string, href: string) => `<a href="${href}">${label}</a>`);
}
