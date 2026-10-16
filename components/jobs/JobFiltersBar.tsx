"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  FileCheck2,
  KeyRound,
  Search,
  SlidersHorizontal,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks";

interface Option { id: string; label: string; group?: string }
interface ApiNamed { slug: string; name: string }
interface ApiState { code: string; name: string }
interface ApiBranch { slug: string; name: string; qualificationGroup?: string }

// Same ids as the update presets in lib/jobs-view.ts (server-only, so repeated here).
const UPDATE_PILLS = [
  { id: "exams", label: "Upcoming exams", Icon: CalendarDays },
  { id: "admit-cards", label: "Admit cards", Icon: FileCheck2 },
  { id: "results", label: "Results", Icon: Trophy },
  { id: "answer-keys", label: "Answer keys", Icon: KeyRound },
] as const;

type Draft = {
  category: string;
  qualificationCategories: string[];
  qualifications: string[];
  branches: string[];
  states: string[];
  organizations: string[];
};

const EMPTY_DRAFT: Draft = {
  category: "",
  qualificationCategories: [],
  qualifications: [],
  branches: [],
  states: [],
  organizations: [],
};

const csv = (value: string | null) => value?.split(",").filter(Boolean) ?? [];
const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

function Section({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-primary-600 px-1.5 text-[10px] font-semibold text-white">{count}</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-4 px-5 pb-4">{children}</div>}
    </div>
  );
}

function OptionList({
  label,
  options,
  selected,
  onToggle,
}: {
  label?: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options;
  const hasGroups = shown.some((o) => o.group);

  const row = (o: Option) => (
    <label
      key={o.id}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
    >
      <input
        type="checkbox"
        checked={selected.includes(o.id)}
        onChange={() => onToggle(o.id)}
        className="h-4 w-4 shrink-0 accent-primary-600"
      />
      <span className="min-w-0 truncate">{o.label}</span>
    </label>
  );

  const grouped: Record<string, Option[]> = {};
  if (hasGroups) {
    for (const o of shown) {
      const key = o.group ?? "Other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(o);
    }
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-medium text-neutral-500">{label}</p>}
      {options.length > 8 && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="mb-2 h-9 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-primary-500"
        />
      )}
      <div className="max-h-56 overflow-y-auto pr-1">
        {shown.length === 0 ? (
          <p className="px-1.5 py-2 text-xs text-neutral-400">Nothing found</p>
        ) : hasGroups ? (
          Object.entries(grouped).map(([group, opts]) => (
            <div key={group}>
              <p className="px-1.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {group}
              </p>
              {opts.map(row)}
            </div>
          ))
        ) : (
          shown.map(row)
        )}
      </div>
    </div>
  );
}

