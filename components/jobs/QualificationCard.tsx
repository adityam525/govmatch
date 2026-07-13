import { ReactNode } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

interface QualificationCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
}

export default function QualificationCard({
  icon,
  iconBg,
  title,
  description,
  href,
}: QualificationCardProps) {
  return (
    <Link href={href}>
      <Card hoverable padding="md" className="h-full text-center">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg mb-3 mx-auto"
          style={{ backgroundColor: `${iconBg}1A`, color: iconBg }}
        >
          {icon}
        </div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
      </Card>
    </Link>
  );
}
