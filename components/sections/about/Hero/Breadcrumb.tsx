import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
      <Link href="/" className="hover:text-primary-600 transition-colors">
        Home
      </Link>

      <ChevronRight size={14} />

      <span className="text-neutral-900 font-medium">About</span>
    </div>
  );
}
