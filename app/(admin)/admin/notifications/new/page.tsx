'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PostsFieldArray, { PostDraft } from '@/components/admin/PostsFieldArray';
import LinksFieldArray, { LinkDraft } from '@/components/admin/LinksFieldArray';
import { adminApi } from '@/features/admin/api';
import { validateNotificationDates } from '@/features/jobs/validation';

interface OrgOption { id: string; name: string; }

const SELECTION_STEPS = ['Written Exam', 'Skill Test', 'Physical Test', 'Document Verification', 'Medical Examination', 'Interview'];

export default function NewNotificationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    organizationId: '',
    advertisementNo: '',
    officialLink: '',
    applicationMode: 'ONLINE',
    status: 'LIVE',
    notificationDate: '',
    applicationStartDate: '',
    applicationEndDate: '',
    examDate: '',
    isFeatured: false,
    published: false,
    applicationFeeGeneral: '',
    applicationFeeScSt: '',
    howToApply: '',
  });

  const [posts, setPosts] = useState<PostDraft[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);

  useEffect(() => {
    adminApi.list<OrgOption>('organizations').then(setOrganizations).catch(() => {});
  }, []);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const toggleStep = (step: string) => {
    setSelectedSteps((prev) => (prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateError = validateNotificationDates(form);
    if (dateError) {
      setFormError(dateError);
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.create('notifications', {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        selectionProcess: selectedSteps,
        posts: posts.filter((p) => p.title && p.qualificationId),
        links: links.filter((l) => l.url),
      });
      router.push('/admin/notifications');
    } catch (err) {
      console.error(err);
      setFormError('Failed to save. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <div className="p-6 max-w-3xl">
      <Card padding="lg">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Add New Job</h2>

        {formError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 text-xs text-danger">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Title *</label>
            <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} placeholder="e.g. SSC CGL 2026" />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Organization *</label>
            <select required value={form.organizationId} onChange={(e) => updateField('organizationId', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Advertisement No.</label>
            <input value={form.advertisementNo} onChange={(e) => updateField('advertisementNo', e.target.value)} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Official Link *</label>
            <input required value={form.officialLink} onChange={(e) => updateField('officialLink', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Status *</label>
            <select required value={form.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
              <option value="UPCOMING">Upcoming</option>
              <option value="LIVE">Live</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application Mode</label>
            <select value={form.applicationMode} onChange={(e) => updateField('applicationMode', e.target.value)} className={inputClass}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Notification Date</label>
            <input type="date" value={form.notificationDate} onChange={(e) => updateField('notificationDate', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application Start Date</label>
            <input type="date" value={form.applicationStartDate} onChange={(e) => updateField('applicationStartDate', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application End Date (Last Date) *</label>
            <input required type="date" value={form.applicationEndDate} onChange={(e) => updateField('applicationEndDate', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Exam Date</label>
            <input type="date" value={form.examDate} onChange={(e) => updateField('examDate', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application Fee (General/OBC/EWS)</label>
            <input value={form.applicationFeeGeneral} onChange={(e) => updateField('applicationFeeGeneral', e.target.value)} placeholder="e.g. Rs 500" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application Fee (SC/ST/PwD)</label>
            <input value={form.applicationFeeScSt} onChange={(e) => updateField('applicationFeeScSt', e.target.value)} placeholder="e.g. Rs 250" className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Selection Process</label>
            <div className="flex flex-wrap gap-2">
              {SELECTION_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => toggleStep(step)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    selectedSteps.includes(step)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-200'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">How to Apply (notes)</label>
            <textarea value={form.howToApply} onChange={(e) => updateField('howToApply', e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2 border-t border-neutral-100 pt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} />
              <span className="text-sm text-neutral-600">Featured on Homepage</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => updateField('published', e.target.checked)} />
              <span className="text-sm text-neutral-600">
                Published <span className="text-neutral-400">(visible to the public - leave unchecked to save as draft)</span>
              </span>
            </label>
          </div>

          <PostsFieldArray posts={posts} onChange={setPosts} />

          <LinksFieldArray links={links} onChange={setLinks} />

          <div className="md:col-span-2 flex gap-3 pt-4 border-t border-neutral-100 mt-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Job'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/admin/notifications')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
