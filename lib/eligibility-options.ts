// Shared by the profile form, the admin post editor and the matching rules.

export const CERTIFICATIONS = [
  { code: 'CTET', label: 'CTET qualified' },
  { code: 'TET', label: 'State TET qualified' },
  { code: 'NET', label: 'UGC NET / SET qualified' },
  { code: 'GATE', label: 'GATE (valid score)' },
  { code: 'CCC', label: 'Computer course (CCC / O Level / DOEACC)' },
  { code: 'TYPING_EN', label: 'English typing test' },
  { code: 'TYPING_HI', label: 'Hindi typing test' },
  { code: 'DL_LMV', label: 'Driving licence (light vehicle)' },
  { code: 'DL_HMV', label: 'Driving licence (heavy vehicle)' },
  { code: 'NCC', label: 'NCC certificate' },
  { code: 'SPORTS', label: 'Sports achievement (state or national level)' },
] as const;

export const CERT_CODES = new Set<string>(CERTIFICATIONS.map((c) => c.code));
export const certLabel = (code: string) => CERTIFICATIONS.find((c) => c.code === code)?.label ?? code;

export const GENDER_RESTRICTIONS = [
  { code: '', label: 'Open to all' },
  { code: 'MALE', label: 'Men only' },
  { code: 'FEMALE', label: 'Women only' },
] as const;
