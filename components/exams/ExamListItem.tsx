import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Exam } from "@/data/mockExams";

interface ExamListItemProps {
  exam: Exam;
}

export default function ExamListItem({ exam }: ExamListItemProps) {
  return (
    <Link
      href={`/exams/${exam.slug}`}
      className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded-md transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-50 text-primary-600 shrink-0">
          <CalendarDays size={16} />
        </div>
        <p className="text-sm font-medium text-neutral-900 truncate">
          {exam.name}
        </p>
      </div>
      <p className="text-xs text-neutral-400 shrink-0 pl-2">{exam.date}</p>
    </Link>
  );
}
