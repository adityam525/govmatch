import {
  CalendarDays,
  IndianRupee,
  Users,
  GraduationCap,
  ListChecks,
  ExternalLink,
  ArrowRight,
  Ruler,
  ShieldCheck,
  Briefcase,
  Award,
} from "lucide-react";
import Card from "@/components/ui/Card";
import RecentJobsSidebar from "@/components/jobs/RecentJobsSidebar";
import JobActionButtons from "@/components/jobs/JobActionButtons";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

function formatDate(dateStr: Date | string | null) {
  if (!dateStr) return "To Be Announced";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const LINK_LABELS: Record<string, string> = {
  APPLY_ONLINE: "Apply Online",
  NOTIFICATION_PDF: "Download Notification",
  OFFICIAL_WEBSITE: "Official Website",
  ADMIT_CARD: "Download Admit Card",
  RESULT: "Check Result",
  SYLLABUS: "Download Syllabus",
  SHORT_NOTICE: "Check Short Notice",
  OTHER: "Link",
};

async function getNotification(slug: string) {
  return prisma.notification.findUnique({
    where: { slug },
    include: {
      organization: true,
      states: true,
      posts: { include: { qualification: true, branches: true, roles: true } },
      links: { orderBy: { order: "asc" } },
      importantDates: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      examLevels: { orderBy: { order: "asc" } },
      applicationFees: { orderBy: { order: "asc" } },
      admitCards: {
        include: { examLevel: true },
        orderBy: { createdAt: "desc" },
      },
      results: { include: { examLevel: true }, orderBy: { createdAt: "desc" } },
      answerKeys: {
        include: { examLevel: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const notification = await getNotification(slug);

  if (!notification) {
    return { title: "Job Not Found | GovMatch" };
  }

  const orgName = notification.organization?.name ?? "";
  return {
    title: `${notification.title} - ${orgName} | GovMatch`,
    description: `${notification.title}. ${notification.totalVacancies} vacancies. Apply before ${formatDate(notification.applicationEndDate)}.`,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const notification = await getNotification(slug);

  if (!notification) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">
        Job not found.
      </div>
    );
  }

  const orgName = notification.organization?.name ?? "Unknown Organization";
  const posts = notification.posts ?? [];
  const selectionSteps: string[] = notification.selectionProcess ?? [];
  const links = notification.links ?? [];
  const customDates = notification.importantDates ?? [];
  const customFaqs = notification.faqs ?? [];
  const examLevels = notification.examLevels ?? [];
  const applicationFees = notification.applicationFees ?? [];
  const stateNames =
    (notification.states ?? []).map((s: any) => s.name).join(", ") ||
    "All India";
  const advtLabel = notification.advertisementNo
    ? " - Advt No: " + notification.advertisementNo
    : "";

  const primaryLink =
    links.find((l) => l.linkType === "APPLY_ONLINE") || links[0];
  const officialWebsiteLink =
    links.find((l) => l.linkType === "OFFICIAL_WEBSITE")?.url ||
    notification.officialLink;

  const dateEntries =
    customDates.length > 0
      ? customDates.map((d) => ({ label: d.label, date: d.date }))
      : [
          { label: "Notification Date", date: notification.notificationDate },
          {
            label: "Application Start",
            date: notification.applicationStartDate,
          },
          {
            label: "Application Last Date",
            date: notification.applicationEndDate,
          },
          { label: "Exam Date", date: notification.examDate },
        ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-10 gap-6 items-start">
      <div className="lg:col-span-3 lg:sticky lg:top-20">
        <RecentJobsSidebar excludeSlug={notification.slug} />
      </div>
      <div className="lg:col-span-7 space-y-6">
        <Card padding="lg">
          <h1 className="text-xl font-bold text-neutral-900">
            {notification.title}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {orgName}
            {advtLabel}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Location: {stateNames}
          </p>

          <JobActionButtons
            notificationId={notification.id}
            applyUrl={primaryLink?.url ?? notification.officialLink}
          />
        </Card>

        {examLevels.length > 0 && (
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={18} className="text-primary-600" />
              <h2 className="text-sm font-bold text-neutral-900">
                Exam Stages
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {examLevels.map((level, i) => (
                <div key={level.id} className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                    {i + 1}. {level.name}
                  </span>
                  {i < examLevels.length - 1 && (
                    <ArrowRight size={12} className="text-neutral-300" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              Important Dates
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dateEntries.map((entry) => (
              <div key={entry.label}>
                <p className="text-xs text-neutral-400">{entry.label}</p>
                <p
                  className={`text-sm font-medium ${entry.label.toLowerCase().includes("last date") ? "text-danger" : "text-neutral-900"}`}
                >
                  {formatDate(entry.date)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {applicationFees.length > 0 && (
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee size={18} className="text-primary-600" />
              <h2 className="text-sm font-bold text-neutral-900">
                Application Fee
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {applicationFees.map((fee) => (
                <div key={fee.id}>
                  <p className="text-xs text-neutral-400">
                    {fee.categoryLabel}
                  </p>
                  <p className="text-sm font-medium text-neutral-900">
                    {fee.amount}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              Vacancy and Eligibility Details
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mb-4">
            Total Vacancies:{" "}
            <span className="font-semibold text-neutral-900">
              {notification.totalVacancies}
            </span>
          </p>

          <div className="space-y-4">
            {posts.map((post) => {
              const ageRelaxation = post.ageRelaxation as Record<
                string,
                string
              > | null;
              const physicalCriteria = post.physicalCriteria as Record<
                string,
                string
              > | null;
              const branches = post.branches ?? [];
              const roles = post.roles ?? [];

              return (
                <div
                  key={post.id}
                  className="border border-neutral-200 rounded-lg p-4"
                >
                  <p className="text-sm font-semibold text-neutral-900">
                    {post.title}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] text-neutral-400">Vacancies</p>
                      <p className="text-xs font-medium text-neutral-900">
                        {post.vacancies}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400">
                        Qualification
                      </p>
                      <p className="text-xs font-medium text-neutral-900">
                        {post.qualification?.name ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400">Age Limit</p>
                      <p className="text-xs font-medium text-neutral-900">
                        {post.minAge && post.maxAge
                          ? post.minAge + " - " + post.maxAge + " years"
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400">Pay Scale</p>
                      <p className="text-xs font-medium text-neutral-900">
                        {post.payScale ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.employmentType && (
                      <span className="flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 px-2 py-1 rounded-full">
                        <Briefcase size={10} />{" "}
                        {post.employmentType.charAt(0) +
                          post.employmentType.slice(1).toLowerCase()}
                      </span>
                    )}
                    {roles.map((role: any) => (
                      <span
                        key={role.id}
                        className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                      >
                        <Award size={10} /> {role.name}
                      </span>
                    ))}
                    {branches.map((branch: any) => (
                      <span
                        key={branch.id}
                        className="text-[10px] bg-green-50 text-success px-2 py-1 rounded-full"
                      >
                        {branch.name}
                      </span>
                    ))}
                  </div>

                  {post.educationDetails && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <GraduationCap size={12} className="text-neutral-400" />
                        <p className="text-[10px] text-neutral-400">
                          Education Criteria
                        </p>
                      </div>
                      <p className="text-xs text-neutral-600">
                        {post.educationDetails}
                      </p>
                    </div>
                  )}

                  {ageRelaxation && Object.keys(ageRelaxation).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-[10px] text-neutral-400 mb-1.5">
                        Age Relaxation
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(ageRelaxation).map(
                          ([category, relaxation]) => (
                            <span
                              key={category}
                              className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full"
                            >
                              {category}: {relaxation}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {physicalCriteria &&
                    Object.keys(physicalCriteria).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Ruler size={12} className="text-neutral-400" />
                          <p className="text-[10px] text-neutral-400">
                            Physical Criteria
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(physicalCriteria).map(
                            ([label, value]) => (
                              <span
                                key={label}
                                className="text-[10px] bg-orange-50 text-accent-orange px-2 py-1 rounded-full"
                              >
                                {label}: {value}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {post.categoryWiseVacancies && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-[10px] text-neutral-400 mb-1.5">
                        Category-wise Vacancies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          post.categoryWiseVacancies as Record<string, number>,
                        ).map(([cat, count]) => (
                          <span
                            key={cat}
                            className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full"
                          >
                            {cat}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {selectionSteps.length > 0 && (
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={18} className="text-primary-600" />
              <h2 className="text-sm font-bold text-neutral-900">
                Selection Process
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectionSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                    {i + 1}. {step}
                  </span>
                  {i < selectionSteps.length - 1 && (
                    <ArrowRight size={12} className="text-neutral-300" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {notification.howToApply && (
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-primary-600" />
              <h2 className="text-sm font-bold text-neutral-900">
                How to Apply
              </h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {notification.howToApply}
            </p>
          </Card>
        )}

        {(notification.admitCards.length > 0 ||
          notification.results.length > 0 ||
          notification.answerKeys.length > 0) && (
          <Card padding="lg">
            <h2 className="text-sm font-bold text-neutral-900 mb-4">
              Exam Lifecycle Updates
            </h2>
            <div className="space-y-4">
              {notification.admitCards.map((ac: any) => (
                <a
                  key={ac.id}
                  href={ac.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-xs font-medium text-neutral-900">
                      {ac.title}
                      {ac.examLevel ? ` (${ac.examLevel.name})` : ""}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Admit Card - Released {formatDate(ac.releaseDate)}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-neutral-400" />
                </a>
              ))}
              {notification.results.map((r: any) => (
                <a
                  key={r.id}
                  href={r.resultLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-xs font-medium text-neutral-900">
                      {r.title}
                      {r.examLevel ? ` (${r.examLevel.name})` : ""}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Result - Released {formatDate(r.releaseDate)}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-neutral-400" />
                </a>
              ))}
              {notification.answerKeys.map((k: any) => (
                <a
                  key={k.id}
                  href={k.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-xs font-medium text-neutral-900">
                      {k.title}
                      {k.examLevel ? ` (${k.examLevel.name})` : ""}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Answer Key - Released {formatDate(k.releaseDate)}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-neutral-400" />
                </a>
              ))}
            </div>
          </Card>
        )}

        <Card padding="lg">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">
            Important Links
          </h2>

          <div className="space-y-2">
            {links.length > 0 ? (
              links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
                >
                  <span className="text-sm font-medium text-neutral-900">
                    {link.label || LINK_LABELS[link.linkType]}
                  </span>

                  <ExternalLink size={14} className="text-neutral-400" />
                </a>
              ))
            ) : notification?.officialLink ? (
              <a
                href={notification.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
              >
                <span className="text-sm font-medium text-neutral-900">
                  Official Notification / Apply Online
                </span>

                <ExternalLink size={14} className="text-neutral-400" />
              </a>
            ) : (
              <p className="text-sm text-neutral-500">
                No important links available.
              </p>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {customFaqs.length > 0 ? (
              customFaqs.map((faq) => (
                <div key={faq.id}>
                  <p className="text-xs font-semibold text-neutral-900">
                    {faq.question}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">{faq.answer}</p>
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    When is the last date to apply for {notification.title}?
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    The application last date is{" "}
                    {formatDate(notification.applicationEndDate)}.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    How many vacancies are there in {notification.title}?
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    There are a total of {notification.totalVacancies} vacancies
                    across {posts.length} post(s).
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    What is the official website for {orgName}?
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    The official website is {officialWebsiteLink}.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
