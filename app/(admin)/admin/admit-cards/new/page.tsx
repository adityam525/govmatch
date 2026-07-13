'use client';

import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true, placeholder: 'Paste notification id' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'releaseDate', label: 'Release Date', type: 'date' },
  { name: 'examDate', label: 'Exam Date', type: 'date' },
  { name: 'downloadLink', label: 'Download Link', type: 'text', required: true },
];

export default function NewAdmitCardPage() {
  const { save } = useAdminRecord('admit-cards');
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Add Admit Card" fields={fields} onSubmit={(v) => save(v)} backHref="/admin/admit-cards" />
    </div>
  );
}
