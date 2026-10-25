'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

interface CategoryOption { id: string; name: string }

export default function EditOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    adminApi.list<CategoryOption>('categories').then(setCategories).catch(() => {});
    adminApi.getById<Record<string, any>>('organizations', id).then(setData).catch(() => setData({}));
  }, [id]);

  const fields: LookupField[] = [
    { name: 'name', label: 'Organization name', type: 'text', required: true },
    { name: 'shortName', label: 'Short name', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', help: 'Changing this changes the organization filter links. Leave it alone unless you must.' },
    { name: 'website', label: 'Website', type: 'text', placeholder: 'https://' },
    { name: 'categoryId', label: 'Sector', type: 'select', options: categories.map((c) => ({ label: c.name, value: c.id })) },
    { name: 'logoUrl', label: 'Logo', type: 'image', folder: 'organizations', slugFrom: 'shortName' },
  ];

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Edit organization"
        fields={fields}
        initialValues={data}
        onSubmit={(values) => adminApi.update('organizations', id, values)}
        onDelete={() => adminApi.remove('organizations', id)}
        backHref="/admin/organizations"
      />
    </div>
  );
}
