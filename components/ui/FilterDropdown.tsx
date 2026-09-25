"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Check, X } from "lucide-react";

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
  defaultValue?: string;
  allowClear?: boolean;
  /** When true, shows an "+ Add Custom..." row that lets the user create a
   * new option inline (e.g. a new State/Organization/Role) without leaving
   * the dropdown. Requires onCreate. */
  allowCreate?: boolean;
  /** Called with the typed label when the user submits a custom option.
   * Should create the record server-side and resolve with the new
   * FilterOption, or null/throw on failure. */
  onCreate?: (label: string) => Promise<FilterOption | null>;
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
  allowCreate = false,
  onCreate,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createValue, setCreateValue] = useState("");
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCreating(false);
    }
  }, [open]);

  const filteredOptions = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

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

  const handleCreate = async () => {
    if (!createValue.trim() || !onCreate) return;
    setSaving(true);
    try {
      const created = await onCreate(createValue.trim());
      if (created) {
        onChange(multi ? [...selected, created.id] : [created.id]);
        setCreating(false);
        setCreateValue("");
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create. It may already exist.");
    } finally {
      setSaving(false);
    }
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
          {searchable && !creating && (
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

          {creating ? (
            <div className="px-2 pb-2">
              <div className="flex gap-1.5">
                <input
                  autoFocus
                  type="text"
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Enter new value"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="shrink-0 p-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setCreateValue(""); }}
                  className="shrink-0 p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {allowCreate && onCreate && !creating && (
            <div className="px-3 pt-2 mt-1 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 text-[11px] text-primary-600 hover:underline"
              >
                <Plus size={12} /> Add Custom...
              </button>
            </div>
          )}

          {resolvedAllowClear && selectedLabels.length > 0 && !creating && (
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
