'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'name', label: 'State Name', type: 'text', required: true },
  { name: 'code', label: 'State Code', type: 'text', required: true },
];

export default function EditStatePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('states', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit State" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/states" />
    </div>
  );
}
