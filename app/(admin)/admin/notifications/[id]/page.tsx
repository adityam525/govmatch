'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAdminRecord } from '@/features/admin/hooks';
import { adminApi } from '@/features/admin/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LinksFieldArray, { LinkDraft } from '@/components/admin/LinksFieldArray';
import { validateNotificationDates } from '@/features/jobs/validation';

interface OrgOption { id: string; name: string; }

const SELECTION_STEPS = ['Written Exam', 'Skill Test', 'Physical Test', 'Document Verification', 'Medical Examination', 'Interview'];

export default function EditNotificationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, save } = useAdminRecord<any>('notifications', id);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [form, setForm] = useState<any>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    adminApi.list<OrgOption>('organizations').then(setOrganizations).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? '',
      organizationId: data.organizationId ?? '',
      advertisementNo: data.advertisementNo ?? '',
      officialLink: data.officialLink ?? '',
      applicationMode: data.applicationMode ?? 'ONLINE',
      status: data.status ?? 'LIVE',
      notificationDate: data.notificationDate ? data.notificationDate.slice(0, 10) : '',
      applicationStartDate: data.applicationStartDate ? data.applicationStartDate.slice(0, 10) : '',
      applicationEndDate: data.applicationEndDate ? data.applicationEndDate.slice(0, 10) : '',
      examDate: data.examDate ? data.examDate.slice(0, 10) : '',
      isFeatured: data.isFeatured ?? false,
      published: data.published ?? false,
      applicationFeeGeneral: data.applicationFeeGeneral ?? '',
      applicationFeeScSt: data.applicationFeeScSt ?? '',
      howToApply: data.howToApply ?? '',
    });
    setSelectedSteps(data.selectionProcess ?? []);

    fetch(`/api/notification-links?notificationId=${id}`)
      .then((r) => r.json())
      .then((existingLinks) => {
        setLinks(
          Array.isArray(existingLinks)
            ? existingLinks.map((l: any) => ({ label: l.label, url: l.url, linkType: l.linkType }))
            : []
        );
      })
      .catch(() => {});
  }, [data, id]);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
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
      await save({ ...form, selectionProcess: selectedSteps });

      const existingLinks = await fetch(`/api/notification-links?notificationId=${id}`).then((r) => r.json());
      if (Array.isArray(existingLinks)) {
        await Promise.all(existingLinks.map((l: any) => adminApi.remove('notification-links', l.id)));
      }
      await Promise.all(
        links
          .filter((l) => l.url)
          .map((l, i) => adminApi.create('notification-links', { ...l, notificationId: id, order: i }))
      );

      router.push('/admin/notifications');
    } catch (err) {
      console.error(err);
      setFormError('Failed to save. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) return <div className="p-6">Loading...</div>;

  const inputClass = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

  return (
    <div className="p-6 max-w-3xl">
      <Card padding="lg">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Edit Job</h2>

        {formError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 text-xs text-danger">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Title *</label>
            <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} />
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
            <input value={form.applicationFeeGeneral} onChange={(e) => updateField('applicationFeeGeneral', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Application Fee (SC/ST/PwD)</label>
            <input value={form.applicationFeeScSt} onChange={(e) => updateField('applicationFeeScSt', e.target.value)} className={inputClass} />
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
                Published <span className="text-neutral-400">(visible to the public - uncheck to unpublish/save as draft)</span>
              </span>
            </label>
          </div>

          <LinksFieldArray links={links} onChange={setLinks} />

          <div className="md:col-span-2 flex gap-3 pt-4 border-t border-neutral-100 mt-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
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
