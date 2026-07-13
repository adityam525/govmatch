'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'notificationId', label: 'Notification ID (optional)', type: 'text' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'docType', label: 'Document Type', type: 'select', required: true,
    options: [
      { label: 'Syllabus', value: 'SYLLABUS' },
      { label: 'Exam Pattern', value: 'EXAM_PATTERN' },
      { label: 'Selection Process', value: 'SELECTION_PROCESS' },
      { label: 'Previous Paper', value: 'PREVIOUS_PAPER' },
      { label: 'Exam Calendar', value: 'EXAM_CALENDAR' },
      { label: 'Other', value: 'OTHER' },
    ],
  },
  { name: 'fileUrl', label: 'File URL', type: 'text', required: true },
];

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('documents', id);
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <RecordForm title="Edit Document" fields={fields} initialValues={data ?? {}} onSubmit={(v) => save(v)} backHref="/admin/documents" />
    </div>
  );
}
