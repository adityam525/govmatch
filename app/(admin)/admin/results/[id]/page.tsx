'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'resultType', label: 'Result Type', type: 'select', required: true,
    options: [
      { label: 'Prelims', value: 'PRELIMS' },
      { label: 'Mains', value: 'MAINS' },
      { label: 'Merit List', value: 'MERIT_LIST' },
      { label: 'Final', value: 'FINAL' },
      { label: 'Interview', value: 'INTERVIEW' },
    ],
  },
  { name: 'releaseDate', label: 'Release Date', type: 'date' },
  { name: 'resultLink', label: 'Result Link', type: 'text', required: true },
];

export default function EditResultPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('results', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Result" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/results" />
    </div>
  );
}
