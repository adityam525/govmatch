import type { Metadata } from "next";
import ExamCalendar from "@/components/calendar/ExamCalendar";

export const metadata: Metadata = {
  title: "Exam calendar | GovMatch",
  description:
    "Application, admit card, exam and result dates for government jobs, in one calendar.",
};

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ExamCalendar title="Exam calendar" />
    </div>
  );
}
