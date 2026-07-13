import {
  BookOpen,
  GraduationCap,
  Wrench,
  Award,
  Briefcase,
} from "lucide-react";
import QualificationCard from "@/components/jobs/QualificationCard";
import { qualifications } from "@/data/qualifications";
import { colors } from "@/styles/tokens";
import ViewAllCard from "@/components/shared/ViewAllCard";

const iconMap = {
  book: BookOpen,
  graduationCap: GraduationCap,
  wrench: Wrench,
  award: Award,
  briefcase: Briefcase,
};

const colorMap = {
  amber: colors.accent.amber,
  red: colors.accent.red,
  sky: colors.accent.sky,
  purple: colors.accent.purple,
  green: colors.accent.green,
  orange: colors.accent.orange,
};

export default function QualificationStrip() {
  return (
    <section>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">
        Browse Jobs by Qualification
      </h2>
      <p className="text-sm text-neutral-600 mb-4">
        Find jobs that match your education level
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {qualifications.map((q) => {
          const Icon = iconMap[q.iconName];
          return (
            <QualificationCard
              key={q.id}
              icon={<Icon size={20} />}
              iconBg={colorMap[q.colorKey]}
              title={q.title}
              description={q.description}
              href={`/jobs?search=${encodeURIComponent(q.searchKeyword)}`}
            />
          );
        })}
        <ViewAllCard href="/jobs" label="View All Categories" />
      </div>
    </section>
  );
}
