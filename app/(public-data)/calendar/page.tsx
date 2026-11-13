import type { Metadata } from "next";
import { pageMetadata } from '@/lib/seo';
import ExamCalendar from "@/components/calendar/ExamCalendar";

export const metadata: Metadata = pageMetadata({ title: 'Exam calendar', description: 'Application, admit card, exam and result dates for government jobs, in one calendar.', path: '/calendar' });

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ExamCalendar title="Exam calendar" />
    </div>
  );
}
