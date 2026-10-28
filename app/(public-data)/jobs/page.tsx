import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/features/matching/engine";
import { notificationToJobs } from "@/features/jobs/adapters";
import JobListItem from "@/components/jobs/JobListItem";
import JobFiltersBar from "@/components/jobs/JobFiltersBar";
import SectionHeader from "@/components/ui/SectionHeader";
import { Prisma } from "@prisma/client";
import { resolveCategoryFilter } from "@/lib/category-filters";
import {
  parseView,
  getViewIds,
  getPhaseCounts,
  sortByIdOrder,
} from "@/lib/jobs-view";
import JobsViewTabs from "@/components/jobs/JobsViewTabs";
import StickyTools from "@/components/jobs/StickyTools";
import Link from "next/link";
import { isPremiumUser } from "@/lib/plan";
import { loadFitContext, bestFitForJob, type JobFit } from "@/lib/job-fit";
import {
  explainIneligibility,
  ageInYears,
  type EligibilityVerdict,
} from "@/lib/eligibility-reasons";

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

const VALID_SORTS = [
  "newest",
  "oldest",
  "relevance",
  "salary_high",
  "salary_low",
  "deadline_soon",
  "deadline_late",
  "posts_high",
  "posts_low",
] as const;

type SortType = (typeof VALID_SORTS)[number];

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();

  return [lower, ...(SEARCH_ALIASES[lower] ?? [])];
}

function getSortType(value?: string): SortType {
  if (value && VALID_SORTS.includes(value as SortType)) {
    return value as SortType;
  }

  return "newest";
}

function getSalaryValue(job: any): number {
  return Number(job.salaryMax ?? job.salaryMin ?? job.salary ?? 0);
}

