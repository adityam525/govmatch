'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface QualificationOption { id: string; name: string; }

export default function SignupPage() {
  const router = useRouter();
  const [qualifications, setQualifications] = useState<QualificationOption[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    qualificationId: '',
    degreeName: '',
    yearOfPassing: '',
    percentage: '',
  });

  useEffect(() => {
    fetch('/api/qualifications').then((r) => r.json()).then(setQualifications).catch(() => {});
  }, []);

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? 'Signup failed');
        return;
      }

      router.push('/login?signedUp=true');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-6">
      <Card padding="lg" className="w-full max-w-xl">
        <h1 className="text-xl font-bold text-neutral-900 mb-1">Create your GovMatch account</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Fill in your details once - this powers your personalized job matches from day one.
        </p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Full Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Password *</label>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 border-t border-neutral-100 pt-4 mt-1">
            <p className="text-xs font-semibold text-neutral-900 mb-3">Education & Eligibility (optional, improves matches)</p>
          </div>

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

          {error && <p className="md:col-span-2 text-xs text-danger">{error}</p>}

          <div className="md:col-span-2 pt-2">
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="text-xs text-neutral-600 text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
