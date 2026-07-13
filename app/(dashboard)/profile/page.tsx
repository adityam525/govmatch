'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';

interface QualificationOption { id: string; name: string; }

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [qualifications, setQualifications] = useState<QualificationOption[]>([]);
  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: '',
    category: '',
    qualificationId: '',
    degreeName: '',
    yearOfPassing: '',
    percentage: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/qualifications').then((r) => r.json()).then(setQualifications).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/profile`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
            gender: data.gender ?? '',
            category: data.category ?? '',
            qualificationId: data.qualificationId ?? '',
            degreeName: data.degreeName ?? '',
            yearOfPassing: data.yearOfPassing?.toString() ?? '',
            percentage: data.percentage?.toString() ?? '',
          });
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await fetch(`/api/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || null,
          yearOfPassing: form.yearOfPassing ? Number(form.yearOfPassing) : null,
          percentage: form.percentage ? Number(form.percentage) : null,
        }),
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  if (authLoading) {
    return <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card padding="lg">
          <p className="text-sm text-neutral-600">Please log in to view your profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Card padding="lg">
        <h1 className="text-lg font-bold text-neutral-900 mb-1">My Profile</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Keep this updated - it's what powers your personalized job matches.
        </p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Gender</label>
            <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Highest Qualification</label>
            <select value={form.qualificationId} onChange={(e) => updateField('qualificationId', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {qualifications.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Degree Name</label>
            <input
              type="text"
              value={form.degreeName}
              onChange={(e) => updateField('degreeName', e.target.value)}
              placeholder="e.g. B.E. Computer Science"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Year of Passing</label>
            <input
              type="number"
              value={form.yearOfPassing}
              onChange={(e) => updateField('yearOfPassing', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Percentage / CGPA</label>
            <input
              type="number"
              step="0.01"
              value={form.percentage}
              onChange={(e) => updateField('percentage', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-4 border-t border-neutral-100 mt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            {saved && <span className="text-xs text-success">Saved!</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
