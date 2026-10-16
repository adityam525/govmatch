"use client";

import { useState } from "react";
import { useAdminList } from "@/features/admin/hooks";
import DataTable, { ColumnConfig } from "@/components/admin/DataTable";

interface JobRow {
  id: string;
  title: string;
  organization: { shortName: string } | null;
  status: string;
  published: boolean;
  totalVacancies: number;
  applicationEndDate: string | null;
}

type Filter = "all" | "draft" | "published";

export default function NotificationsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<JobRow>("notifications");
  const [filter, setFilter] = useState<Filter>("all");
  // Publish state changed from this page, applied on top of the loaded rows.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rows = data.map((row) => ({ ...row, published: overrides[row.id] ?? row.published }));
  const counts = {
    all: rows.length,
    draft: rows.filter((r) => !r.published).length,
    published: rows.filter((r) => r.published).length,
  };
  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "draft" ? !r.published : r.published,
  );

  const setPublished = async (id: string, next: boolean) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/jobs/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Could not update this job.");
        return;
      }
      setOverrides((prev) => ({ ...prev, [id]: next }));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: ColumnConfig<JobRow>[] = [
    { key: "title", label: "Title" },
    {
      key: "organization",
      label: "Organization",
      render: (row) => row.organization?.shortName ?? "-",
    },
    {
      key: "published",
      label: "Visibility",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              row.published ? "bg-green-50 text-success" : "bg-amber-50 text-amber-700"
            }`}
          >
            {row.published ? "Published" : "Draft"}
          </span>
          <button
            type="button"
            disabled={busyId === row.id}
            onClick={(e) => {
              e.stopPropagation();
              setPublished(row.id, !row.published);
            }}
            className="rounded-md border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            {busyId === row.id ? "..." : row.published ? "Unpublish" : "Publish"}
          </button>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.status === "LIVE"
              ? "bg-green-50 text-success"
              : row.status === "UPCOMING"
                ? "bg-primary-50 text-primary-600"
                : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { key: "totalVacancies", label: "Vacancies" },
    {
      key: "applicationEndDate",
      label: "Last Date",
      render: (row) =>
        row.applicationEndDate ? new Date(row.applicationEndDate).toLocaleDateString("en-IN") : "-",
    },
  ];

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "draft", label: "Draft" },
    { id: "published", label: "Published" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {f.label}{" "}
            <span className={filter === f.id ? "opacity-80" : "text-neutral-400"}>({counts[f.id]})</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <DataTable
        title="Jobs"
        basePath="/admin/notifications"
        columns={columns}
        rows={visible}
        loading={loading}
        onDelete={(id) => {
          if (confirm("Delete this job permanently?")) deleteRecord(id);
        }}
      />
    </div>
  );
}
