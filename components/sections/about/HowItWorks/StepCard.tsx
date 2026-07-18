import { LucideIcon } from "lucide-react";

type Props = {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: Props) {
  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-primary-300 hover:shadow-xl">

      <div className="absolute right-5 top-5 text-5xl font-bold text-neutral-100">
        {step}
      </div>

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon size={30} />
      </div>

      <h3 className="text-xl font-semibold text-neutral-900">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-neutral-600">
        {description}
      </p>
    </div>
  );
}
