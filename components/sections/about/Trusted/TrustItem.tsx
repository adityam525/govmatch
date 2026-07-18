import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
};

export default function TrustItem({
  icon: Icon,
  title,
}: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon size={22} />
      </div>

      <span className="font-medium text-neutral-800">
        {title}
      </span>
    </div>
  );
}
