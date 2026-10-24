import { certLabel } from './eligibility-options';

export interface ReqUser {
  gender: string | null;
  domicileStateCode: string | null;
  experienceYears: number | null;
  certifications: string[];
  heightCm: number | null;
  chestCm: number | null;
}

export interface ReqPost {
  genderRestriction?: string | null;
  minExperienceYears?: number | null;
  requiredCertifications?: string[];
  domicileStateCode?: string | null;
  minHeightCm?: number | null;
  minChestCm?: number | null;
}

export interface ReqCheck {
  label: string;
  text: string;
  state: 'ok' | 'fail' | 'unknown' | 'lower';
}

export interface ReqResult {
  status: 'yes' | 'no' | 'unknown';
  checks: ReqCheck[];
}

// Only what the notice actually states is checked; a post with no extra requirements
// returns 'yes' with no checks. A clear failure always wins over a missing profile detail.
export function evaluateRequirements(
  user: ReqUser,
  post: ReqPost,
  stateName: (code: string) => string = (code) => code,
): ReqResult {
  const checks: ReqCheck[] = [];
  const add = (label: string, text: string, state: ReqCheck['state']) => checks.push({ label, text, state });

  const restriction = post.genderRestriction;
  if (restriction === 'MALE' || restriction === 'FEMALE') {
    const who = restriction === 'MALE' ? 'men' : 'women';
    const wanted = restriction === 'MALE' ? 'Male' : 'Female';
    if (!user.gender) add('Gender', `This job is open to ${who} only. Add your gender to your profile to check.`, 'unknown');
    else if (user.gender === wanted) add('Gender', `This job is open to ${who}, which fits your profile.`, 'ok');
    else if (user.gender === 'Other') add('Gender', `This job is open to ${who} only. Check the official notice for how it applies to you.`, 'unknown');
    else add('Gender', `This job is open to ${who} only.`, 'fail');
  }

  if (post.domicileStateCode) {
    const state = stateName(post.domicileStateCode);
    if (!user.domicileStateCode) add('Home state', `Only residents (domicile) of ${state} can apply. Add your home state to check.`, 'unknown');
    else if (user.domicileStateCode === post.domicileStateCode) add('Home state', `Your home state (${state}) fits.`, 'ok');
    else add('Home state', `Only residents (domicile) of ${state} can apply; your home state is ${stateName(user.domicileStateCode)}.`, 'fail');
  }

  const needYears = post.minExperienceYears;
  if (needYears != null && needYears > 0) {
    if (user.experienceYears == null) add('Experience', `Needs ${needYears} years of experience. Add your experience to check.`, 'unknown');
    else if (user.experienceYears >= needYears) add('Experience', `Your ${user.experienceYears} years of experience meets the ${needYears} years needed.`, 'ok');
    else add('Experience', `Needs ${needYears} years of experience; you have ${user.experienceYears}.`, 'fail');
  }

  const required = post.requiredCertifications ?? [];
  if (required.length > 0) {
    const missing = required.filter((code) => !user.certifications.includes(code));
    if (missing.length === 0) add('Certificates', `You hold ${required.map(certLabel).join(', ')}.`, 'ok');
    else add('Certificates', `Needs ${missing.map(certLabel).join(', ')}. Add it to your profile if you have it.`, 'fail');
  }

  if (post.minHeightCm != null) {
    if (user.heightCm == null) add('Height', `Needs a minimum height of ${post.minHeightCm} cm. Add your height to check.`, 'unknown');
    else if (user.heightCm >= post.minHeightCm) add('Height', `Your height (${user.heightCm} cm) meets the ${post.minHeightCm} cm minimum.`, 'ok');
    else add('Height', `Needs a minimum height of ${post.minHeightCm} cm; you are ${user.heightCm} cm.`, 'fail');
  }

  if (post.minChestCm != null && user.gender !== 'Female') {
    if (user.chestCm == null) add('Chest', `Needs a minimum chest of ${post.minChestCm} cm. Add your chest measurement to check.`, 'unknown');
    else if (user.chestCm >= post.minChestCm) add('Chest', `Your chest (${user.chestCm} cm) meets the ${post.minChestCm} cm minimum.`, 'ok');
    else add('Chest', `Needs a minimum chest of ${post.minChestCm} cm; yours is ${user.chestCm} cm.`, 'fail');
  }

  const status = checks.some((c) => c.state === 'fail') ? 'no' : checks.some((c) => c.state === 'unknown') ? 'unknown' : 'yes';
  return { status, checks };
}
