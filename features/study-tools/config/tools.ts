import {
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarDays,
  CircleDot,
  ClipboardList,
  Clock3,
  FileText,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { StudyTool } from "../types/study-tool";

export const STUDY_TOOLS: StudyTool[] = [
  {
    id: "mock-tests",
    title: "Mock Tests",
    description:
      "Practice full-length mock tests based on the latest exam pattern.",
    href: "/study-zone/mock-tests",
    icon: ClipboardList,
    category: "practice",
    color: "primary",
    badge: "Popular",
    featured: true,
  },
  {
    id: "previous-papers",
    title: "Previous Year Papers",
    description:
      "Solve official previous year papers with detailed solutions.",
    href: "/study-zone/previous-papers",
    icon: FileText,
    category: "practice",
    color: "purple",
    featured: true,
  },
  {
    id: "daily-quiz",
    title: "Daily Quiz",
    description:
      "Improve your speed and accuracy with daily practice quizzes.",
    href: "/study-zone/daily-quiz",
    icon: Brain,
    category: "practice",
    color: "green",
    badge: "Daily",
  },
  {
    id: "mcq-generator",
    title: "MCQ Generator",
    description:
      "Generate an interactive mock exam from uploaded MCQ documents.",
    href: "/study-zone/mcq-generator",
    icon: Brain,
    category: "tools",
    color: "orange",
    badge: "New",
    featured: true,
  },
  {
    id: "exam-timer",
    title: "Exam Timer",
    description:
      "Minimal distraction timer designed for government exam practice.",
    href: "/study-zone/exam-timer",
    icon: Clock3,
    category: "tools",
    color: "primary",
  },
  {
    id: "eligibility-checker",
    title: "Eligibility Checker",
    description:
      "Check whether you're eligible for government jobs instantly.",
    href: "/study-zone/eligibility",
    icon: BadgeCheck,
    category: "tools",
    color: "green",
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description:
      "Calculate your exact age according to recruitment notification rules.",
    href: "/study-zone/age-calculator",
    icon: CalendarDays,
    category: "tools",
    color: "orange",
  },
  {
    id: "study-planner",
    title: "Study Planner",
    description:
      "Plan your preparation and stay consistent with daily goals.",
    href: "/study-zone/study-planner",
    icon: CalendarDays,
    category: "planning",
    color: "blue",
  },
  {
    id: "omr-practice",
    title: "OMR Practice",
    description:
      "Practice filling OMR sheets before your actual examination.",
    href: "/study-zone/omr-practice",
    icon: CircleDot,
    category: "tools",
    color: "red",
    comingSoon: true,
  },
  {
    id: "books",
    title: "Books & Resources",
    description:
      "Recommended books, notes and preparation resources.",
    href: "/study-zone/books",
    icon: BookOpen,
    category: "resources",
    color: "blue",
  },
  {
    id: "current-affairs",
    title: "Current Affairs",
    description:
      "Daily and monthly current affairs for competitive examinations.",
    href: "/study-zone/current-affairs",
    icon: Newspaper,
    category: "resources",
    color: "green",
  },
  {
    id: "performance",
    title: "Performance Analytics",
    description:
      "Track your preparation with AI-powered performance insights.",
    href: "/study-zone/performance",
    icon: BarChart3,
    category: "premium",
    color: "purple",
    premium: true,
    badge: "PRO",
  },
];

export const FEATURED_STUDY_TOOLS = STUDY_TOOLS.filter(
  (tool) => tool.featured
);

export const PRACTICE_TOOLS = STUDY_TOOLS.filter(
  (tool) => tool.category === "practice"
);

export const STUDY_HELPER_TOOLS = STUDY_TOOLS.filter(
  (tool) => tool.category === "tools"
);

export const RESOURCE_TOOLS = STUDY_TOOLS.filter(
  (tool) => tool.category === "resources"
);

export const PREMIUM_TOOLS = STUDY_TOOLS.filter(
  (tool) => tool.category === "premium"
);
