import {
  Crown,
  TrainFront,
  Landmark,
  ShieldCheck,
  Building2,
  Shield,
  Factory,
} from "lucide-react";
import CategoryCard from "@/components/jobs/CategoryCard";
import ViewAllCard from "@/components/shared/ViewAllCard";
import { categories } from "@/data/categories";
import { colors } from "@/styles/tokens";

const iconMap = {
  crown: Crown,
  train: TrainFront,
  landmark: Landmark,
  ashoka: ShieldCheck,
  building: Building2,
  shield: Shield,
  factory: Factory,
};

const colorMap = {
  amber: colors.accent.amber,
  red: colors.accent.red,
  sky: colors.accent.sky,
  purple: colors.accent.purple,
  green: colors.accent.green,
  orange: colors.accent.orange,
};

export default function CategoryStrip() {
  return (
    <section>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">
        Browse Jobs by Qualification
      </h2>
      <p className="text-sm text-neutral-600 mb-4">
        Find jobs that match your education level
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.iconName];
          return (
            <CategoryCard
              key={cat.id}
              icon={<Icon size={20} />}
              iconBg={colorMap[cat.colorKey]}
              title={cat.title}
              description={cat.description}
              href={`/jobs?search=${encodeURIComponent(cat.searchKeyword)}`}
            />
          );
        })}
        <ViewAllCard href="/jobs" label="View All Categories" />
      </div>
    </section>
  );
}
