"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";

const ALL_CATEGORIES_OPTION: FilterOption = { id: "", label: "All Categories" };

const SORT_OPTIONS: FilterOption[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
];

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

interface ApiQualificationCategory {
  id: string;
  name: string;
  slug: string;
}

interface ApiQualification {
  id: string;
  name: string;
  slug: string;
  level: number;
}

interface ApiBranch {
  id: string;
  name: string;
  slug: string;
  qualificationGroup: string;
  qualificationId: string;
}

interface ApiState {
  id: string;
  name: string;
  code: string;
}

interface ApiOrganization {
  id: string;
  name: string;
  slug: string;
}

export default function JobFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // TEMPORARY DEBUG LOGGING -- remove once confirmed this is the file
  // actually being rendered.
  console.log("[JobFiltersBar RENDER]", { url: searchParams.toString() });

  // All filter values below are slugs / codes (human-readable, matching how
  // `search` already uses free text) -- not raw database ids.
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedQualificationCategories =
    searchParams.get("qualificationCategories")?.split(",").filter(Boolean) ??
    [];
  const selectedQualifications =
    searchParams.get("qualifications")?.split(",").filter(Boolean) ?? [];
  const selectedBranches =
    searchParams.get("branches")?.split(",").filter(Boolean) ?? [];
  const selectedStates =
    searchParams.get("states")?.split(",").filter(Boolean) ?? [];
  const selectedOrganizations =
    searchParams.get("organizations")?.split(",").filter(Boolean) ?? [];
  const selectedSort = searchParams.get("sort") ?? "newest";

  const [categories, setCategories] = useState<FilterOption[]>([
    ALL_CATEGORIES_OPTION,
  ]);
  const [qualificationCategories, setQualificationCategories] = useState<
    FilterOption[]
  >([]);
  const [qualifications, setQualifications] = useState<FilterOption[]>([]);
  const [branches, setBranches] = useState<FilterOption[]>([]);
  const [states, setStates] = useState<FilterOption[]>([]);
  const [organizations, setOrganizations] = useState<FilterOption[]>([]);

  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/jobs?${params.toString()}`);
  };

  // Static lookups that never change per-request.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: ApiCategory[]) =>
        setCategories([
          ALL_CATEGORIES_OPTION,
          ...(Array.isArray(data)
            ? data.map((c) => ({ id: c.slug, label: c.name }))
            : []),
        ]),
      )
      .catch(() => {});

    fetch("/api/qualification-categories")
      .then((r) => r.json())
      .then((data: ApiQualificationCategory[]) =>
        setQualificationCategories(
          Array.isArray(data)
            ? data.map((c) => ({ id: c.slug, label: c.name }))
            : [],
        ),
      )
      .catch(() => {});

    fetch("/api/states")
      .then((r) => r.json())
      .then((data: ApiState[]) =>
        setStates(
          Array.isArray(data)
            ? data.map((s) => ({ id: s.code, label: s.name }))
            : [],
        ),
      )
      .catch(() => {});

    fetch("/api/organizations")
      .then((r) => r.json())
      .then((data: ApiOrganization[]) =>
        setOrganizations(
          Array.isArray(data)
            ? data.map((o) => ({ id: o.slug, label: o.name }))
            : [],
        ),
      )
      .catch(() => {});
  }, []);

  // Qualifications cascade off the selected qualification category, but
  // stay independently searchable when none is selected.
  useEffect(() => {
    setLoadingQualifications(true);
    const qs =
      selectedQualificationCategories.length > 0
        ? `?categorySlugs=${selectedQualificationCategories.join(",")}`
        : "";
    fetch(`/api/qualifications${qs}`)
      .then((r) => r.json())
      .then((data: ApiQualification[]) =>
        setQualifications(
          Array.isArray(data)
            ? data.map((q) => ({ id: q.slug, label: q.name }))
            : [],
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingQualifications(false));
  }, [selectedQualificationCategories.join(",")]);

  // Branches cascade off selected qualifications, but stay independently
  // searchable (grouped by qualificationGroup) when none are selected.
  useEffect(() => {
    setLoadingBranches(true);
    const qs =
      selectedQualifications.length > 0
        ? `?qualificationSlugs=${selectedQualifications.join(",")}`
        : "";
    fetch(`/api/branches${qs}`)
      .then((r) => r.json())
      .then((data: ApiBranch[]) =>
        setBranches(
          Array.isArray(data)
            ? data.map((b) => ({
                id: b.slug,
                label: b.name,
                group: b.qualificationGroup,
              }))
            : [],
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingBranches(false));
  }, [selectedQualifications.join(",")]);

  // If narrowing by Qualification Category leaves exactly one Qualification
  // option, auto-select it -- no point making the user open a dropdown that
  // only has one thing in it. Only fires when nothing is already chosen, so
  // it never overrides a user's own selection, and it won't re-fire after
  // auto-selecting since selectedQualifications.length becomes 1 on the
  // next render (which fails the guard below).
  useEffect(() => {
    // TEMPORARY DEBUG LOGGING -- remove once this is confirmed working.
    console.log("[auto-select check]", {
      loadingQualifications,
      selectedQualificationCategories,
      selectedQualifications,
      qualifications,
    });
    if (
      !loadingQualifications &&
      selectedQualificationCategories.length > 0 &&
      selectedQualifications.length === 0 &&
      qualifications.length === 1
    ) {
      console.log(
        "[auto-select] firing updateParams with",
        qualifications[0].id,
      );
      updateParams({ qualifications: qualifications[0].id });
    }
  }, [
    qualifications,
    loadingQualifications,
    selectedQualificationCategories.join(","),
  ]);

  const hasActiveFilters =
    selectedCategory !== "" ||
    selectedQualificationCategories.length > 0 ||
    selectedQualifications.length > 0 ||
    selectedBranches.length > 0 ||
    selectedStates.length > 0 ||
    selectedOrganizations.length > 0;

  // Progressive disclosure: Qualification only appears once a Qualification
  // Category is picked AND that category actually has qualifications to
  // show (or Qualification already has a value from a deep link). Branch
  // follows the same rule off Qualification. This avoids showing an
  // dropdown that would open to "No options found".
  const showQualification =
    selectedQualifications.length > 0 ||
    (selectedQualificationCategories.length > 0 &&
      (loadingQualifications || qualifications.length > 0));

  const showBranch =
    selectedBranches.length > 0 ||
    (selectedQualifications.length > 0 &&
      (loadingBranches || branches.length > 0));

  const clearAll = () => router.push("/jobs");

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-neutral-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <FilterDropdown
          label="Category"
          options={categories}
          selected={[selectedCategory]}
          onChange={(ids) => updateParams({ category: ids[0] ?? "" })}
          multi={false}
          searchable={false}
          widthClass="w-48"
          defaultValue=""
        />

        <FilterDropdown
          label="Qualification Category"
          options={qualificationCategories}
          selected={selectedQualificationCategories}
          onChange={(ids) =>
            updateParams({ qualificationCategories: ids[0] ?? "" })
          }
          multi={false}
          allowClear
          widthClass="w-56"
        />

        {showQualification && (
          <FilterDropdown
            label="Qualification"
            options={qualifications}
            selected={selectedQualifications}
            onChange={(ids) => updateParams({ qualifications: ids.join(",") })}
            loading={loadingQualifications}
            widthClass="w-56"
          />
        )}

        {showBranch && (
          <FilterDropdown
            label="Branch"
            options={branches}
            selected={selectedBranches}
            onChange={(ids) => updateParams({ branches: ids.join(",") })}
            loading={loadingBranches}
            widthClass="w-56"
          />
        )}

        <FilterDropdown
          label="State"
          options={states}
          selected={selectedStates}
          onChange={(ids) => updateParams({ states: ids.join(",") })}
          widthClass="w-48"
        />

        <FilterDropdown
          label="Organization"
          options={organizations}
          selected={selectedOrganizations}
          onChange={(ids) => updateParams({ organizations: ids.join(",") })}
          widthClass="w-56"
        />

        <FilterDropdown
          label="Sort"
          options={SORT_OPTIONS}
          selected={[selectedSort]}
          onChange={(ids) => updateParams({ sort: ids[0] ?? "newest" })}
          multi={false}
          searchable={false}
          widthClass="w-40"
          defaultValue="newest"
        />
      </div>
    </Card>
  );
}
