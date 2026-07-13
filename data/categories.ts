export interface Category {
  id: string;
  title: string;
  description: string;
  iconName:
    | "crown"
    | "train"
    | "landmark"
    | "ashoka"
    | "building"
    | "shield"
    | "factory";
  colorKey: "amber" | "red" | "sky" | "purple" | "green" | "orange";
  searchKeyword: string; // matched against job title/org text
}

export const categories: Category[] = [
  {
    id: "ssc",
    title: "SSC",
    description: "Staff Selection Commission",
    iconName: "crown",
    colorKey: "amber",
    searchKeyword: "SSC",
  },
  {
    id: "rrb",
    title: "RRB",
    description: "Railway Recruitment",
    iconName: "train",
    colorKey: "red",
    searchKeyword: "RRB",
  },
  {
    id: "banking",
    title: "Banking",
    description: "IBPS, SBI, RBI & more",
    iconName: "landmark",
    colorKey: "sky",
    searchKeyword: "IBPS",
  },
  {
    id: "upsc",
    title: "UPSC",
    description: "Union Public Service Commission",
    iconName: "ashoka",
    colorKey: "amber",
    searchKeyword: "UPSC",
  },
  {
    id: "state-govt",
    title: "State Govt.",
    description: "State PSC & Govt. Jobs",
    iconName: "building",
    colorKey: "purple",
    searchKeyword: "State",
  },
  {
    id: "defence",
    title: "Defence",
    description: "Army, Navy, Air Force & Defence Jobs",
    iconName: "shield",
    colorKey: "green",
    searchKeyword: "DRDO",
  },
  {
    id: "psu",
    title: "PSU",
    description: "Public Sector Undertakings",
    iconName: "factory",
    colorKey: "orange",
    searchKeyword: "PSU",
  },
];
