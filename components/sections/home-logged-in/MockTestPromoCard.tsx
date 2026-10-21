import Link from "next/link";
import { ClipboardList } from "lucide-react";
import Button from "@/components/ui/Button";

export default function MockTestPromoCard() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ClipboardList size={20} className="mt-0.5 shrink-0 text-success" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-900">Mock Test Series</p>
          <p className="mt-1 text-xs text-neutral-600">
            Practice with real exam pattern tests and improve your score.
          </p>
        </div>
      </div>
      <Link href="/study-zone/mock-tests">
        <Button variant="secondary" size="md" fullWidth className="mt-4 bg-white">
          Start Mock Tests
        </Button>
      </Link>
    </div>
  );
}
