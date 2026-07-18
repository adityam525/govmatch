export interface Qualification {
  id: string;
  title: string;
  description: string;
  iconName: "book" | "graduationCap" | "wrench" | "award" | "briefcase";
  colorKey: "amber" | "red" | "sky" | "purple" | "green" | "orange";
  searchKeyword: string;
}

export const qualifications: Qualification[] = [
  {
    id: "10th",
    title: "10th Pass",
    description: "Matric level jobs",
    iconName: "book",
    colorKey: "amber",
    searchKeyword: "10th",
  },
  {
    id: "12th",
    title: "12th Pass",
    description: "Intermediate level jobs",
    iconName: "book",
    colorKey: "sky",
    searchKeyword: "12th",
  },
  {
    id: "iti",
    title: "ITI",
    description: "Technical trade jobs",
    iconName: "wrench",
    colorKey: "orange",
    searchKeyword: "ITI",
  },
  {
    id: "diploma",
    title: "Diploma",
    description: "Polytechnic & diploma jobs",
    iconName: "award",
    colorKey: "purple",
    searchKeyword: "Diploma",
  },
  {
    id: "graduate",
    title: "Graduate",
    description: "Bachelor's degree jobs",
    iconName: "graduationCap",
    colorKey: "green",
    searchKeyword: "Graduate",
  },
  {
    id: "postgraduate",
    title: "Post Graduate",
    description: "Master's degree jobs",
    iconName: "graduationCap",
    colorKey: "red",
    searchKeyword: "Post Graduate",
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "B.E./B.Tech jobs",
    iconName: "briefcase",
    colorKey: "amber",
    searchKeyword: "Engineering",
  },
  {
    id: "apprentice",
    title: "Apprentice",
    description: "Government & PSU apprenticeships",
    iconName: "wrench",
    colorKey: "green",
    searchKeyword: "Apprentice",
  },
  {
    id: "medical",
    title: "Medical",
    description: "MBBS, Nursing & Pharmacy jobs",
    iconName: "award",
    colorKey: "red",
    searchKeyword: "Medical",
  },
  {
    id: "teaching",
    title: "Teaching",
    description: "B.Ed & teacher recruitment",
    iconName: "graduationCap",
    colorKey: "purple",
    searchKeyword: "Teaching",
  },
  {
    id: "law",
    title: "Law",
    description: "LLB & legal officer jobs",
    iconName: "briefcase",
    colorKey: "purple",
    searchKeyword: "LLB",
  },
];
