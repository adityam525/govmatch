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
    description: "Staff Selection Commission jobs",
    iconName: "crown",
    colorKey: "amber",
    searchKeyword: "SSC",
  },
  {
    id: "rrb",
    title: "RRB",
    description: "Railway Recruitment Board jobs",
    iconName: "train",
    colorKey: "red",
    searchKeyword: "RRB",
  },
  {
    id: "banking",
    title: "Banking",
    description: "IBPS, SBI, RBI & banking jobs",
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
    description: "State PSC & government jobs",
    iconName: "building",
    colorKey: "purple",
    searchKeyword: "State",
  },
  {
    id: "defence",
    title: "Defence",
    description: "Army, Navy, Air Force & Defence jobs",
    iconName: "shield",
    colorKey: "green",
    searchKeyword: "Army",
  },
  {
    id: "psu",
    title: "PSU",
    description: "Public Sector Undertaking jobs",
    iconName: "factory",
    colorKey: "orange",
    searchKeyword: "PSU",
  },
  {
    id: "police",
    title: "Police",
    description: "Police, CAPF & security jobs",
    iconName: "shield",
    colorKey: "red",
    searchKeyword: "Police",
  },
  {
    id: "teaching",
    title: "Teaching",
    description: "Teacher & education department jobs",
    iconName: "ashoka",
    colorKey: "purple",
    searchKeyword: "Teacher",
  },
  {
    id: "medical",
    title: "Medical",
    description: "Doctor, Nursing & healthcare jobs",
    iconName: "building",
    colorKey: "green",
    searchKeyword: "Medical",
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "Technical & engineering jobs",
    iconName: "factory",
    colorKey: "orange",
    searchKeyword: "Engineer",
  },
  {
    id: "insurance",
    title: "Insurance",
    description: "LIC, NIACL & insurance jobs",
    iconName: "landmark",
    colorKey: "sky",
    searchKeyword: "Insurance",
  },
  {
    id: "judiciary",
    title: "Judiciary",
    description: "Court & legal department jobs",
    iconName: "building",
    colorKey: "purple",
    searchKeyword: "Court",
  },
  {
    id: "agriculture",
    title: "Agriculture",
    description: "Agriculture & rural development jobs",
    iconName: "factory",
    colorKey: "green",
    searchKeyword: "Agriculture",
  },
];
