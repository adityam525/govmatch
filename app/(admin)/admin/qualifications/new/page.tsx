'use client';

import { useEffect, useState } from 'react';
import LookupForm from '@/components/admin/LookupForm';
import { qualificationFields } from '@/components/admin/qualification-fields';
import { adminApi } from '@/features/admin/api';

export default function NewQualificationPage() {
  const [types, setTypes] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    adminApi
      .list<{ id: string; name: string }>('qualification-categories')
      .then((rows) => setTypes(rows.map((r) => ({ label: r.name, value: r.id }))))
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <LookupForm
        title="Add qualification"
        fields={qualificationFields(types)}
        initialValues={{ categoryIds: [] }}
        onSubmit={(v) => adminApi.create('qualifications', v)}
        backHref="/admin/qualifications"
      />
    </div>
  );
}
