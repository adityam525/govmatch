'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';
import EducationFields, {
  blankRow,
  rowHasContent,
  rowsFromSaved,
  rowsToPayload,
  validateRows,
  type EducationRowState,
} from '@/components/profile/EducationFields';
import PreferencesFields from '@/components/profile/PreferencesFields';
import SpecialCategoriesFields, { FEMALE_ONLY_STATUSES, type SpecialState } from '@/components/profile/SpecialCategoriesFields';
import { computeCompleteness } from '@/lib/profile-completeness';
import { useAuth } from '@/features/auth/hooks';

const baseInput =
  'h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const fieldClass = (missing: boolean) =>
  `${baseInput} ${missing ? 'border-amber-300 bg-amber-50/50' : 'border-neutral-200'}`;

const serialize = (
  personal: unknown,
  special: unknown,
  prefs: unknown,
  rows: EducationRowState[],
) => JSON.stringify({ personal, special, prefs, rows: rows.map(({ key: _key, ...rest }) => rest) });

function RequiredTag() {
  return <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Required</span>;
}

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [personal, setPersonal] = useState({ phoneNumber: '', dateOfBirth: '', gender: '', category: '' });
  const [special, setSpecial] = useState<SpecialState>({ disabilityTypes: [], disabilityPercent: '', specialStatuses: [] });
  const [prefs, setPrefs] = useState<{ roleIds: string[]; types: string[] }>({ roleIds: [], types: [] });
  const [rows, setRows] = useState<EducationRowState[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const snapshot = useRef('');

  useEffect(() => {
    if (!user?.id) return;
    const id = user.id;
    let cancelled = false;

    Promise.all([
      fetch(`/api/users/${id}/profile`).then((r) => r.json()).catch(() => null),
      fetch(`/api/users/${id}/education`).then((r) => r.json()).catch(() => []),
      fetch(`/api/users/${id}/preferences`).then((r) => r.json()).catch(() => null),
    ]).then(([profile, education, preferences]) => {
      if (cancelled) return;
      const p = profile && !profile.message ? profile : {};
      const nextPersonal = {
        phoneNumber: p.phoneNumber ?? '',
        dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : '',
        gender: p.gender ?? '',
        category: p.category ?? '',
      };
      const nextSpecial: SpecialState = {
        disabilityTypes: p.disabilityTypes ?? [],
        disabilityPercent: p.disabilityPercent != null ? String(p.disabilityPercent) : '',
        specialStatuses: p.specialStatuses ?? [],
      };
      const nextPrefs = {
        roleIds: preferences?.preferredRoleIds ?? [],
        types: preferences?.preferredEmploymentTypes ?? [],
      };
      const nextRows = rowsFromSaved(Array.isArray(education) ? education : []);

      setPersonal(nextPersonal);
      setSpecial(nextSpecial);
      setPrefs(nextPrefs);
      setRows(nextRows);
      snapshot.current = serialize(nextPersonal, nextSpecial, nextPrefs, nextRows);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const dirty = loaded && serialize(personal, special, prefs, rows) !== snapshot.current;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const completeness = computeCompleteness({
    dateOfBirth: personal.dateOfBirth || null,
    educationCount: rows.filter((r) => r.qualificationId).length,
    category: personal.category || null,
    gender: personal.gender || null,
    phoneNumber: personal.phoneNumber || null,
    preferenceCount: prefs.roleIds.length + prefs.types.length,
  });
  const needs = (key: string) => completeness.items.find((i) => i.key === key && !i.done && i.required) !== undefined;

  const updatePersonal = (key: string, value: string) => {
    setPersonal((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const save = async () => {
    if (!user?.id) return;
    setMessage(null);

    const filled = rows.filter(rowHasContent);
    const today = new Date().toISOString().slice(0, 10);
    const digits = personal.phoneNumber.replace(/\D/g, '');
    const problem =
      (personal.dateOfBirth && (personal.dateOfBirth > today || personal.dateOfBirth < '1930-01-01')
        ? 'Enter a valid date of birth.'
        : null) ??
      (personal.phoneNumber && (digits.length < 10 || digits.length > 13) ? 'Enter a valid mobile number.' : null) ??
      (special.disabilityTypes.length > 0 &&
      special.disabilityPercent !== '' &&
      !(Number.isInteger(Number(special.disabilityPercent)) && Number(special.disabilityPercent) >= 0 && Number(special.disabilityPercent) <= 100)
        ? 'Disability percentage must be a whole number from 0 to 100.'
        : null) ??
      validateRows(filled);
    if (problem) {
      setMessage({ kind: 'error', text: problem });
      return;
    }

    const id = user.id;
    const fail = (section: string, text: string, saved: string[]) =>
      setMessage({
        kind: 'error',
        text: `${section}: ${text}${saved.length ? ` (${saved.join(' and ')} saved.)` : ' Nothing was saved.'}`,
      });

    setSaving(true);
    const saved: string[] = [];
    try {
      // Education goes first: it has the strictest checks, so a problem stops everything before anything is saved.
      const educationRes = await fetch(`/api/users/${id}/education`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rowsToPayload(filled) }),
      });
      const educationData = await educationRes.json().catch(() => ({}));
      if (!educationRes.ok) return fail('Education', educationData.message ?? 'could not be saved.', saved);
      saved.push('education');

      const statuses = special.specialStatuses.filter((s) => !FEMALE_ONLY_STATUSES.includes(s) || personal.gender === 'Female');
      const profileRes = await fetch(`/api/users/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...personal,
          disabilityTypes: special.disabilityTypes,
          disabilityPercent: special.disabilityTypes.length > 0 ? special.disabilityPercent : '',
          specialStatuses: statuses,
        }),
      });
      const profileData = await profileRes.json().catch(() => ({}));
      if (!profileRes.ok) return fail('Personal details', profileData.message ?? 'could not be saved.', saved);
      saved.push('personal details');

      const prefsRes = await fetch(`/api/users/${id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredRoleIds: prefs.roleIds, preferredEmploymentTypes: prefs.types }),
      });
      if (!prefsRes.ok) return fail('Preferences', 'could not be saved.', saved);

      const nextRows = rowsFromSaved(Array.isArray(educationData) ? educationData : []);
      const nextSpecial = { ...special, specialStatuses: statuses };
      setRows(nextRows);
      setSpecial(nextSpecial);
      snapshot.current = serialize(personal, nextSpecial, prefs, nextRows);
      setMessage({ kind: 'ok', text: 'Profile saved.' });
    } catch {
      fail('Network error', 'please try again.', saved);
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
  const blocked = completeness.requiredMissing.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:pt-8"
    >
      <section className={`rounded-2xl border p-4 sm:p-5 ${blocked ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-neutral-900">My Profile</h1>
            <p className="mt-1 text-sm text-neutral-700">
              {blocked
                ? `Still needed for job matching: ${completeness.requiredMissing.join(', ')}.`
                : completeness.missing.length > 0
                  ? `Matching is on. Optional: ${completeness.missing.join(', ')}.`
                  : 'Your profile is complete. Matches use everything you have added.'}
            </p>
          </div>
          <span className="shrink-0 text-2xl font-bold text-neutral-900">{completeness.percent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
          <div
            className={`h-full rounded-full transition-all ${blocked ? 'bg-amber-500' : 'bg-green-600'}`}
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-neutral-900">Personal details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">
              Date of birth{needs('dob') && <RequiredTag />}
            </span>
            <input type="date" max={today} value={personal.dateOfBirth} onChange={(e) => updatePersonal('dateOfBirth', e.target.value)} className={fieldClass(needs('dob'))} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">
              Category{needs('category') && <RequiredTag />}
            </span>
            <select value={personal.category} onChange={(e) => updatePersonal('category', e.target.value)} className={fieldClass(needs('category'))}>
              <option value="">Select...</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Gender</span>
            <select value={personal.gender} onChange={(e) => updatePersonal('gender', e.target.value)} className={fieldClass(false)}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Mobile number</span>
            <input type="tel" value={personal.phoneNumber} onChange={(e) => updatePersonal('phoneNumber', e.target.value)} placeholder="e.g. 9876543210" className={fieldClass(false)} />
          </label>
        </div>
      </section>

      <SpecialCategoriesFields value={special} gender={personal.gender} onChange={(next) => { setSpecial(next); setMessage(null); }} />

      {loaded ? (
        <EducationFields rows={rows} highlight={needs('education')} onChange={(next) => { setRows(next); setMessage(null); }} />
      ) : (
        <p className="mt-6 text-sm text-neutral-400">Loading your education...</p>
      )}

      <PreferencesFields roleIds={prefs.roleIds} types={prefs.types} onChange={(next) => { setPrefs(next); setMessage(null); }} />

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving || !loaded}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
          {message ? (
            <span className={`text-xs ${message.kind === 'ok' ? 'text-success' : 'text-danger'}`}>{message.text}</span>
          ) : dirty ? (
            <span className="text-xs text-amber-700">You have unsaved changes</span>
          ) : null}
        </div>
      </div>

      <Card padding="lg" className="mb-8 mt-6 border-red-100">
        <p className="text-sm font-bold text-danger">Danger Zone</p>
        <p className="mt-1 text-xs text-neutral-600">
          Deleting your account is permanent and cannot be undone. All your saved jobs, applications, and profile data will be removed.
        </p>
        <DeleteAccountButton />
      </Card>
    </form>
  );
}
