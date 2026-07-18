interface ProfileInput {
  dateOfBirth?: Date | null;
  category?: string | null;
  qualificationLevel?: number | null;
  branchId?: string | null;
  preferredRoleIds?: string[];
  preferredEmploymentTypes?: string[];
}

interface PostInput {
  minAge?: number | null;
  maxAge?: number | null;
  qualificationLevel?: number | null;
  branchIds?: string[];
  roleIds?: string[];
  employmentType?: string | null;
}

interface MatchResult {
  score: number;
  breakdown: {
    qualification: { match: boolean; weight: number };
    age: { match: boolean; weight: number; userAge: number | null };
    branch: { match: boolean; weight: number; applicable: boolean };
    role: { match: boolean; weight: number; applicable: boolean };
  };
  eligible: boolean;
}

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function computeMatch(profile: ProfileInput, post: PostInput): MatchResult {
  const WEIGHT_QUALIFICATION = 40;
  const WEIGHT_AGE = 30;
  const WEIGHT_BRANCH = 20;
  const WEIGHT_ROLE = 10;

  let score = 0;
  const userAge = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;

  // ---------------- Qualification (hard-ish gate) ----------------
  const qualificationMatch =
    profile.qualificationLevel != null && post.qualificationLevel != null
      ? profile.qualificationLevel >= post.qualificationLevel
      : false;
  if (qualificationMatch) score += WEIGHT_QUALIFICATION;

  // ---------------- Age (hard-ish gate) ----------------
  let ageMatch = true;
  if (userAge != null) {
    if (post.minAge != null && userAge < post.minAge) ageMatch = false;
    if (post.maxAge != null && userAge > post.maxAge) ageMatch = false;
  } else {
    ageMatch = false;
  }
  if (ageMatch) score += WEIGHT_AGE;

  // ---------------- Employment Type (hard filter, per product decision) ----------------
  // If the user has explicit preferences and this post's type isn't among them,
  // the post is excluded entirely - reflected only in `eligible`, not in score,
  // since a non-preferred type shouldn't just lower score, it should hide the job.
  const employmentTypeMatch =
    !profile.preferredEmploymentTypes ||
    profile.preferredEmploymentTypes.length === 0 ||
    (post.employmentType != null && profile.preferredEmploymentTypes.includes(post.employmentType));

  // ---------------- Branch (soft - only scored when BOTH sides specify it) ----------------
  const branchApplicable = !!profile.branchId && !!post.branchIds && post.branchIds.length > 0;
  const branchMatch = branchApplicable ? post.branchIds!.includes(profile.branchId!) : false;
  if (branchApplicable) {
    if (branchMatch) score += WEIGHT_BRANCH;
  } else {
    // Not applicable on either side - redistribute this weight proportionally
    // into qualification+age so incomplete data doesn't unfairly cap the score.
    score += (WEIGHT_BRANCH * (qualificationMatch ? WEIGHT_QUALIFICATION : 0) + WEIGHT_BRANCH * (ageMatch ? WEIGHT_AGE : 0)) / (WEIGHT_QUALIFICATION + WEIGHT_AGE || 1);
  }

  // ---------------- Role (soft, bonus-only, never penalizes) ----------------
  const roleApplicable = !!profile.preferredRoleIds && profile.preferredRoleIds.length > 0 && !!post.roleIds && post.roleIds.length > 0;
  const roleMatch = roleApplicable ? post.roleIds!.some((r) => profile.preferredRoleIds!.includes(r)) : false;
  if (roleApplicable && roleMatch) {
    score += WEIGHT_ROLE;
  } else if (!roleApplicable) {
    score += (WEIGHT_ROLE * (qualificationMatch ? WEIGHT_QUALIFICATION : 0) + WEIGHT_ROLE * (ageMatch ? WEIGHT_AGE : 0)) / (WEIGHT_QUALIFICATION + WEIGHT_AGE || 1);
  }

  const eligible =
    (profile.qualificationLevel == null || qualificationMatch) &&
    (userAge == null || ageMatch) &&
    employmentTypeMatch;

  return {
    score: Math.round(Math.min(score, 100)),
    breakdown: {
      qualification: { match: qualificationMatch, weight: WEIGHT_QUALIFICATION },
      age: { match: ageMatch, weight: WEIGHT_AGE, userAge },
      branch: { match: branchMatch, weight: WEIGHT_BRANCH, applicable: branchApplicable },
      role: { match: roleMatch, weight: WEIGHT_ROLE, applicable: roleApplicable },
    },
    eligible,
  };
}
