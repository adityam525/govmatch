'use client';

import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Engineering' },
  { name: 'slug', label: 'Slug', type: 'text', help: 'Leave empty to create it from the name.' },
  { name: 'order', label: 'Display order', type: 'number', min: 0, max: 999, help: 'Lower numbers come first in filters and forms. Leave empty to put it last.' },
];

export default function NewEducationTypePage() {
  return (
    <div className="p-4 sm:p-6">
      <LookupForm title="Add education type" fields={fields} onSubmit={(v) => adminApi.create('qualification-categories', v)} backHref="/admin/qualification-categories" />
    </div>
  );
}