export default function JobFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const urlKey = searchParams.toString();

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
  const activeUpdate = searchParams.get("updates") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const sortValue = sort === "newest" && !activeUpdate ? "" : sort;

  const [draft, setDraft] = useState<Draft>(applied);
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<Record<string, boolean>>({ education: true });
  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");

  const [categories, setCategories] = useState<Option[]>([]);
  const [qualCategories, setQualCategories] = useState<Option[]>([]);
  const [qualifications, setQualifications] = useState<Option[]>([]);
  const [branches, setBranches] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [organizations, setOrganizations] = useState<Option[]>([]);

  useEffect(() => {
    setDraft(applied);
    setSearchText(searchParams.get("search") ?? "");
  }, [applied]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const load = <T,>(url: string, map: (rows: T[]) => Option[], set: (o: Option[]) => void) =>
      fetch(url)
        .then((r) => r.json())
        .then((rows) => set(Array.isArray(rows) ? map(rows) : []))
        .catch(() => {});

    load<ApiNamed>("/api/categories", (rows) => rows.map((c) => ({ id: c.slug, label: c.name })), setCategories);
    load<ApiNamed>("/api/qualification-categories", (rows) => rows.map((c) => ({ id: c.slug, label: c.name })), setQualCategories);
    load<ApiState>("/api/states", (rows) => rows.map((s) => ({ id: s.code, label: s.name })), setStates);
    load<ApiNamed>("/api/organizations", (rows) => rows.map((o) => ({ id: o.slug, label: o.name })), setOrganizations);
  }, []);

  useEffect(() => {
    const qs = draft.qualificationCategories.length ? `?categorySlugs=${draft.qualificationCategories.join(",")}` : "";
    fetch(`/api/qualifications${qs}`)
      .then((r) => r.json())
      .then((rows: ApiNamed[]) => {
        const options = Array.isArray(rows) ? rows.map((q) => ({ id: q.slug, label: q.name })) : [];
        setQualifications(options);
        if (draft.qualificationCategories.length > 0 && draft.qualifications.length === 0 && options.length === 1) {
          setDraft((d) => ({ ...d, qualifications: [options[0].id] }));
        }
      })
      .catch(() => {});
  }, [draft.qualificationCategories.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const openDrawer = () => {
    setDraft(applied);
    setOpen(true);
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
    setOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push({ search: searchText.trim() });
  };

  const toggleSection = (key: string) => setSections((s) => ({ ...s, [key]: !s[key] }));
  const labelOf = (options: Option[], id: string) => options.find((o) => o.id === id)?.label ?? id;

  const chips: { key: string; label: string; remove: () => void }[] = [];
  const dropFrom = (field: Exclude<keyof Draft, "category">, id: string) =>
    push({ [field]: applied[field].filter((v) => v !== id).join(",") });

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
    for (const keep of ["phase", "updates", "search", "sort"]) {
      const value = searchParams.get(keep);
      if (value) params.set(keep, value);
    }
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  };

  const draftCount =
    (draft.category ? 1 : 0) +
    draft.qualificationCategories.length +
    draft.qualifications.length +
    draft.branches.length +
    draft.states.length +
    draft.organizations.length;

  const sortOptions = [
    { id: "", label: activeUpdate ? "Best for this filter" : "Newest first" },
    ...(activeUpdate ? [{ id: "newest", label: "Newest first" }] : []),
    { id: "deadline_soon", label: "Last date (soonest)" },
    { id: "posts_high", label: "Most vacancies" },
    ...(isLoggedIn ? [{ id: "relevance", label: "Best match" }] : []),
  ];

  return (
    <div className="mb-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative min-w-0 sm:flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            inputMode="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search jobs, departments, exams"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-9 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
          {searchText && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchText("");
                push({ search: "" });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={openDrawer}
            className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              chips.length > 0
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

          <select
            value={sortValue}
            onChange={(e) => push({ sort: e.target.value })}
            aria-label="Sort jobs"
            className="h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:w-52 sm:flex-none"
          >
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 sm:inline">
          Quick filters
        </span>
        {UPDATE_PILLS.map(({ id, label, Icon }) => {
          const active = activeUpdate === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => push({ updates: active ? "" : id })}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
                active
                  ? "border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              <Icon size={14} />
              {label}
              {active && <X size={12} />}
            </button>
          );
        })}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
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

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white shadow-xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[26rem] md:rounded-none"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-base font-bold text-neutral-900">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Section
                title="Education"
                count={draft.qualificationCategories.length + draft.qualifications.length + draft.branches.length}
                open={!!sections.education}
                onToggle={() => toggleSection("education")}
              >
                <OptionList
                  label="Qualification category"
                  options={qualCategories}
                  selected={draft.qualificationCategories}
                  onToggle={(id) =>
                    setDraft((d) => ({
                      ...d,
                      qualificationCategories: toggleIn(d.qualificationCategories, id),
                      qualifications: [],
                      branches: [],
                    }))
                  }
                />
                {(draft.qualificationCategories.length > 0 || draft.qualifications.length > 0) &&
                  qualifications.length > 0 && (
                    <OptionList
                      label="Qualification"
                      options={qualifications}
                      selected={draft.qualifications}
                      onToggle={(id) =>
                        setDraft((d) => ({ ...d, qualifications: toggleIn(d.qualifications, id), branches: [] }))
                      }
                    />
                  )}
                {draft.qualifications.length > 0 && branches.length > 0 && (
                  <OptionList
                    label="Branch"
                    options={branches}
                    selected={draft.branches}
                    onToggle={(id) => setDraft((d) => ({ ...d, branches: toggleIn(d.branches, id) }))}
                  />
                )}
              </Section>

              <Section
                title="State"
                count={draft.states.length}
                open={!!sections.location}
                onToggle={() => toggleSection("location")}
              >
                <OptionList
                  options={states}
                  selected={draft.states}
                  onToggle={(id) => setDraft((d) => ({ ...d, states: toggleIn(d.states, id) }))}
                />
              </Section>

              <Section
                title="Recruiter"
                count={(draft.category ? 1 : 0) + draft.organizations.length}
                open={!!sections.recruiter}
                onToggle={() => toggleSection("recruiter")}
              >
                <OptionList
                  label="Sector"
                  options={categories}
                  selected={draft.category ? [draft.category] : []}
                  onToggle={(id) => setDraft((d) => ({ ...d, category: d.category === id ? "" : id }))}
                />
                <OptionList
                  label="Organization"
                  options={organizations}
                  selected={draft.organizations}
                  onToggle={(id) => setDraft((d) => ({ ...d, organizations: toggleIn(d.organizations, id) }))}
                />
              </Section>
            </div>

            <div
              className="flex items-center gap-3 border-t border-neutral-100 px-5 pt-3"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={() => setDraft(EMPTY_DRAFT)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="h-11 flex-1 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Apply filters{draftCount > 0 ? ` (${draftCount})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
