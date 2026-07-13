'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'releaseDate', label: 'Release Date', type: 'date' },
  { name: 'examDate', label: 'Exam Date', type: 'date' },
  { name: 'downloadLink', label: 'Download Link', type: 'text', required: true },
];

export default function EditAdmitCardPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('admit-cards', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Admit Card" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/admit-cards" />
    </div>
  );
}
