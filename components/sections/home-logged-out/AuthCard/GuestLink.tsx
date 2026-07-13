import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GuestLink() {
  return (
    <Link
      href="/jobs"
      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
    >
      Explore as Guest
      <ArrowRight size={14} />
    </Link>
  );
}
