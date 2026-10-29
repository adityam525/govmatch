'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LookupForm from '@/components/admin/LookupForm';
import BranchManager from '@/components/admin/BranchManager';
import { qualificationFields } from '@/components/admin/qualification-fields';
import { adminApi } from '@/features/admin/api';

export default function EditQualificationPage() {
  const { id } = useParams<{ id: string }>();
  const [types, setTypes] = useState<{ label: string; value: string }[]>([]);
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    adminApi
      .list<{ id: string; name: string }>('qualification-categories')
      .then((rows) => setTypes(rows.map((r) => ({ label: r.name, value: r.id }))))
      .catch(() => {});
    adminApi.getById<Record<string, any>>('qualifications', id).then(setData).catch(() => setData({}));
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Edit qualification"
        fields={qualificationFields(types)}
        initialValues={data}
        onSubmit={(v) => adminApi.update('qualifications', id, v)}
        onDelete={() => adminApi.remove('qualifications', id)}
        backHref="/admin/qualifications"
      />
      {data.slug && <BranchManager qualificationId={id} qualificationSlug={data.slug} />}
    </div>
  );
}
