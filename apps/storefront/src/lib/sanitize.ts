const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "code",
  "pre",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

const DANGEROUS_CONTAINER_REGEX =
  /<\s*(script|style|iframe|object|embed|svg|math|noscript|template|textarea|title)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeUrl(rawUrl: string, allowMailto: boolean): boolean {
  const normalized = rawUrl.replace(/[\u0000-\u0020]+/g, "").toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith("/") && !normalized.startsWith("//")) return true;
  if (normalized.startsWith("#")) return true;
  if (normalized.startsWith("https://") || normalized.startsWith("http://")) return true;
  if (allowMailto && normalized.startsWith("mailto:")) return true;
  return false;
}

function sanitizeAttributes(tagName: string, rawAttrs: string): string {
  if (!rawAttrs.trim()) return "";

  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9:-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    if (!match[1]) continue;
    const name = match[1].toLowerCase();
    const val = (match[2] ?? match[3] ?? match[4] ?? "").trim();

    if (name.startsWith("on") || name === "style" || name === "srcdoc") {
      continue;
    }

    if (tagName === "a") {
      if (name === "href" && isSafeUrl(val, true)) {
        attrs.href = val;
      } else if (name === "title") {
        attrs.title = val;
      } else if (name === "target" && (val === "_blank" || val === "_self")) {
        attrs.target = val;
      }
    } else if (tagName === "img") {
      if (name === "src" && isSafeUrl(val, false)) {
        attrs.src = val;
      } else if (name === "alt" || name === "title") {
        attrs[name] = val;
      } else if ((name === "width" || name === "height") && /^\d{1,4}$/.test(val)) {
        attrs[name] = val;
      }
    } else if (name === "dir" && (val === "ltr" || val === "rtl" || val === "auto")) {
      attrs.dir = val;
    } else if (name === "lang" && /^[a-zA-Z-]{2,16}$/.test(val)) {
      attrs.lang = val;
    }
  }

  if (tagName === "a" && attrs.target === "_blank") {
    attrs.rel = "noopener noreferrer";
  }

  const serialized = Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
    .join(" ");

  return serialized ? ` ${serialized}` : "";
}

/**
 * Sanitizes editorial HTML rendered from the database so only safe formatting
 * markup and vetted URLs survive, preventing stored XSS.
 */
export function sanitizeEditorialHtml(html: string | null | undefined): string {
  if (!html) return "";

  let cleaned = String(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(DANGEROUS_CONTAINER_REGEX, "");

  cleaned = cleaned.replace(/<\s*(\/?)\s*([a-zA-Z0-9-]+)([^>]*)>/g, (_full, slash: string, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }
    if (slash) {
      return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    }
    const safeAttrs = sanitizeAttributes(tag, rawAttrs || "");
    return VOID_TAGS.has(tag) ? `<${tag}${safeAttrs} />` : `<${tag}${safeAttrs}>`;
  });

  return cleaned;
}
