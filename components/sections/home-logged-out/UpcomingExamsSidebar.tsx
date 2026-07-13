import Link from "next/link";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import ExamListItem from "@/components/exams/ExamListItem";
import { mockExams } from "@/data/mockExams";

export default function UpcomingExamsSidebar() {
  return (
    <Card padding="lg">
      <SectionHeader
        title="Upcoming Exams"
        viewAllHref="/exams"
        viewAllLabel="View All Exams"
      />
      <div>
        {mockExams.map((exam) => (
          <ExamListItem key={exam.id} exam={exam} />
        ))}
      </div>
      <Link
        href="/exams"
        className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 mt-3"
      >
        View Full Exam Calendar →
      </Link>
    </Card>
  );
}
