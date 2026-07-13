'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true },
  { name: 'title', label: 'Post Title', type: 'text', required: true },
  { name: 'vacancies', label: 'Vacancies', type: 'number', required: true },
  { name: 'qualificationId', label: 'Qualification ID', type: 'text', required: true },
  { name: 'minAge', label: 'Min Age', type: 'number' },
  { name: 'maxAge', label: 'Max Age', type: 'number' },
  { name: 'payScale', label: 'Pay Scale', type: 'text' },
];

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('posts', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Post" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/posts" />
    </div>
  );
}
