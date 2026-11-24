import { certLabel } from '@/lib/eligibility-options';

export interface ChecklistItem { id: string; label: string; note?: string }

// Documents a candidate should have ready, from what the notice's posts require.
export function buildChecklist(posts: any[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: 'photo', label: 'Recent passport-size photograph', note: 'Check the size in the notice. The photo and signature resizer can fit it.' },
    { id: 'sign', label: 'Scanned signature' },
    { id: 'id', label: 'Photo ID proof (such as Aadhaar)' },
    { id: 'contact', label: 'Active email address and mobile number', note: 'Alerts and admit cards are sent here.' },
    { id: 'dob', label: 'Date of birth proof (10th certificate)' },
    { id: 'edu', label: 'Educational certificates and marksheets for each qualification you claim' },
    { id: 'cat', label: 'Category certificate, if you claim SC, ST, OBC (non-creamy layer) or EWS', note: 'It must be in the format and year the notice asks for.' },
    { id: 'fee', label: 'Way to pay the fee (debit card, net banking or UPI)' },
  ];
  const any = (f: (p: any) => unknown) => posts.some((p) => !!f(p));
  const add = (item: ChecklistItem) => { if (!items.some((i) => i.id === item.id)) items.push(item); };

  if (any((p) => p.pwdTypes?.length) || any((p) => p.pwdVacancies && Object.keys(p.pwdVacancies).length)) add({ id: 'pwd', label: 'Disability certificate (percentage and type)' });
  if (any((p) => p.domicileStateCode)) add({ id: 'dom', label: 'Domicile (residence) certificate' });
  if (any((p) => (p.minExperienceYears ?? 0) > 0 || (p.minDrivingYears ?? 0) > 0)) add({ id: 'exp', label: 'Experience certificate from your employer' });
  if (any((p) => p.typingOptions?.length || p.shorthandWpm)) add({ id: 'skill', label: 'Typing or shorthand certificate, if the notice asks for one' });
  if (any((p) => p.minHeightCm || p.minChestCm)) add({ id: 'phys', label: 'Be ready for physical measurement (height and chest)' });
  const certs = [...new Set(posts.flatMap((p) => (p.requiredCertifications ?? []) as string[]))];
  for (const c of certs) add({ id: 'cert-' + c, label: certLabel(c) + ' certificate or proof' });
  return items;
}
