import { LucideIcon } from "lucide-react";

export type StudyToolCategory =
  | "practice"
  | "tools"
  | "resources"
  | "planning"
  | "premium";

export type StudyToolColor =
  | "primary"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "red";

export interface StudyTool {
  id: string;

  title: string;

  description: string;

  href: string;

  icon: LucideIcon;

  category: StudyToolCategory;

  color: StudyToolColor;

  badge?: string;

  premium?: boolean;

  disabled?: boolean;

  comingSoon?: boolean;

  featured?: boolean;
}
