import type { RecommendedJob } from "@/features/jobs/types";

export const mockRecommendedJobs: RecommendedJob[] = [
  {
    id: "1",
    title: "ISRO Scientist/Engineer 'SC'",
    org: "ISRO",
    orgLogoText: "ISRO",
    salaryRange: "₹56,100 – 1,77,500",
    lastDate: "15 Aug 2025",
    matchPercent: 95,
    slug: "isro-scientist-engineer-sc",
  },
  {
    id: "2",
    title: "NIC Scientist B",
    org: "NIC",
    orgLogoText: "NIC",
    salaryRange: "₹56,100 – 1,77,500",
    lastDate: "10 Aug 2025",
    matchPercent: 90,
    slug: "nic-scientist-b",
  },
  {
    id: "3",
    title: "DRDO Scientist B",
    org: "DRDO",
    orgLogoText: "DRDO",
    salaryRange: "₹56,100 – 1,77,500",
    lastDate: "20 Aug 2025",
    matchPercent: 88,
    slug: "drdo-scientist-b",
  },
];
