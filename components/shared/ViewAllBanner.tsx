import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ViewAllBannerProps {
  href: string;
  label: string;
}

export default function ViewAllBanner({ href, label }: ViewAllBannerProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1 bg-green-50 text-success text-sm font-medium py-3 rounded-md mt-2 hover:bg-green-100 transition-colors"
    >
      {label}
      <ArrowRight size={16} />
    </Link>
  );
}
