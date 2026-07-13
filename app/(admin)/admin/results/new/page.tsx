'use client';

import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID', type: 'text', required: true, placeholder: 'Paste notification id' },
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

export default function NewResultPage() {
  const { save } = useAdminRecord('results');
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Add Result" fields={fields} onSubmit={(v) => save(v)} backHref="/admin/results" />
    </div>
  );
}
