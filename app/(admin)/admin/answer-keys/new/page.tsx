'use client';

import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true, placeholder: 'Paste notification id' },
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

export default function NewAnswerKeyPage() {
  const { save } = useAdminRecord('answer-keys');
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Add Answer Key" fields={fields} onSubmit={(v) => save(v)} backHref="/admin/answer-keys" />
    </div>
  );
}
