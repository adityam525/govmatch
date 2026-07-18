'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';
import { adminApi } from '@/features/admin/api';

interface CategoryOption { id: string; name: string; }

export default function EditOrganizationPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading, save } = useAdminRecord('organizations', id);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    adminApi.list<CategoryOption>('categories').then(setCategories).catch(() => {});
  }, []);

  const fields: FieldConfig[] = [
    { name: 'name', label: 'Organization Name', type: 'text', required: true },
    { name: 'shortName', label: 'Short Name', type: 'text', required: true },
    { name: 'logoUrl', label: 'Logo URL', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    {
      name: 'categoryId',
      label: 'Category (Sector)',
      type: 'select',
      required: true,
      options: categories.map((c) => ({ label: c.name, value: c.id })),
    },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <RecordForm
        title="Edit Organization"
        fields={fields}
        initialValues={data ?? {}}
        onSubmit={(v) => save(v)}
        backHref="/admin/organizations"
      />
    </div>
  );
}
