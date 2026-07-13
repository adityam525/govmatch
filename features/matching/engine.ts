interface ProfileInput {
  dateOfBirth?: Date | null;
  category?: string | null;
  qualificationLevel?: number | null;
}

interface PostInput {
  minAge?: number | null;
  maxAge?: number | null;
  qualificationLevel?: number | null;
}

interface MatchResult {
  score: number;
  breakdown: {
    qualification: { match: boolean; weight: number };
    age: { match: boolean; weight: number; userAge: number | null };
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
  const WEIGHT_QUALIFICATION = 60;
  const WEIGHT_AGE = 40;

  let score = 0;
  const userAge = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;

  const qualificationMatch =
    profile.qualificationLevel != null && post.qualificationLevel != null
      ? profile.qualificationLevel >= post.qualificationLevel
      : false;

  if (qualificationMatch) score += WEIGHT_QUALIFICATION;

  let ageMatch = true;
  if (userAge != null) {
    if (post.minAge != null && userAge < post.minAge) ageMatch = false;
    if (post.maxAge != null && userAge > post.maxAge) ageMatch = false;
  } else {
    ageMatch = false;
  }

  if (ageMatch) score += WEIGHT_AGE;

  const eligible =
    (profile.qualificationLevel == null || qualificationMatch) &&
    (userAge == null || ageMatch);

  return {
    score: Math.round(score),
    breakdown: {
      qualification: { match: qualificationMatch, weight: WEIGHT_QUALIFICATION },
      age: { match: ageMatch, weight: WEIGHT_AGE, userAge },
    },
    eligible,
  };
}
