import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/features/matching/engine";
import { notificationToJobs } from "@/features/jobs/adapters";
import JobListItem from "@/components/jobs/JobListItem";
import JobFiltersBar from "@/components/jobs/JobFiltersBar";
import SectionHeader from "@/components/ui/SectionHeader";
import { Prisma } from "@prisma/client";
import { resolveCategoryFilter } from "@/lib/category-filters";

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
  const categorySlug = params.category ?? "";
  // Organization now filters by its dedicated `slug` field (added via the
  // Organization slug migration), matching Category/QualificationCategory/
  // Qualification/Branch, which all filter by slug rather than raw id.
  const organizationSlugs =
    params.organizations?.split(",").filter(Boolean) ?? [];
  const stateCodes = params.states?.split(",").filter(Boolean) ?? [];

  // Qualification is now a 3-level cascade: QualificationCategory (high
  // level) -> Qualification (mid level) -> Branch (specific stream). Any
  // combination can be applied at once; each also works independently.
  // All three (plus Category and State) filter by slug/code rather than raw
  // id, matching how `search` already uses readable text instead of an id.
  const qualificationCategorySlugs =
    params.qualificationCategories?.split(",").filter(Boolean) ?? [];
  const qualificationSlugs =
    params.qualifications?.split(",").filter(Boolean) ?? [];
  const branchSlugs = params.branches?.split(",").filter(Boolean) ?? [];

  const sort = params.sort === "oldest" ? "oldest" : "newest";

  const session = await auth();
  const userId = (session?.user as any)?.id;

  const qualificationFilter: Prisma.QualificationWhereInput = {
    ...(qualificationSlugs.length > 0
      ? { slug: { in: qualificationSlugs } }
      : {}),
    ...(qualificationCategorySlugs.length > 0
      ? { categories: { some: { slug: { in: qualificationCategorySlugs } } } }
      : {}),
  };
  const hasQualificationFilter = Object.keys(qualificationFilter).length > 0;
  const categoryFilter = resolveCategoryFilter(categorySlug);

  const postFilter: Prisma.PostWhereInput = {
    ...(hasQualificationFilter ? { qualification: qualificationFilter } : {}),
    ...(branchSlugs.length > 0
      ? { branches: { some: { slug: { in: branchSlugs } } } }
      : {}),
    ...(categoryFilter.post ?? {}),
  };
  const hasPostLevelFilter = Object.keys(postFilter).length > 0;

  const organizationFilter: Prisma.OrganizationWhereInput = {
    ...(organizationSlugs.length > 0
      ? { slug: { in: organizationSlugs } }
      : {}),
    // Category is filtered here against the real sector Category.slug (SSC,
    // Railway, Banking, ...) via the organization it belongs to -- not
    // against the coarse bucket value notificationToJobs derives for
    // display/icon purposes. This is what was actually broken before: the
    // filter bar sends a real category slug, but job.category is a
    // 6-bucket display value, so they could never match.
    ...(categoryFilter.organization ?? {}),
  };

  const hasOrganizationFilter = Object.keys(organizationFilter).length > 0;

  const notifications = await prisma.notification.findMany({
    where: {
      status: "LIVE",
      published: true,
      ...(hasOrganizationFilter ? { organization: organizationFilter } : {}),
      ...(stateCodes.length > 0
        ? { states: { some: { code: { in: stateCodes } } } }
        : {}),
      ...(hasPostLevelFilter ? { posts: { some: postFilter } } : {}),
    },
    include: {
      organization: { include: { category: true } },
      posts: { include: { qualification: true, branches: true } },
    },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
  });

  let jobs = notifications.flatMap(notificationToJobs);

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
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <JobFiltersBar />
      </div>

      <SectionHeader
        title={query ? `Search results for "${query}"` : "All Government Jobs"}
        description={`${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
      />

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-sm text-neutral-600">
            No jobs found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              matchPercentage={matchByJobId.get(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
