import { useEffect, useRef } from "react";
import { toEditorHtml } from "../../lib/richText.js";

function ListIcon({ ordered = false, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ordered ? (
        <>
          <path d="M10 6h10M10 12h10M10 18h10" />
          <path d="M4 5h2v4M4 9h3" />
          <path d="M4 14h2.5a1.5 1.5 0 0 1 0 3H4v1h3" />
        </>
      ) : (
        <>
          <path d="M9 6h11M9 12h11M9 18h11" />
          <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

const TOOLS = [
  {
    command: "bold",
    label: "Bold",
    content: <span className="text-[15px] font-bold leading-none">B</span>,
  },
  {
    command: "italic",
    label: "Italic",
    content: <span className="font-serif text-[16px] italic leading-none">I</span>,
  },
  {
    command: "insertUnorderedList",
    label: "Bullet list",
    content: <ListIcon />,
  },
  {
    command: "insertOrderedList",
    label: "Numbered list",
    content: <ListIcon ordered />,
  },
];

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "",
  describedBy,
  invalid = false,
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || document.activeElement === editor) return;

    const nextHtml = toEditorHtml(value);

    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [value]);

  function emitChange() {
    onChange?.(editorRef.current?.innerHTML || "");
  }

  function runCommand(command) {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();
    // Prefer semantic tags (<b>, <i>, <ul>, <ol>) over inline styles so the
    // saved HTML remains clean and the storefront sanitizer can render it.
    document.execCommand("defaultParagraphSeparator", false, "p");
    document.execCommand("styleWithCSS", false, false);
    document.execCommand(command, false);
    emitChange();
  }

  function handlePaste(event) {
    // Paste as plain text so external markup cannot bypass the supported
    // formatting options or introduce unsafe HTML.
    event.preventDefault();

    const text = event.clipboardData?.getData("text/plain") || "";

    if (text) {
      document.execCommand("insertText", false, text);
      emitChange();
    }
  }

  return (
    <div
      className={`mt-1.5 overflow-hidden rounded-xl border bg-slate-50/70 transition-colors focus-within:bg-white focus-within:ring-4 ${
        invalid
          ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
          : "border-slate-200 focus-within:border-slate-900 focus-within:ring-slate-900/10"
      }`}
    >
      <div
        role="toolbar"
        aria-label="Description formatting"
        className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white/80 px-2 py-1.5"
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.command}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(tool.command)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
          >
            {tool.content}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-label="Description"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        className="rich-text min-h-[8.5rem] px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none"
      />
    </div>
  );
}
