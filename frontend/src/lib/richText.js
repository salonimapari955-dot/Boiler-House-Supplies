// Shared helpers for product descriptions that may contain the limited HTML
// produced by the admin rich-text editor. Existing plain-text descriptions keep
// working unchanged.

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "div",
  "span",
  "blockquote",
]);

const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "img",
  "svg",
  "math",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "video",
  "audio",
  "source",
  "canvas",
]);

const HTML_PATTERN = /<\/?[a-z][^>]*>/i;

export function isHtmlContent(value) {
  return typeof value === "string" && HTML_PATTERN.test(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/**
 * Converts an editor value into a plain string. Used for empty-state checks and
 * compact previews where HTML markup should never be shown to the visitor.
 */
export function getPlainText(value) {
  if (typeof value !== "string") return "";

  const text = value.replace(/\u00a0/g, " ");

  if (!isHtmlContent(text)) return text.trim();

  const withBreaks = text
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ");

  if (typeof DOMParser === "undefined") {
    return withBreaks.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const documentNode = new DOMParser().parseFromString(
    withBreaks,
    "text/html",
  );

  documentNode.querySelectorAll("script,style").forEach((node) => node.remove());

  return (documentNode.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Removes anything outside the small formatting subset supported by the
 * product description editor. All attributes are dropped as well, so stored
 * descriptions cannot inject scripts, event handlers or inline styles.
 */
export function sanitizeHtml(value) {
  if (typeof value !== "string" || !isHtmlContent(value)) return "";
  if (typeof DOMParser === "undefined") return "";

  const documentNode = new DOMParser().parseFromString(value, "text/html");

  function clean(node) {
    Array.from(node.childNodes).forEach((child) => {
      // Comments are unnecessary and can hide markup from the sanitizer.
      if (child.nodeType === 8) {
        child.remove();
        return;
      }

      if (child.nodeType !== 1) return;

      const tag = child.tagName.toLowerCase();

      if (BLOCKED_TAGS.has(tag)) {
        child.remove();
        return;
      }

      clean(child);

      if (!ALLOWED_TAGS.has(tag)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }

      Array.from(child.attributes).forEach((attribute) => {
        child.removeAttribute(attribute.name);
      });
    });
  }

  clean(documentNode.body);

  return documentNode.body.innerHTML;
}

/**
 * Existing plain-text descriptions are escaped and line breaks are preserved
 * when they are loaded into the contenteditable editor.
 */
export function toEditorHtml(value) {
  if (typeof value !== "string" || !value) return "";
  if (isHtmlContent(value)) return sanitizeHtml(value);

  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}
