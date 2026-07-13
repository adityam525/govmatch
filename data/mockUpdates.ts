export interface UpdateItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  href: string;
}

export interface UpdateType {
  id: "results" | "admit-cards" | "answer-key" | "documents" | "admission";
  title: string;
  viewAllHref: string;
  items: UpdateItem[];
}

export const updateTypes: UpdateType[] = [
  {
    id: "results",
    title: "Results",
    viewAllHref: "/results",
    items: [
      {
        id: "r1",
        title: "SSC MTS 2024 Final Result",
        subtitle: "SSC",
        date: "5 Jul 2026",
        href: "/results/ssc-mts-2024-result",
      },
      {
        id: "r2",
        title: "IBPS Clerk 2025 Prelims Result",
        subtitle: "IBPS",
        date: "3 Jul 2026",
        href: "/results/ibps-clerk-2025-prelims-result",
      },
    ],
  },
  {
    id: "admit-cards",
    title: "Admit Cards",
    viewAllHref: "/admit-cards",
    items: [
      {
        id: "a1",
        title: "RRB NTPC 2025 Admit Card",
        subtitle: "RRB",
        date: "6 Jul 2026",
        href: "/admit-cards/rrb-ntpc-2025-admit-card",
      },
      {
        id: "a2",
        title: "UPSC CDS II 2025 Admit Card",
        subtitle: "UPSC",
        date: "4 Jul 2026",
        href: "/admit-cards/upsc-cds-ii-2025-admit-card",
      },
    ],
  },
  {
    id: "answer-key",
    title: "Answer Key",
    viewAllHref: "/answer-key",
    items: [
      {
        id: "k1",
        title: "SSC CGL 2025 Tier 1 Answer Key",
        subtitle: "SSC",
        date: "2 Jul 2026",
        href: "/answer-key/ssc-cgl-2025-tier-1-answer-key",
      },
      {
        id: "k2",
        title: "IBPS PO 2025 Prelims Answer Key",
        subtitle: "IBPS",
        date: "30 Jun 2026",
        href: "/answer-key/ibps-po-2025-prelims-answer-key",
      },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    viewAllHref: "/resources",
    items: [
      {
        id: "d1",
        title: "SSC Exam Calendar 2026-27",
        subtitle: "SSC",
        date: "1 Jul 2026",
        href: "/resources/ssc-exam-calendar-2026-27",
      },
      {
        id: "d2",
        title: "UPSC Notification Calendar 2026",
        subtitle: "UPSC",
        date: "28 Jun 2026",
        href: "/resources/upsc-notification-calendar-2026",
      },
    ],
  },
  {
    id: "admission",
    title: "Admission",
    viewAllHref: "/admission",
    items: [
      {
        id: "ad1",
        title: "NDA Admission Notice 2026",
        subtitle: "UPSC",
        date: "29 Jun 2026",
        href: "/admission/nda-admission-notice-2026",
      },
      {
        id: "ad2",
        title: "IIT JAM 2027 Admission Schedule",
        subtitle: "IIT",
        date: "27 Jun 2026",
        href: "/admission/iit-jam-2027-admission",
      },
    ],
  },
];
