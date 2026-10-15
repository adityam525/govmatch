"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";

interface ApiNamed { slug: string; name: string }
interface ApiState { code: string; name: string }
interface ApiBranch { slug: string; name: string; qualificationGroup?: string }

const SORT_OPTIONS: FilterOption[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "relevance", label: "Best match" },
  { id: "salary_high", label: "Highest salary" },
];

const csv = (value: string | null) => value?.split(",").filter(Boolean) ?? [];

type Draft = {
  category: string;
  qualificationCategories: string[];
  qualifications: string[];
  branches: string[];
  states: string[];
  organizations: string[];
};

export default function JobFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKey = searchParams.toString();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const applied: Draft = useMemo(
    () => ({
      category: searchParams.get("category") ?? "",
      qualificationCategories: csv(searchParams.get("qualificationCategories")),
      qualifications: csv(searchParams.get("qualifications")),
      branches: csv(searchParams.get("branches")),
      states: csv(searchParams.get("states")),
      organizations: csv(searchParams.get("organizations")),
    }),
    [urlKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const sort = searchParams.get("sort") ?? "newest";

  const [draft, setDraft] = useState<Draft>(applied);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");

  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [qualCategories, setQualCategories] = useState<FilterOption[]>([]);
  const [qualifications, setQualifications] = useState<FilterOption[]>([]);
  const [branches, setBranches] = useState<FilterOption[]>([]);
  const [states, setStates] = useState<FilterOption[]>([]);
  const [organizations, setOrganizations] = useState<FilterOption[]>([]);

  // Keep the form in step with the URL (back button, chip removal, tab switch).
  useEffect(() => {
    setDraft(applied);
    setSearchText(searchParams.get("search") ?? "");
  }, [applied]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the panel on Escape or a click outside the toolbar.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [panelOpen]);

  useEffect(() => {
    const load = <T,>(url: string, map: (rows: T[]) => FilterOption[], set: (o: FilterOption[]) => void) =>
      fetch(url)
        .then((r) => r.json())
        .then((rows) => set(Array.isArray(rows) ? map(rows) : []))
        .catch(() => {});

    load<ApiNamed>("/api/categories", (rows) => rows.map((c) => ({ id: c.slug, label: c.name })), setCategories);
    load<ApiNamed>("/api/qualification-categories", (rows) => rows.map((c) => ({ id: c.slug, label: c.name })), setQualCategories);
    load<ApiState>("/api/states", (rows) => rows.map((s) => ({ id: s.code, label: s.name })), setStates);
    load<ApiNamed>("/api/organizations", (rows) => rows.map((o) => ({ id: o.slug, label: o.name })), setOrganizations);
  }, []);

  // Qualifications follow the chosen qualification categories.
  useEffect(() => {
    const qs = draft.qualificationCategories.length ? `?categorySlugs=${draft.qualificationCategories.join(",")}` : "";
    fetch(`/api/qualifications${qs}`)
      .then((r) => r.json())
      .then((rows: ApiNamed[]) => {
        const options = Array.isArray(rows) ? rows.map((q) => ({ id: q.slug, label: q.name })) : [];
        setQualifications(options);
        // A single possible qualification needs no choice.
        if (draft.qualificationCategories.length > 0 && draft.qualifications.length === 0 && options.length === 1) {
          setDraft((d) => ({ ...d, qualifications: [options[0].id] }));
        }
      })
      .catch(() => {});
  }, [draft.qualificationCategories.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Branches follow the chosen qualifications.
  useEffect(() => {
    const qs = draft.qualifications.length ? `?qualificationSlugs=${draft.qualifications.join(",")}` : "";
    fetch(`/api/branches${qs}`)
      .then((r) => r.json())
      .then((rows: ApiBranch[]) =>
        setBranches(
          Array.isArray(rows) ? rows.map((b) => ({ id: b.slug, label: b.name, group: b.qualificationGroup })) : [],
        ),
      )
      .catch(() => {});
  }, [draft.qualifications.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const push = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  };

  const togglePanel = () => {
    if (!panelOpen) setDraft(applied); // always start from what is actually applied
    setPanelOpen(!panelOpen);
  };

  const applyFilters = () => {
    push({
      category: draft.category,
      qualificationCategories: draft.qualificationCategories.join(","),
      qualifications: draft.qualifications.join(","),
      branches: draft.branches.join(","),
      states: draft.states.join(","),
      organizations: draft.organizations.join(","),
    });
    setPanelOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push({ search: searchText.trim() });
  };

  const labelOf = (options: FilterOption[], id: string) => options.find((o) => o.id === id)?.label ?? id;

  // Applied filters as removable chips.
  const chips: { key: string; label: string; remove: () => void }[] = [];
  const dropFrom = (field: keyof Draft, id: string) =>
    push({ [field]: (applied[field] as string[]).filter((v) => v !== id).join(",") });

  if (applied.category) {
    chips.push({ key: `cat-${applied.category}`, label: labelOf(categories, applied.category), remove: () => push({ category: "" }) });
  }
  applied.qualificationCategories.forEach((id) =>
    chips.push({ key: `qc-${id}`, label: labelOf(qualCategories, id), remove: () => dropFrom("qualificationCategories", id) }),
  );
  applied.qualifications.forEach((id) =>
    chips.push({ key: `q-${id}`, label: labelOf(qualifications, id), remove: () => dropFrom("qualifications", id) }),
  );
  applied.branches.forEach((id) =>
    chips.push({ key: `b-${id}`, label: labelOf(branches, id), remove: () => dropFrom("branches", id) }),
  );
  applied.states.forEach((id) =>
    chips.push({ key: `s-${id}`, label: labelOf(states, id), remove: () => dropFrom("states", id) }),
  );
  applied.organizations.forEach((id) =>
    chips.push({ key: `o-${id}`, label: labelOf(organizations, id), remove: () => dropFrom("organizations", id) }),
  );

  const clearAll = () => {
    const params = new URLSearchParams();
    for (const keep of ["phase", "updates", "search"]) {
      const value = searchParams.get(keep);
      if (value) params.set(keep, value);
    }
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  };

  const dropdownProps = { widthClass: "w-full", allowClear: true } as const;

  return (
    <div className="mb-3">
      <div ref={toolbarRef} className="relative">
        <div className="flex flex-col gap-2 sm:flex-row">
          <form onSubmit={submitSearch} className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search jobs, departments, exams..."
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500"
            />
          </form>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors ${
                panelOpen || chips.length > 0
                  ? "border-primary-300 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {chips.length > 0 && (
                <span className="rounded-full bg-primary-600 px-1.5 text-[10px] font-semibold text-white">{chips.length}</span>
              )}
            </button>

            <div className="w-40">
              <FilterDropdown
                label="Sort"
                options={SORT_OPTIONS}
                selected={[sort]}
                onChange={(ids) => push({ sort: ids[0] ?? "newest" })}
                multi={false}
                searchable={false}
                defaultValue="newest"
                widthClass="w-full"
              />
            </div>
          </div>
        </div>

        {panelOpen && (
          <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg md:absolute md:inset-x-0 md:top-full md:z-30">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Your education</p>
                <FilterDropdown
                  label="Qualification category"
                  options={qualCategories}
                  selected={draft.qualificationCategories}
                  onChange={(ids) => setDraft((d) => ({ ...d, qualificationCategories: ids, qualifications: [], branches: [] }))}
                  {...dropdownProps}
                />
                {(draft.qualificationCategories.length > 0 || draft.qualifications.length > 0) && qualifications.length > 0 && (
                  <FilterDropdown
                    label="Qualification"
                    options={qualifications}
                    selected={draft.qualifications}
                    onChange={(ids) => setDraft((d) => ({ ...d, qualifications: ids, branches: [] }))}
                    {...dropdownProps}
                  />
                )}
                {draft.qualifications.length > 0 && branches.length > 0 && (
                  <FilterDropdown
                    label="Branch"
                    options={branches}
                    selected={draft.branches}
                    onChange={(ids) => setDraft((d) => ({ ...d, branches: ids }))}
                    {...dropdownProps}
                  />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Location</p>
                <FilterDropdown
                  label="State"
                  options={states}
                  selected={draft.states}
                  onChange={(ids) => setDraft((d) => ({ ...d, states: ids }))}
                  {...dropdownProps}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Recruiter</p>
                <FilterDropdown
                  label="Sector"
                  options={categories}
                  selected={draft.category ? [draft.category] : []}
                  onChange={(ids) => setDraft((d) => ({ ...d, category: ids[0] ?? "" }))}
                  multi={false}
                  {...dropdownProps}
                />
                <FilterDropdown
                  label="Organization"
                  options={organizations}
                  selected={draft.organizations}
                  onChange={(ids) => setDraft((d) => ({ ...d, organizations: ids }))}
                  {...dropdownProps}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                Cancel
              </button>
              <button type="button" onClick={applyFilters} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Apply filters
              </button>
            </div>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs text-neutral-500 underline hover:text-neutral-700">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
