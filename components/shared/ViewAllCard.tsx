import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";

interface ViewAllCardProps {
  href: string;
  label: string;
}

export default function ViewAllCard({ href, label }: ViewAllCardProps) {
  return (
    <Link href={href}>
      <Card
        hoverable
        padding="md"
        className="h-full flex flex-col items-center justify-center text-center bg-primary-50 border-primary-100"
      >
        <p className="text-sm font-medium text-primary-600">{label}</p>
        <ArrowRight size={18} className="text-primary-600 mt-2" />
      </Card>
    </Link>
  );
}
