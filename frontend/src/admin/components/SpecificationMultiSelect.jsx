import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
} from "../../components/Icons.jsx";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function SpecificationMultiSelect({
  id = "specification-multi-select",
  options = [],
  selected = [],
  onToggle,
  onCreate,
  onOpenChange,
  disabled = false,
  loading = false,
  error = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createNotice, setCreateNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const newNameRef = useRef(null);

  const selectedKeys = useMemo(
    () => new Set(selected.map((name) => String(name || "").trim().toLowerCase())),
    [selected],
  );

  // Include names already saved on a product even when they are not part of
  // the saved catalog (for example, products created before this feature).
  const allOptions = useMemo(() => {
    const seen = new Set();
    const merged = [];

    [...options, ...selected].forEach((value) => {
      const name = typeof value === "string" ? value.trim() : "";

      if (!name) return;

      const key = name.toLowerCase();

      if (seen.has(key)) return;

      seen.add(key);
      merged.push(name);
    });

    return merged;
  }, [options, selected]);

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return allOptions;

    return allOptions.filter((name) => name.toLowerCase().includes(needle));
  }, [allOptions, query]);

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => {
      if (creating) {
        newNameRef.current?.focus();
      } else {
        searchRef.current?.focus();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, creating]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        closeDropdown();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (creating) {
          resetCreateForm();
          return;
        }

        closeDropdown();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, creating]);

  function resetCreateForm() {
    setCreating(false);
    setNewName("");
    setCreateError("");
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
    setCreateError("");
    setCreateNotice(null);
    setCreating(false);
    setNewName("");
    onOpenChange?.(false);
  }

  function openDropdown() {
    if (disabled) return;
    setQuery("");
    setCreateError("");
    setCreateNotice(null);
    setCreating(false);
    setOpen(true);
    onOpenChange?.(true);
  }

  function handleDone() {
    closeDropdown();
    triggerRef.current?.focus();
  }

  function handleTriggerClick() {
    if (open) {
      closeDropdown();
      return;
    }

    openDropdown();
  }

  function handleOptionClick(name) {
    onToggle?.(name);
  }

  async function handleCreateSubmit() {
    const name = newName.trim();

    if (!name) {
      setCreateError("Enter a specification name.");
      return;
    }

    if (!onCreate) {
      setCreateError("Specifications cannot be saved right now.");
      return;
    }

    setSaving(true);
    setCreateError("");
    setCreateNotice(null);

    try {
      const result = await onCreate(name);
      const resolvedName =
        typeof result === "string"
          ? result.trim() || name
          : result?.name?.trim() || name;
      const alreadyExists = Boolean(
        result && typeof result === "object" && result.existing,
      );
      const wasSelected = selectedKeys.has(resolvedName.toLowerCase());

      if (!wasSelected) {
        onToggle?.(resolvedName);
      }

      setCreating(false);
      setNewName("");
      setQuery("");
      setCreateNotice({
        tone: alreadyExists ? "info" : "success",
        message: alreadyExists
          ? wasSelected
            ? `"${resolvedName}" already exists and is already selected.`
            : `"${resolvedName}" already exists and has been selected.`
          : `"${resolvedName}" was added and selected.`,
      });
    } catch (requestError) {
      setCreateError(
        requestError?.message || "Unable to save the specification.",
      );
    } finally {
      setSaving(false);
    }
  }

  const listboxId = `${id}-listbox`;
  const summary =
    selected.length === 0
      ? "Select specifications"
      : `${selected.length} specification${selected.length === 1 ? "" : "s"} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openDropdown();
          }
        }}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 pr-10 text-left text-sm transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70 ${
          selected.length ? "text-slate-800" : "text-slate-400"
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="block truncate">{summary}</span>
          {selected.length ? (
            <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              {selected.length}
            </span>
          ) : null}
        </span>
      </button>

      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  // This dropdown lives inside the product form, so Enter must
                  // not submit the product while the admin is searching.
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
                placeholder="Search specifications"
                aria-label="Search specifications"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label="Specification names"
            aria-multiselectable="true"
            className="max-h-64 overflow-y-auto p-1"
          >
            {loading ? (
              <p className="px-2.5 py-3 text-sm text-slate-500">
                Loading specifications...
              </p>
            ) : null}

            {!loading
              ? filteredOptions.map((name) => {
                  const selectedOption = selectedKeys.has(name.toLowerCase());

                  return (
                    <button
                      key={name}
                      type="button"
                      role="option"
                      aria-selected={selectedOption}
                      onClick={() => handleOptionClick(name)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        selectedOption
                          ? "bg-slate-100 font-medium text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selectedOption
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span className="truncate">{name}</span>
                    </button>
                  );
                })
              : null}

            {!loading && filteredOptions.length === 0 ? (
              <p className="px-2.5 py-3 text-sm text-slate-500">
                No specifications found
              </p>
            ) : null}
          </div>

          <div className="border-t border-slate-100 p-2">
            {createNotice ? (
              <p
                role="status"
                aria-live="polite"
                className={`mb-2 rounded-lg border px-2.5 py-2 text-xs leading-5 ${
                  createNotice.tone === "info"
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {createNotice.message}
              </p>
            ) : null}

            {creating ? (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    ref={newNameRef}
                    type="text"
                    value={newName}
                    onChange={(event) => {
                      setNewName(event.target.value);
                      setCreateError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (!saving) handleCreateSubmit();
                      }
                    }}
                    maxLength={80}
                    placeholder="New specification name"
                    aria-label="New specification name"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-2 pr-9 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={resetCreateForm}
                    aria-label="Cancel new specification"
                    disabled={saving}
                    className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {createError ? (
                  <p role="alert" className="px-1 text-xs text-rose-600">
                    {createError}
                  </p>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetCreateForm}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateSubmit}
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save & Select"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCreating(true);
                  setCreateError("");
                  setCreateNotice(null);
                  setNewName("");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-dashed border-slate-400 text-slate-600">
                  <PlusIcon className="h-3 w-3" />
                </span>
                Add New Specification
              </button>
            )}
                        <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleDone}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                Done
              </button>
            </div>  
          </div>
        </div>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
