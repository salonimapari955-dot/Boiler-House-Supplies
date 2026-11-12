import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../../components/Icons.jsx";

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

export default function SearchableCategorySelect({
  id,
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  invalid = false,
  describedBy,
  variant = "form",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const optionRefs = useRef([]);

  const isFilter = variant === "filter";
  const includePlaceholderOption =
    isFilter || (!disabled && options.length > 0);

  const selectableOptions = useMemo(
    () =>
      includePlaceholderOption
        ? [{ value: "", label: placeholder }, ...options]
        : options,
    [includePlaceholderOption, options, placeholder],
  );

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : "";

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return selectableOptions;

    return selectableOptions.filter((option) =>
      String(option.label || "")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, selectableOptions]);

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openDropdown() {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  function selectOption(option) {
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function handleTriggerClick() {
    if (open) {
      setOpen(false);
      setQuery("");
      return;
    }

    openDropdown();
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => {
        if (!filteredOptions.length) return -1;
        return Math.min(current + 1, filteredOptions.length - 1);
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => {
        if (!filteredOptions.length) return -1;
        return Math.max(current - 1, 0);
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) selectOption(option);
    }
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setActiveIndex(0);
  }

  const triggerClasses = isFilter
    ? `w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-10 text-left text-sm transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 ${
        value ? "text-slate-800" : "text-slate-500"
      }`
    : `w-full appearance-none rounded-xl border bg-slate-50/70 px-3.5 py-3 pr-10 text-left text-sm transition-colors focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${
        invalid
          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
          : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
      } ${value ? "text-slate-800" : "text-slate-400"}`;

  const listboxId = `${id}-listbox`;

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
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClasses}
      >
        <span className="block truncate">
          {displayLabel || placeholder || "Select an option"}
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
                onChange={handleQueryChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search categories"
                aria-label="Search categories"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label="Categories"
            className="max-h-60 overflow-y-auto p-1"
          >
            {filteredOptions.map((option, index) => {
              const selected = option.value === value;

              return (
                <button
                  key={`${option.value}-${index}`}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    index === activeIndex
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected ? (
                    <CheckIcon className="h-4 w-4 shrink-0 text-slate-900" />
                  ) : null}
                </button>
              );
            })}

            {filteredOptions.length === 0 ? (
              <p className="px-2.5 py-3 text-sm text-slate-500">
                No categories found
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
