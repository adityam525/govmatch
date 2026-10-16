export interface Job {
  id: string;
  title: string;
  org: string;
  orgIconName: "crown" | "train" | "landmark" | "shield";
  orgShortName?: string | null;
  orgLogoUrl?: string | null;
  phaseLabel?: string | null;
  category: "central" | "state" | "psu" | "banking" | "defence" | "teaching";
  vacancies: number;
  lastDate: string;
  /** ISO date of the application deadline, used for sorting (lastDate is display text). */
  deadline?: string | null;
  createdAt?: string;
  slug: string;
}

export interface RecommendedJob {
  id: string;
  title: string;
  org: string;
  orgLogoText: string;
  salaryRange: string;
  lastDate: string;
  matchPercent: number;
  slug: string;
}
