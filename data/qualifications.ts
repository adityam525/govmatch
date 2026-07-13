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
    description: "Polytechnic & diploma holders",
    iconName: "award",
    colorKey: "purple",
    searchKeyword: "Diploma",
  },
  {
    id: "graduate",
    title: "Graduate",
    description: "Bachelor's degree required",
    iconName: "graduationCap",
    colorKey: "green",
    searchKeyword: "Graduate",
  },
  {
    id: "postgraduate",
    title: "Post Graduate",
    description: "Master's degree required",
    iconName: "graduationCap",
    colorKey: "red",
    searchKeyword: "Post Graduate",
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "B.E./B.Tech specific roles",
    iconName: "briefcase",
    colorKey: "amber",
    searchKeyword: "Engineering",
  },
];
