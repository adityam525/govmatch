// Plain-language reasons why a job does not fit a user, shown in the tooltip on the
// jobs list. They are worked out from the same facts the matcher uses (qualification
// level, age limits, job-type preferences) so the message names a concrete cause. The
// matcher decides who is eligible; if none of these facts explains a rejection, a
// generic message is returned instead of an invented reason.

export interface EligibilityVerdict {
  label: string;
  reasons: string[];
}

interface QualificationRef {
  name: string;
  level: number;
}

export interface ReasonUser {
  qualificationName: string | null;
  qualificationLevel: number | null;
  age: number | null;
  preferredEmploymentTypes: string[];
}

export interface ReasonPost {
  minAge?: number | null;
  maxAge?: number | null;
  employmentType?: string | null;
  qualification?: QualificationRef | null;
  qualifications?: QualificationRef[];
}

const TYPE_LABEL: Record<string, string> = {
  PERMANENT: 'permanent',
  CONTRACT: 'contract',
  APPRENTICE: 'apprentice',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
  DEPUTATION: 'deputation',
};

export function ageInYears(dob: Date | string, now: Date = new Date()): number {
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function explainIneligibility(user: ReasonUser, post: ReasonPost): EligibilityVerdict {
  const reasons: string[] = [];
  let preferenceOnly = true;

  const required = [...(post.qualifications ?? []), ...(post.qualification ? [post.qualification] : [])];
  if (required.length > 0) {
    const minLevel = Math.min(...required.map((q) => q.level));
    const names = [...new Set(required.filter((q) => q.level === minLevel).map((q) => q.name))];
    if (user.qualificationLevel === null) {
      reasons.push('Add your qualification to your profile so we can check this job.');
      preferenceOnly = false;
    } else if (user.qualificationLevel < minLevel) {
      const yours = user.qualificationName ? `; your highest is ${user.qualificationName}` : '';
      reasons.push(`Needs ${names.join(' or ')} or higher${yours}.`);
      preferenceOnly = false;
    }
  }

  if (user.age !== null) {
    const { minAge, maxAge } = post;
    if (maxAge != null && user.age > maxAge) {
      reasons.push(
        minAge != null
          ? `Age limit is ${minAge} to ${maxAge} years; you are ${user.age}.`
          : `Maximum age is ${maxAge} years; you are ${user.age}.`,
      );
      preferenceOnly = false;
    } else if (minAge != null && user.age < minAge) {
      reasons.push(`Minimum age is ${minAge} years; you are ${user.age}.`);
      preferenceOnly = false;
    }
  }

  const preferred = user.preferredEmploymentTypes;
  if (preferred.length > 0 && post.employmentType && !preferred.includes(post.employmentType)) {
    const type = TYPE_LABEL[post.employmentType] ?? post.employmentType.toLowerCase();
    reasons.push(`This is a ${type} job, which is not in your job-type preferences.`);
  }

  if (reasons.length === 0) {
    return { label: 'Not a match', reasons: ['This job does not fit your profile.'] };
  }
  return { label: preferenceOnly ? 'Not in your preferences' : 'Not eligible', reasons };
}
