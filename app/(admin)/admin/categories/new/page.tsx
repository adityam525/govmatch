'use client';

import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'Category name', type: 'text', required: true, placeholder: 'e.g. Railway' },
  { name: 'slug', label: 'Slug', type: 'text', help: 'Leave empty to create it from the name.' },
];

export default function NewCategoryPage() {
  return (
    <div className="p-4 sm:p-6">
      <LookupForm title="Add category" fields={fields} onSubmit={(values) => adminApi.create('categories', values)} backHref="/admin/categories" />
    </div>
  );
}
