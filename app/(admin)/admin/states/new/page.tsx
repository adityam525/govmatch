'use client';

import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'State name', type: 'text', required: true, placeholder: 'e.g. Bihar' },
  { name: 'code', label: 'State code', type: 'text', required: true, placeholder: 'e.g. BR', help: '2 to 6 capital letters. Used in filter links.' },
  { name: 'logoUrl', label: 'Logo or emblem', type: 'image', folder: 'states', slugFrom: 'code' },
];

export default function NewStatePage() {
  return (
    <div className="p-4 sm:p-6">
      <LookupForm title="Add state" fields={fields} onSubmit={(values) => adminApi.create('states', values)} backHref="/admin/states" />
    </div>
  );
}
