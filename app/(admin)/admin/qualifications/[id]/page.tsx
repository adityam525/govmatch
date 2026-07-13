'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'name', label: 'Qualification Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'level', label: 'Sort Level', type: 'number', required: true },
];

export default function EditQualificationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('qualifications', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Qualification" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/qualifications" />
    </div>
  );
}
