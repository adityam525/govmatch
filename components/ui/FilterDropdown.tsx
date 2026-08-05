"use client";

import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  id: string;
  label: string;
  group?: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  multi?: boolean;
  searchable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  widthClass?: string;
  /** For single-select dropdowns: the value that represents "no filter
   * applied" (e.g. 'all' for Category, 'newest' for Sort). When the current
   * selection equals this, the button renders in its neutral (non-active)
   * style instead of the highlighted "filter applied" style. */
  defaultValue?: string;
  /** Show the inline (x) clear button. Defaults to true for multi-select,
   * and to true for single-select only when no defaultValue is set (i.e.
   * there's no "All"/"Newest"-style option that already serves as the
   * clear target — e.g. Qualification Category). */
  allowClear?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multi = true,
  searchable = true,
  loading = false,
  disabled = false,
  placeholder = "Search...",
  emptyMessage = "No options found",
  widthClass = "w-64",
  defaultValue,
  allowClear,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredOptions = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Group options that carry a `group` field (used for Branch, grouped by
  // qualificationGroup) so ungrouped lists (Qualification Category,
  // Qualification, State) just render flat.
  const hasGroups = filteredOptions.some((o) => o.group);
  const groupedOptions: Record<string, FilterOption[]> = {};
  if (hasGroups) {
    for (const opt of filteredOptions) {
      const key = opt.group ?? "Other";
      if (!groupedOptions[key]) groupedOptions[key] = [];
      groupedOptions[key].push(opt);
    }
  }

  const toggleOption = (id: string) => {
    if (!multi) {
      // Single-select behaves like a radio group: clicking an option always
      // selects it, even if it's already selected. It never toggles off,
      // since these dropdowns (Category, Sort) always have exactly one
      // active value and rely on a real "default" option (e.g. "All
      // Categories") to represent the cleared state.
      onChange([id]);
      setOpen(false);
      return;
    }
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.label);

  const buttonText =
    selectedLabels.length === 0
      ? label
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${label} (${selectedLabels.length})`;

  const isActive =
    defaultValue !== undefined
      ? selected[0] !== undefined && selected[0] !== defaultValue
      : selectedLabels.length > 0;

  const resolvedAllowClear = allowClear ?? multi;

  const renderOption = (opt: FilterOption) => (
    <label
      key={opt.id}
      className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer rounded"
    >
      <input
        type={multi ? "checkbox" : "radio"}
        checked={selected.includes(opt.id)}
        onChange={() => toggleOption(opt.id)}
        className="w-3.5 h-3.5 text-primary-600 rounded shrink-0"
      />
      <span className="text-xs text-neutral-700 truncate">{opt.label}</span>
    </label>
  );

  return (
    <div ref={rootRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${
          disabled
            ? "bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed"
            : isActive
              ? "bg-primary-50 border-primary-300 text-primary-700"
              : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400"
        }`}
      >
        <span className="truncate font-medium">{buttonText}</span>
        <span className="flex items-center gap-1 shrink-0">
          {resolvedAllowClear && isActive && (
            <span
              onClick={clearSelection}
              className="text-neutral-400 hover:text-neutral-600 text-sm leading-none px-0.5"
              aria-label={`Clear ${label}`}
            >
              ×
            </span>
          )}
          <svg
            className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 max-w-[80vw] bg-white border border-neutral-200 rounded-lg shadow-lg py-2">
          {searchable && (
            <div className="px-2 pb-2">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto px-1">
            {loading ? (
              <p className="text-xs text-neutral-400 px-3 py-2">Loading...</p>
            ) : filteredOptions.length === 0 ? (
              <p className="text-xs text-neutral-400 px-3 py-2">
                {emptyMessage}
              </p>
            ) : hasGroups ? (
              Object.entries(groupedOptions).map(([group, opts]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                    {group}
                  </p>
                  {opts.map(renderOption)}
                </div>
              ))
            ) : (
              filteredOptions.map(renderOption)
            )}
          </div>

          {resolvedAllowClear && selectedLabels.length > 0 && (
            <div className="px-3 pt-2 mt-1 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-primary-600 hover:underline"
              >
                Clear {label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
