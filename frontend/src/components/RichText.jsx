import {
  getPlainText,
  isHtmlContent,
  sanitizeHtml,
} from "../lib/richText.js";

/**
 * Renders a product description. Rich text is sanitized before display, while
 * older plain-text descriptions retain their line breaks.
 */
export default function RichText({ value, className = "", as: Tag = "div" }) {
  if (value === null || value === undefined || value === "") return null;

  const classes = ["rich-text", className].filter(Boolean).join(" ");

  if (typeof value !== "string") {
    return <Tag className={classes}>{value}</Tag>;
  }

  if (!isHtmlContent(value)) {
    return <Tag className={`${classes} whitespace-pre-line`}>{value}</Tag>;
  }

  const html = sanitizeHtml(value);

  if (!getPlainText(html)) return null;

  return (
    <Tag
      className={classes}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
