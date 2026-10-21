import Link from "next/link";
import { Bell } from "lucide-react";
import Button from "@/components/ui/Button";

// Email and push alerts do not exist yet, and the old "Enable Notifications" button only
// hid this card. It now points at what works today: saved jobs and their last dates.
export default function NotificationPromptCard() {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Bell size={20} className="mt-0.5 shrink-0 text-accent-amber" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-900">Keep track of deadlines</p>
          <p className="mt-1 text-xs text-neutral-600">
            Save jobs to keep their last dates in one place. Email and push alerts are coming soon.
          </p>
        </div>
      </div>
      <Link href="/saved-jobs">
        <Button variant="secondary" size="md" fullWidth className="mt-4 bg-white">
          View saved jobs
        </Button>
      </Link>
    </div>
  );
}
