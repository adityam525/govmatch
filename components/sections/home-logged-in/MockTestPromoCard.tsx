import Link from "next/link";
import { ClipboardList } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function MockTestPromoCard() {
  return (
    <Card padding="lg" className="bg-green-50 border-green-100">
      <div className="flex items-start gap-3">
        <ClipboardList size={20} className="text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-neutral-900">Mock Test Series</p>
          <p className="text-xs text-neutral-600 mt-1">
            Practice with real exam pattern tests and improve your score.
          </p>
        </div>
      </div>
      <Link href="/study-zone/mock-tests">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          className="mt-4 bg-white"
        >
          Start Mock Tests
        </Button>
      </Link>
    </Card>
  );
}
