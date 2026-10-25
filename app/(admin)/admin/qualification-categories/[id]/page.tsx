'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', help: 'Changing this changes the education filter links.' },
  { name: 'order', label: 'Display order', type: 'number', min: 0, max: 999, help: 'Lower numbers come first.' },
];

export default function EditEducationTypePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    adminApi.getById<Record<string, any>>('qualification-categories', id).then(setData).catch(() => setData({}));
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Edit education type"
        fields={fields}
        initialValues={data}
        onSubmit={(v) => adminApi.update('qualification-categories', id, v)}
        onDelete={() => adminApi.remove('qualification-categories', id)}
        backHref="/admin/qualification-categories"
      />
    </div>
  );
}
