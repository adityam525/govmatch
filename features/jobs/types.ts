export interface Job {
  id: string;
  title: string;
  org: string;
  orgIconName: "crown" | "train" | "landmark" | "shield";
  category: "central" | "state" | "psu" | "banking" | "defence" | "teaching";
  vacancies: number;
  lastDate: string;
  slug: string;
}

export interface RecommendedJob {
  id: string;
  title: string;
  org: string;
  orgLogoText: string; // short text/initials shown in the logo box
  salaryRange: string;
  lastDate: string;
  matchPercent: number;
  slug: string;
}