function getDeadlineValue(job: any): number {
  if (!job.deadline) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(job.deadline).getTime();

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getPostsValue(job: any): number {
  return Number(
    job.numberOfPosts ?? job.totalPosts ?? job.vacancies ?? job.posts ?? 0,
  );
}

function getCreatedAtValue(job: any): number {
  if (!job.createdAt) {
    return 0;
  }

  const timestamp = new Date(job.createdAt).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// A post can accept several qualifications (any one of them is enough), so the
// lowest level is the real entry bar.
function lowestQualificationLevel(post: any): number | null {
  const levels = [
    ...(post.qualifications ?? []),
    ...(post.qualification ? [post.qualification] : []),
  ]
    .map((q: any) => q?.level)
    .filter((level: unknown): level is number => typeof level === "number");
  return levels.length > 0 ? Math.min(...levels) : null;
}

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  const query = params.search ?? "";
  const categorySlug = params.category ?? "";

  const organizationSlugs =
    params.organizations?.split(",").filter(Boolean) ?? [];

  const stateCodes = params.states?.split(",").filter(Boolean) ?? [];

  const qualificationCategorySlugs =
    params.qualificationCategories?.split(",").filter(Boolean) ?? [];

  const qualificationSlugs =
    params.qualifications?.split(",").filter(Boolean) ?? [];

  const branchSlugs = params.branches?.split(",").filter(Boolean) ?? [];

  const selectedSort = getSortType(params.sort);
  const view = parseView(params);
  const viewIds = await getViewIds(view);
  const phaseCounts = await getPhaseCounts(view.preset);

  const session = await auth();
  const userId = (session?.user as any)?.id;
  const isPremium = userId ? await isPremiumUser(userId) : false;
  const eligibleOnly = isPremium && params.eligible === "1";

  /*
   * Qualification filters
   *
   * Qualification hierarchy:
   *
   * QualificationCategory
   *        ↓
   * Qualification
   *        ↓
   * Branch
   */

  const qualificationFilter: Prisma.QualificationWhereInput = {
    ...(qualificationSlugs.length > 0
      ? {
          slug: {
            in: qualificationSlugs,
          },
        }
      : {}),

    ...(qualificationCategorySlugs.length > 0
      ? {
          categories: {
            some: {
              slug: {
                in: qualificationCategorySlugs,
              },
            },
          },
        }
      : {}),
  };

  const hasQualificationFilter = Object.keys(qualificationFilter).length > 0;

  /*
   * Category filter
   */

  const categoryFilter = resolveCategoryFilter(categorySlug);

  /*
   * Post-level filters
   */

  const postFilter: Prisma.PostWhereInput = {
    ...(hasQualificationFilter
      ? {
          qualification: qualificationFilter,
        }
      : {}),

    ...(branchSlugs.length > 0
      ? {
          branches: {
            some: {
              slug: {
                in: branchSlugs,
              },
            },
          },
        }
      : {}),

    ...(categoryFilter.post ?? {}),
  };

  const hasPostLevelFilter = Object.keys(postFilter).length > 0;

  /*
   * Organization filters
   */

  const organizationFilter: Prisma.OrganizationWhereInput = {
    ...(organizationSlugs.length > 0
      ? {
          slug: {
            in: organizationSlugs,
          },
        }
      : {}),

    ...(categoryFilter.organization ?? {}),
  };

  const hasOrganizationFilter = Object.keys(organizationFilter).length > 0;

  /*
   * Fetch notifications.
   *
   * Always fetch newest first from the database.
   * Other sorting is performed after notificationToJobs()
   * because salary/deadline/vacancy data belongs to the
   * final job representation.
   */

  const notifications = await prisma.notification.findMany({
    where: {
      id: { in: viewIds },
      published: true,

      ...(hasOrganizationFilter
        ? {
            organization: organizationFilter,
          }
        : {}),

      ...(stateCodes.length > 0
        ? {
            states: {
              some: {
                code: {
                  in: stateCodes,
                },
              },
            },
          }
        : {}),

      ...(hasPostLevelFilter
        ? {
            posts: {
              some: postFilter,
            },
          }
        : {}),
    },

    include: {
      organization: {
        include: {
          category: true,
        },
      },

      posts: {
        include: {
          qualification: true,
          qualifications: true,
          branches: true,
          roles: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  /*
   * Convert notifications to jobs
   */

  let jobs = notifications.flatMap(notificationToJobs);

  /*
   * Search
   */

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

  /*
   * Match, eligibility and the reasons behind them, for logged-in users.
   * The rules live in lib/job-fit.ts: every qualification the user holds counts,
   * and a specific degree needs the same field (or a higher degree in it).
   */

  const matchByJobId = new Map<string, number>();
  const eligibleJobIds = new Set<string>();
  const verdictByJobId = new Map<string, { score: number; verdict: { label: string; reasons: string[] } }>();
  const fitByJobId = new Map<string, JobFit>();
  let hasProfile = false;
  let profileComplete = false;

  if (userId) {
    try {
      const fitContext = await loadFitContext(userId);
      hasProfile = fitContext.hasProfile;
      profileComplete = fitContext.profileComplete;

      if (fitContext.hasProfile) {
        for (const notification of notifications) {
          const fit = bestFitForJob(fitContext, notification.posts as any[]);
          if (!fit) continue;

          fitByJobId.set(notification.id, fit);
          matchByJobId.set(notification.id, fit.evaluation.score);

          if (fit.evaluation.verdict === "eligible") {
            eligibleJobIds.add(notification.id);
          } else {
            verdictByJobId.set(notification.id, {
              score: fit.evaluation.score,
              verdict: {
                label: fit.evaluation.label,
                reasons: fit.evaluation.checks
                  .filter((check) => check.state === "fail" || check.state === "unknown")
                  .map((check) => check.text),
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Jobs: could not evaluate matches", error);
    }
  }

  /*
   * Sort final jobs
   *
   * Sorting happens after:
   *
   * 1. Database filtering
   * 2. notificationToJobs()
   * 3. Search filtering
   * 4. Match-score calculation
   */

  if (eligibleOnly && profileComplete) {
    jobs = jobs.filter((job) => eligibleJobIds.has(job.id));
  }

  jobs.sort((a: any, b: any) => {
    switch (selectedSort) {
      /*
       * Newest
       */

      case "newest":
        return getCreatedAtValue(b) - getCreatedAtValue(a);

      /*
       * Oldest
       */

      case "oldest":
        return getCreatedAtValue(a) - getCreatedAtValue(b);

      /*
       * Most relevant
       *
       * For logged-out users, relevance isn't available,
       * so fall back to newest.
       */

      case "relevance": {
        if (!userId) {
          return getCreatedAtValue(b) - getCreatedAtValue(a);
        }

        return (matchByJobId.get(b.id) ?? 0) - (matchByJobId.get(a.id) ?? 0);
      }

      /*
       * Highest salary
       */

      case "salary_high":
        return getSalaryValue(b) - getSalaryValue(a);

      /*
       * Lowest salary
       */

      case "salary_low":
        return getSalaryValue(a) - getSalaryValue(b);

      /*
       * Deadline soonest
       *
       * Jobs without a deadline go to the bottom.
       */

      case "deadline_soon":
        return getDeadlineValue(a) - getDeadlineValue(b);

      /*
       * Deadline latest
       *
       * Jobs without a deadline go to the bottom.
       */

      case "deadline_late": {
        const aDeadline = getDeadlineValue(a);
        const bDeadline = getDeadlineValue(b);

        if (
          aDeadline === Number.POSITIVE_INFINITY &&
          bDeadline !== Number.POSITIVE_INFINITY
        ) {
          return 1;
        }

        if (
          bDeadline === Number.POSITIVE_INFINITY &&
          aDeadline !== Number.POSITIVE_INFINITY
        ) {
          return -1;
        }

        return bDeadline - aDeadline;
      }

      /*
       * Most vacancies
       */

      case "posts_high":
        return getPostsValue(b) - getPostsValue(a);

      /*
       * Fewest vacancies
       */

      case "posts_low":
        return getPostsValue(a) - getPostsValue(b);

      default:
        return 0;
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <StickyTools>
        <JobFiltersBar isPremium={isPremium} />
        <JobsViewTabs view={view} counts={phaseCounts} params={params} />
      </StickyTools>

      {userId && !profileComplete && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Add your qualification and date of birth in your{" "}
          <Link href="/profile" className="font-medium underline">
            profile
          </Link>{" "}
          to see how well each job matches you
          {eligibleOnly ? " and use the eligibility filter" : ""}.
        </p>
      )}

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
        <div className="mt-4 space-y-4">
          {(view.preset && !params.sort
            ? sortByIdOrder(jobs, viewIds)
            : jobs
          ).map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              matchPercentage={profileComplete ? matchByJobId.get(job.id) : undefined}
              eligible={profileComplete && fitByJobId.has(job.id) ? eligibleJobIds.has(job.id) : undefined}
              verdict={verdictByJobId.get(job.id)?.verdict}
              fit={profileComplete ? fitByJobId.get(job.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
