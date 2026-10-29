// One definition of "how complete is this profile", used by the dashboard, the homepage
// card and the profile page, so they can never disagree.

export interface CompletenessInput {
  dateOfBirth: Date | string | null | undefined;
  educationCount: number;
  category: string | null | undefined;
  gender: string | null | undefined;
  phoneNumber: string | null | undefined;
  /** Preferred roles plus preferred job types. */
  preferenceCount: number;
  /** Preferred states, sectors and organizations. */
  sectorPrefCount?: number;
}

export interface CompletenessItem {
  key: string;
  label: string;
  short: string;
  done: boolean;
  /** Needed before job matches can be trusted. */
  required: boolean;
}

export interface Completeness {
  items: CompletenessItem[];
  percent: number;
  /** Short names of everything missing, required items first. */
  missing: string[];
  requiredMissing: string[];
}

export function computeCompleteness(input: CompletenessInput): Completeness {
  const items: CompletenessItem[] = [
    { key: 'dob', label: 'Date of birth', short: 'date of birth', done: !!input.dateOfBirth, required: true },
    { key: 'education', label: 'Education (at least one qualification)', short: 'education', done: input.educationCount > 0, required: true },
    { key: 'category', label: 'Category (General, OBC, SC, ST, EWS)', short: 'category', done: !!input.category, required: true },
    { key: 'gender', label: 'Gender', short: 'gender', done: !!input.gender, required: false },
    { key: 'phone', label: 'Mobile number', short: 'mobile number', done: !!input.phoneNumber, required: false },
    { key: 'prefs', label: 'Job preferences (roles or job type)', short: 'job preferences', done: input.preferenceCount > 0, required: false },
    { key: 'places', label: 'Preferred states, sectors or organizations', short: 'preferred states, sectors or organizations', done: (input.sectorPrefCount ?? 0) > 0, required: false },
  ];
  const done = items.filter((item) => item.done).length;
  const missingItems = items.filter((item) => !item.done).sort((a, b) => Number(b.required) - Number(a.required));
  return {
    items,
    percent: Math.round((done / items.length) * 100),
    missing: missingItems.map((item) => item.short),
    requiredMissing: missingItems.filter((item) => item.required).map((item) => item.short),
  };
}
