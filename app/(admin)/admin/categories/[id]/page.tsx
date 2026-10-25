'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'Category name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', help: 'Changing this changes the sector filter links.' },
];

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    adminApi.getById<Record<string, any>>('categories', id).then(setData).catch(() => setData({}));
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Edit category"
        fields={fields}
        initialValues={data}
        onSubmit={(values) => adminApi.update('categories', id, values)}
        onDelete={() => adminApi.remove('categories', id)}
        backHref="/admin/categories"
      />
    </div>
  );
}
