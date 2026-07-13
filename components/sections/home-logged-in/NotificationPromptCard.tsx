"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NotificationPromptCard() {
  const [enabled, setEnabled] = useState(false);

  if (enabled) return null; // dismiss once enabled

  return (
    <Card padding="lg" className="bg-amber-50 border-amber-100">
      <div className="flex items-start gap-3">
        <Bell size={20} className="text-accent-amber shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-neutral-900">
            Never Miss an Update!
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            Get instant alerts for new jobs, admit cards, results and exam
            updates.
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="md"
        fullWidth
        className="mt-4 bg-white"
        onClick={() => setEnabled(true)}
      >
        Enable Notifications
      </Button>
    </Card>
  );
}
