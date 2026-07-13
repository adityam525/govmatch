'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
];

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('categories', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Category" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/categories" />
    </div>
  );
}
