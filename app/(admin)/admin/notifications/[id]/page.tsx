'use client';

import { useParams } from 'next/navigation';
import JobForm from '@/components/admin/job-form/JobForm';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  return <JobForm mode="edit" jobId={id} />;
}
