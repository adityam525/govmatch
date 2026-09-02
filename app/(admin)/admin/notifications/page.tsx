"use client";

import { useAdminList } from "@/features/admin/hooks";
import DataTable, { ColumnConfig } from "@/components/admin/DataTable";

interface NotificationRow {
  id: string;
  title: string;
  organization: { shortName: string };
  status: string;
  totalVacancies: number;
  applicationEndDate: string | null;
}

const columns: ColumnConfig<NotificationRow>[] = [
  { key: "title", label: "Title" },
  {
    key: "organization",
    label: "Organization",
    render: (row) => row.organization?.shortName ?? "-",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
      row.applicationEndDate
        ? new Date(row.applicationEndDate).toLocaleDateString("en-IN")
        : "-",
  },
];

export default function NotificationsAdminPage() {
  const { data, loading, deleteRecord } =
    useAdminList<NotificationRow>("notifications");

  return (
    <div className="p-6">
      <DataTable
        title="Jobs"
        basePath="/admin/notifications"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => {
          if (confirm("Delete this notification?")) deleteRecord(id);
        }}
      />
    </div>
  );
}
