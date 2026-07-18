import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: Props) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-primary-300 hover:shadow-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110">
        <Icon size={28} />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-neutral-600">
        {description}
      </p>
    </div>
  );
}
