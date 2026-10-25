'use client';

import { useEffect, useState } from 'react';
import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

interface CategoryOption { id: string; name: string }

export default function NewOrganizationPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    adminApi.list<CategoryOption>('categories').then(setCategories).catch(() => {});
  }, []);

  const fields: LookupField[] = [
    { name: 'name', label: 'Organization name', type: 'text', required: true, placeholder: 'e.g. Union Public Service Commission' },
    { name: 'shortName', label: 'Short name', type: 'text', required: true, placeholder: 'e.g. UPSC' },
    { name: 'slug', label: 'Slug', type: 'text', help: 'Used in web addresses. Leave empty to create it from the short name.' },
    { name: 'website', label: 'Website', type: 'text', placeholder: 'https://www.upsc.gov.in', help: 'Pre-fills the official link when a job is created for this organization.' },
    { name: 'categoryId', label: 'Sector', type: 'select', options: categories.map((c) => ({ label: c.name, value: c.id })) },
    { name: 'logoUrl', label: 'Logo', type: 'image', folder: 'organizations', slugFrom: 'shortName' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Add organization"
        fields={fields}
        onSubmit={(values) => adminApi.create('organizations', values)}
        backHref="/admin/organizations"
      />
    </div>
  );
}
