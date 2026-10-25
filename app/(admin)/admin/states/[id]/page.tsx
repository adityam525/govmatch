'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LookupForm, { type LookupField } from '@/components/admin/LookupForm';
import { adminApi } from '@/features/admin/api';

const fields: LookupField[] = [
  { name: 'name', label: 'State name', type: 'text', required: true },
  { name: 'code', label: 'State code', type: 'text', required: true, help: 'Changing the code changes the state filter links.' },
  { name: 'logoUrl', label: 'Logo or emblem', type: 'image', folder: 'states', slugFrom: 'code' },
];

export default function EditStatePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    adminApi.getById<Record<string, any>>('states', id).then(setData).catch(() => setData({}));
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Edit state"
        fields={fields}
        initialValues={data}
        onSubmit={(values) => adminApi.update('states', id, values)}
        onDelete={() => adminApi.remove('states', id)}
        backHref="/admin/states"
      />
    </div>
  );
}
