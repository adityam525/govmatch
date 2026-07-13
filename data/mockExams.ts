export interface Exam {
  id: string;
  name: string;
  date: string;
  slug: string;
}

export const mockExams: Exam[] = [
  {
    id: "1",
    name: "SSC CGL 2025 (Tier 1)",
    date: "Sep 2025",
    slug: "ssc-cgl-2025-tier-1",
  },
  {
    id: "2",
    name: "UPSC CDS II 2025",
    date: "7 Sep 2025",
    slug: "upsc-cds-ii-2025",
  },
  { id: "3", name: "RRB NTPC 2025", date: "Sep 2025", slug: "rrb-ntpc-2025" },
  {
    id: "4",
    name: "IBPS Clerk 2025",
    date: "Oct 2025",
    slug: "ibps-clerk-2025",
  },
  { id: "5", name: "UPSC CAPF 2025", date: "Aug 2025", slug: "upsc-capf-2025" },
];
