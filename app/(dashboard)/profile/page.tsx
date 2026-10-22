'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';
import PreferencesCard from '@/components/profile/PreferencesCard';
import EducationSection from '@/components/profile/EducationSection';
import { useAuth } from '@/features/auth/hooks';

const inputClass =
  'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ phoneNumber: '', dateOfBirth: '', gender: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/profile`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setForm({
          phoneNumber: data.phoneNumber ?? '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
          gender: data.gender ?? '',
          category: data.category ?? '',
        });
      })
      .catch(() => {});
  }, [user?.id]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: 'error', text: data.message ?? 'Could not save your details.' });
        return;
      }
      setMessage({ kind: 'ok', text: 'Saved.' });
    } catch {
      setMessage({ kind: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-neutral-600 sm:px-6">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Card padding="lg">
          <p className="text-sm text-neutral-600">Please log in to view your profile.</p>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-lg font-bold text-neutral-900">My Profile</h1>
        <p className="mb-5 mt-1 text-sm text-neutral-600">
          Keep this updated - it is what powers your job matches.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Mobile number</span>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              placeholder="e.g. 9876543210"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Date of birth</span>
            <input
              type="date"
              max={today}
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Gender</span>
            <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Category</span>
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4 sm:col-span-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save details'}
            </Button>
            {message && (
              <span className={`text-xs ${message.kind === 'ok' ? 'text-success' : 'text-danger'}`}>{message.text}</span>
            )}
          </div>
        </form>
      </section>

      <EducationSection />
      <PreferencesCard />

      <Card padding="lg" className="mt-6 border-red-100">
        <p className="text-sm font-bold text-danger">Danger Zone</p>
        <p className="mt-1 text-xs text-neutral-600">
          Deleting your account is permanent and cannot be undone. All your saved jobs, applications, and profile data will be removed.
        </p>
        <DeleteAccountButton />
      </Card>
    </div>
  );
}
