'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/features/admin/api';

interface NotificationOption {
  id: string;
  title: string;
  organization?: { name: string };
}

interface NotificationSelectProps {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}

export default function NotificationSelect({ value, onChange, required }: NotificationSelectProps) {
  const [notifications, setNotifications] = useState<NotificationOption[]>([]);

  useEffect(() => {
    adminApi.list<NotificationOption>('notifications').then(setNotifications).catch(() => {});
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
        Notification {required && <span className="text-danger">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
      >
        <option value="">Select a notification...</option>
        {notifications.map((n) => (
          <option key={n.id} value={n.id}>
            {n.title}{n.organization?.name ? ` (${n.organization.name})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
