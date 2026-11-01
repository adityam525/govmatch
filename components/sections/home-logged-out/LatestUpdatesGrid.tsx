import { CalendarDays, Trophy, FileCheck2, KeyRound } from "lucide-react";

import SectionHeader from "@/components/ui/SectionHeader";
import InfoListCard from "@/components/shared/InfoListCard";

import {
  getUpcomingExamRows,
  getAdmitCardRows,
  getResultRows,
  getAnswerKeyRows,
} from "@/lib/job-queries";

export default async function LatestUpdatesGrid(
  _props: Record<string, unknown>,
) {
  const [exams, admitCards, results, answerKeys] = await Promise.all([
    getUpcomingExamRows(5),
    getAdmitCardRows(5),
    getResultRows(5),
    getAnswerKeyRows(5),
  ]);

  return (
    <section className="min-w-0">
      {/* Section Header */}
      <SectionHeader
        title="Latest Government Updates"
        description="Stay updated with the latest examination notifications, admit cards, results and answer key releases"
      />

      {/* Update Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
        <InfoListCard
          title="Upcoming Exams"
          icon={CalendarDays}
          items={exams}
          viewAllHref="/jobs?updates=exams"
          emptyMessage="No exams scheduled right now"
        />

        <InfoListCard
          title="Admit Cards"
          icon={FileCheck2}
          items={admitCards}
          viewAllHref="/jobs?updates=admit-cards"
          emptyMessage="No admit cards available right now"
        />

        <InfoListCard
          title="Results"
          icon={Trophy}
          items={results}
          viewAllHref="/jobs?updates=results"
          emptyMessage="No results declared yet"
        />

        <InfoListCard
          title="Answer Keys"
          icon={KeyRound}
          items={answerKeys}
          viewAllHref="/jobs?updates=answer-keys"
          emptyMessage="No answer keys released yet"
        />
      </div>
    </section>
  );
}
