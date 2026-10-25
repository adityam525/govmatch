'use client';

import { useEffect, useState } from 'react';
import DataTable, { type ColumnConfig } from '@/components/admin/DataTable';
import { adminApi } from '@/features/admin/api';

// A list page that loads its rows, deletes with the server's reason shown when a delete is blocked.
export default function ManagedList<T extends { id: string }>({
  title,
  entity,
  basePath,
  columns,
  deleteMessage = 'Delete this record?',
}: {
  title: string;
  entity: string;
  basePath: string;
  columns: ColumnConfig<T>[];
  deleteMessage?: string;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .list<T>(entity)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load the list.'))
      .finally(() => setLoading(false));
  }, [entity]);

  return (
    <div className="p-4 sm:p-6">
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <DataTable
        title={title}
        basePath={basePath}
        columns={columns}
        rows={rows}
        loading={loading}
        onDelete={async (id) => {
          if (!confirm(deleteMessage)) return;
          setError('');
          try {
            await adminApi.remove(entity, id);
            setRows((prev) => prev.filter((row) => row.id !== id));
          } catch (err) {
            setError(err instanceof Error && err.message ? err.message : 'Could not delete.');
          }
        }}
      />
    </div>
  );
}
