import type { LookupField } from './LookupForm';

export const LEVEL_HELP =
  'Decides eligibility: someone qualified at this level or higher meets a requirement for it. Scale used today: 1 = 8th, 2 = 10th, 3 = 12th, 4 = ITI / Apprentice, 5 = Diploma, 6 = Graduate, 7 = Post Graduate, 8 = Doctorate. Changing it changes who is eligible for every job that lists this qualification.';

export const TYPES_HELP =
  'Pick its level type (for example Graduate) and, for a field degree, its field (for example Engineering). Field types let a higher degree in the same field count towards a requirement.';

export function qualificationFields(types: { label: string; value: string }[]): LookupField[] {
  return [
    { name: 'name', label: 'Qualification name', type: 'text', required: true, placeholder: 'e.g. B.Tech / B.E' },
    { name: 'slug', label: 'Slug', type: 'text', help: 'Leave empty to create it from the name. Changing it changes the qualification filter links.' },
    { name: 'level', label: 'Level', type: 'number', required: true, min: 1, max: 12, help: LEVEL_HELP },
    { name: 'categoryIds', label: 'Education types', type: 'multi', options: types, help: TYPES_HELP },
  ];
}
