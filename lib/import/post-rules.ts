import { CERT_CODES } from '../eligibility-options';
import { DISABILITY_CODES, legacyRelaxationMap, parseRules, type RelaxationRule } from '../special-categories';
import { parseCategoryMarks, parseTypingOptions, type TypingOption } from '../skill-rules';

export interface PostRules {
  genderRestriction: 'MALE' | 'FEMALE' | null;
  minExperienceYears: number | null;
  requiredCertifications: string[];
  domicileStateCode: string | null;
  minHeightCm: number | null;
  minChestCm: number | null;
  maxQualificationLevel: number | null;
  shorthandWpm: number | null;
  pwdTypes: string[];
  relaxationRules: RelaxationRule[];
  ageRelaxation: Record<string, string>;
  ageCutoffDate: Date | null;
  minMarksPercent: number | null;
  minMarksByCategory: Record<string, number>;
  typingOptions: TypingOption[];
}

const blank = (v: unknown) => v === '' || v === null || v === undefined;
// null when empty, undefined when not a whole number in range
function whole(v: unknown, min: number, max: number): number | null | undefined {
  if (blank(v)) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : blank(v) ? [] : [v]);

export function readPostRules(p: any): { rules: PostRules; errors: string[] } {
  const errors: string[] = [];
  const src = p && typeof p === 'object' ? p : {};

  let genderRestriction: PostRules['genderRestriction'] = null;
  if (!blank(src.genderRestriction)) {
    const g = String(src.genderRestriction).trim().toUpperCase();
    if (g === 'MALE' || g === 'FEMALE') genderRestriction = g;
    else errors.push('genderRestriction must be MALE or FEMALE (or left out)');
  }

  const exp = whole(src.minExperienceYears, 0, 50);
  if (exp === undefined) errors.push('minExperienceYears must be a whole number from 0 to 50');
  const height = whole(src.minHeightCm, 100, 230);
  if (height === undefined) errors.push('minHeightCm must be between 100 and 230');
  const chest = whole(src.minChestCm, 50, 150);
  if (chest === undefined) errors.push('minChestCm must be between 50 and 150');

  const shorthand = whole(src.shorthandWpm, 40, 200);
  if (shorthand === undefined) errors.push('shorthandWpm must be a whole number from 40 to 200');
  const maxLevel = whole(src.maxQualificationLevel, 1, 8);
  if (maxLevel === undefined) errors.push('maxQualificationLevel must be a level from 1 to 8');

  const certs = list(src.requiredCertifications).map((c) => String(c).trim().toUpperCase());
  for (const c of certs) if (!CERT_CODES.has(c)) errors.push('requiredCertifications has an unknown code "' + c + '"');

  const pwd = list(src.pwdTypes).map((c) => String(c).trim().toUpperCase());
  for (const c of pwd) if (!DISABILITY_CODES.has(c)) errors.push('pwdTypes has an unknown group "' + c + '"');

  let domicile: string | null = null;
  if (!blank(src.domicileStateCode)) {
    const d = String(src.domicileStateCode).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(d)) domicile = d;
    else errors.push('domicileStateCode must be a two-letter state code such as BR');
  }

  let cutoff: Date | null = null;
  if (!blank(src.ageCutoffDate)) {
    const t = String(src.ageCutoffDate).trim();
    const d = /^\d{4}-\d{2}-\d{2}$/.test(t) ? new Date(t + 'T00:00:00.000Z') : null;
    if (d && !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === t) cutoff = d;
    else errors.push('ageCutoffDate must be a real date in YYYY-MM-DD format');
  }

  let relaxationRules: RelaxationRule[] = [];
  if (!blank(src.relaxationRules)) {
    const r = parseRules(src.relaxationRules);
    if (r.errors.length > 0) errors.push('relaxationRules: ' + r.errors[0]);
    relaxationRules = r.rules;
  }

  let marksBase: number | null = null;
  if (!blank(src.minMarksPercent)) {
    const n = Number(src.minMarksPercent);
    if (Number.isFinite(n) && n >= 0 && n <= 100) marksBase = n;
    else errors.push('minMarksPercent must be from 0 to 100');
  }
  const rawByCategory = src.minMarksByCategory && typeof src.minMarksByCategory === 'object' && !Array.isArray(src.minMarksByCategory) ? src.minMarksByCategory : {};
  const byCategory = parseCategoryMarks(rawByCategory);
  if (Object.keys(byCategory).length < Object.values(rawByCategory).filter((v) => !blank(v)).length) {
    errors.push('minMarksByCategory has a value that is not a percentage from 0 to 100');
  }

  const rawTyping = list(src.typingOptions);
  const typing = parseTypingOptions(rawTyping);
  if (typing.length < rawTyping.length) errors.push('typingOptions entries must look like { "lang": "EN" or "HI", "wpm": 5 to 200 }');

  return {
    errors,
    rules: {
      genderRestriction, minExperienceYears: exp ?? null, requiredCertifications: [...new Set(certs)], domicileStateCode: domicile,
      minHeightCm: height ?? null, minChestCm: chest ?? null, maxQualificationLevel: maxLevel ?? null, shorthandWpm: shorthand ?? null, pwdTypes: [...new Set(pwd)], relaxationRules,
      ageRelaxation: relaxationRules.length ? legacyRelaxationMap(relaxationRules) : {}, ageCutoffDate: cutoff,
      minMarksPercent: marksBase, minMarksByCategory: byCategory, typingOptions: typing,
    },
  };
}
