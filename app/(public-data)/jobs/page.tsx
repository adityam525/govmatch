import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/features/matching/engine";
import { notificationToJobs } from "@/features/jobs/adapters";
import JobListItem from "@/components/jobs/JobListItem";
import JobFiltersSidebar from "@/components/jobs/JobFiltersSidebar";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

const SEARCH_ALIASES: Record<string, string[]> = {
  "bank po": ["probationary officer", "management trainee", "po"],
  po: ["probationary officer", "management trainee"],
  clerk: ["clerk", "office assistant"],
  je: ["junior engineer"],
  ae: ["assistant engineer"],
  technician: ["technician"],
  teacher: ["teacher", "tgt", "pgt"],
  officer: ["officer"],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  return [lower, ...(SEARCH_ALIASES[lower] ?? [])];
}

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const query = params.search ?? "";
  const category = params.category ?? "all";
  const qualificationSlugs =
    params.qualifications?.split(",").filter(Boolean) ?? [];
  const organizationIds =
    params.organizations?.split(",").filter(Boolean) ?? [];

  const session = await auth();
  const userId = (session?.user as any)?.id;

  let notifications = await prisma.notification.findMany({
    where: {
      status: "LIVE",
      published: true,
      ...(organizationIds.length > 0
        ? { organizationId: { in: organizationIds } }
        : {}),
      ...(qualificationSlugs.length > 0
        ? {
            posts: {
              some: { qualification: { slug: { in: qualificationSlugs } } },
            },
          }
        : {}),
    },
    include: {
      organization: { include: { category: true } },
      posts: { include: { qualification: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let jobs = notifications.flatMap(notificationToJobs);

  const categoryMap: Record<string, string> = {
    ssc: "central",
    railway: "central",
    banking: "banking",
    upsc: "central",
    "state-government": "state",
    defence: "defence",
    psu: "psu",
    "police-security": "defence",
    teaching: "teaching",
    healthcare: "central",
    "judiciary-law": "central",
    agriculture: "central",
  };
  if (category !== "all") {
    jobs = jobs.filter((job) => job.category === category);
  }

  if (query.trim()) {
    const terms = expandQuery(query);
    jobs = jobs.filter((job) => {
      const haystack = (
        job.title +
        " " +
        job.org +
        " " +
        job.category
      ).toLowerCase();
      return terms.some((term) => haystack.includes(term));
    });
  }

  // Compute match scores if logged in
  const matchByJobId = new Map<string, number>();
  if (userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { preferredRoles: true },
    });

    if (profile) {
      const userQualification = profile.qualificationId
        ? await prisma.qualification.findUnique({
            where: { id: profile.qualificationId },
          })
        : null;

      for (const notification of notifications) {
        for (const post of notification.posts as any[]) {
          const result = computeMatch(
            {
              dateOfBirth: profile.dateOfBirth,
              category: profile.category,
              qualificationLevel: userQualification?.level ?? null,
              branchId: profile.branchId,
              preferredRoleIds: profile.preferredRoles.map((r) => r.id),
              preferredEmploymentTypes: profile.preferredEmploymentTypes,
            },
            {
              minAge: post.minAge,
              maxAge: post.maxAge,
              qualificationLevel: post.qualification?.level ?? null,
              employmentType: post.employmentType,
            },
          );
          matchByJobId.set(post.id, result.score);
          matchByJobId.set(notification.id, result.score);
        }
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-10 gap-6 items-start">
        <div className="lg:col-span-3 lg:sticky lg:top-20">
          <JobFiltersSidebar />
        </div>

        <div className="lg:col-span-7">
          <Card padding="lg">
            <SectionHeader
              title={
                query ? `Search results for "${query}"` : "All Government Jobs"
              }
              description={`${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            />

            {jobs.length === 0 ? (
              <p className="text-sm text-neutral-600 py-8 text-center">
                No jobs found. Try adjusting your filters.
              </p>
            ) : (
              <div>
                {jobs.map((job) => (
                  <div key={job.id} className="relative">
                    <JobListItem
                      key={job.id}
                      job={job}
                      matchPercentage={matchByJobId.get(job.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
