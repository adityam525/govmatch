import { ReactNode } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

interface QualificationCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
}

export default function QualificationCard({ icon, iconBg, title, description, href }: QualificationCardProps) {
  return (
    <Link href={href}>
      <Card hoverable padding="lg" className="h-full text-center transition-all hover:-translate-y-0.5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
          style={{ backgroundColor: `${iconBg}14`, color: iconBg }}
        >
          {icon}
        </div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>
      </Card>
    </Link>
  );
}
