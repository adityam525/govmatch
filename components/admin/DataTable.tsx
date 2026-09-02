"use client";

import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  title: string;
  basePath: string;
  columns: ColumnConfig<T>[];
  rows: T[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function DataTable<T extends { id: string }>({
  title,
  basePath,
  columns,
  rows,
  loading,
  onDelete,
}: DataTableProps<T>) {
  const router = useRouter();
  return (
    <div className="bg-white border border-neutral-200 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <Link href={`${basePath}/new`}>
          <Button variant="primary" size="sm" icon={<Plus size={16} />}>
            Add New
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-2.5 font-medium text-neutral-600"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-right px-4 py-2.5 font-medium text-neutral-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-neutral-400"
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-neutral-400"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className=" cursor-pointer border-b border-neutral-50 hover:bg-neutral-50"
                  onClick={() => router.push(`${basePath}/${row.id}`)}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-2.5 text-neutral-900"
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`${basePath}/${row.id}`}>
                        <button className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md">
                          <Pencil size={14} />
                        </button>
                      </Link>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row.id);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-danger hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
