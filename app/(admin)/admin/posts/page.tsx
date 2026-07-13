'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface PostRow {
  id: string;
  title: string;
  vacancies: number;
  qualification: { name: string };
  notification: { title: string };
}

const columns: ColumnConfig<PostRow>[] = [
  { key: 'title', label: 'Post Title' },
  { key: 'notification', label: 'Notification', render: (row) => row.notification?.title ?? '-' },
  { key: 'qualification', label: 'Qualification', render: (row) => row.qualification?.name ?? '-' },
  { key: 'vacancies', label: 'Vacancies' },
];

export default function PostsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<PostRow>('posts');
  return (
    <div className="p-6">
      <DataTable
        title="Posts"
        basePath="/admin/posts"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this post?')) deleteRecord(id); }}
      />
    </div>
  );
}
