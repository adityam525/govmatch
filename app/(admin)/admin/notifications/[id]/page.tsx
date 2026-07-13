'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAdminRecord } from '@/features/admin/hooks';
import { adminApi } from '@/features/admin/api';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

interface OrgOption { id: string; name: string; }

export default function EditNotificationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, save } = useAdminRecord('notifications', id);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);

  useEffect(() => {
    adminApi.list<OrgOption>('organizations').then(setOrganizations).catch(() => {});
  }, []);

  const fields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    {
      name: 'organizationId', label: 'Organization', type: 'select', required: true,
      options: organizations.map((o) => ({ label: o.name, value: o.id })),
    },
    { name: 'advertisementNo', label: 'Advertisement No.', type: 'text' },
    { name: 'officialLink', label: 'Official Link', type: 'text', required: true },
    {
      name: 'status', label: 'Status', type: 'select', required: true,
      options: [
        { label: 'Upcoming', value: 'UPCOMING' },
        { label: 'Live', value: 'LIVE' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      name: 'applicationMode', label: 'Application Mode', type: 'select',
      options: [
        { label: 'Online', value: 'ONLINE' },
        { label: 'Offline', value: 'OFFLINE' },
        { label: 'Both', value: 'BOTH' },
      ],
    },
    { name: 'notificationDate', label: 'Notification Date', type: 'date' },
    { name: 'applicationStartDate', label: 'Application Start Date', type: 'date' },
    { name: 'applicationEndDate', label: 'Application End Date (Last Date)', type: 'date', required: true },
    { name: 'examDate', label: 'Exam Date', type: 'date' },
    { name: 'isFeatured', label: 'Featured on Homepage', type: 'checkbox' },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <RecordForm
        title="Edit Notification"
        fields={fields}
        initialValues={data ?? {}}
        onSubmit={(v) => save(v)}
        backHref="/admin/notifications"
      />
      <p className="text-xs text-neutral-400 mt-3">
        To edit individual posts within this notification, go to Posts and filter/search by this notification's ID.
      </p>
    </div>
  );
}
