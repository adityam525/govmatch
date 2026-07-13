'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'keyType', label: 'Key Type', type: 'select', required: true,
    options: [
      { label: 'Provisional', value: 'PROVISIONAL' },
      { label: 'Final', value: 'FINAL' },
    ],
  },
  { name: 'releaseDate', label: 'Release Date', type: 'date' },
  { name: 'objectionEndDate', label: 'Objection End Date', type: 'date' },
  { name: 'downloadLink', label: 'Download Link', type: 'text', required: true },
];

export default function EditAnswerKeyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('answer-keys', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Answer Key" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/answer-keys" />
    </div>
  );
}
