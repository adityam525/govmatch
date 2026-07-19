import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeMatch } from '@/features/matching/engine';

import QuickStatsBar from '@/components/sections/home-logged-in/QuickStatsBar';
import LatestJobsSection from '@/components/sections/home-logged-out/LatestJobsSection';
import CategoryStrip from '@/components/sections/home-logged-out/CategoryStrip';
import QualificationStrip from '@/components/sections/home-logged-out/QualificationStrip';
import LatestUpdatesGrid from '@/components/sections/home-logged-out/LatestUpdatesGrid';
import HowItWorks from '@/components/sections/shared/HowItWorks';
import MockTestPromo from '@/components/sections/shared/MockTestPromo';
import WhyChooseUs from '@/components/sections/home-logged-out/WhyChooseUs/WhyChooseUs';

import SearchHero from '@/components/sections/home-logged-in/SearchHero/SearchHero';
import RecommendedJobsSidebar from '@/components/sections/home-logged-in/RecommendedJobsSidebar';
import ProfileStrengthCard from '@/components/sections/home-logged-in/ProfileStrengthCard';
import NotificationPromptCard from '@/components/sections/home-logged-in/NotificationPromptCard';
import MockTestPromoCard from '@/components/sections/home-logged-in/MockTestPromoCard';

function serialize(data) {
  return JSON.parse(JSON.stringify(data));
}

async function getHomePageData() {
  const [notifications, admitCards, results, answerKeys, documents] = await Promise.all([
    prisma.notification.findMany({
      where: { status: 'LIVE' },
      include: {
        organization: { include: { category: true } },
        posts: { include: { qualification: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.admitCard.findMany({ include: { notification: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.result.findMany({ include: { notification: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.answerKey.findMany({ include: { notification: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.document.findMany({ include: { notification: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
  ]);

  return serialize({ notifications, admitCards, results, answerKeys, documents });
}

async function getUserMatchesAndStrength(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { preferredRoles: true },
  });

  if (!profile) return { matches: [], strength: 0 };

  const userQualification = profile.qualificationId
    ? await prisma.qualification.findUnique({ where: { id: profile.qualificationId } })
    : null;

  const liveNotifications = await prisma.notification.findMany({
    where: { status: 'LIVE' },
    include: {
      organization: true,
      posts: { include: { qualification: true, branches: true, roles: true } },
    },
  });

  const matches = liveNotifications.flatMap((notification) =>
    notification.posts.map((post) => {
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
          branchIds: post.branches.map((b) => b.id),
          roleIds: post.roles.map((r) => r.id),
          employmentType: post.employmentType,
        }
      );

      return {
        notificationId: notification.id,
        notificationTitle: notification.title,
        slug: notification.slug,
        organization: notification.organization?.name,
        postId: post.id,
        postTitle: post.title,
        vacancies: post.vacancies,
        applicationEndDate: notification.applicationEndDate,
        matchScore: result.score,
        eligible: result.eligible,
      };
    })
  );

  matches.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.matchScore - a.matchScore;
  });

  return serialize({ matches, strength: profile.profileStrength });
}

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  const data = await getHomePageData();

  const updatesGrid = (
    <LatestUpdatesGrid
      notifications={data.notifications}
      admitCards={data.admitCards}
      results={data.results}
      answerKeys={data.answerKeys}
      documents={data.documents}
    />
  );

  if (isLoggedIn && userId) {
    const { matches, strength } = await getUserMatchesAndStrength(userId);
    const topScore = matches.length > 0 ? matches[0].matchScore : null;

    return (
      <div className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <SearchHero matchScore={topScore} />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-10 grid lg:grid-cols-10 gap-8 items-start">
          <div className="lg:col-span-7 space-y-10">
            <QuickStatsBar />
            <LatestJobsSection initialNotifications={data.notifications} />
          </div>
          <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-6">
            <RecommendedJobsSidebar matches={matches} />
            <ProfileStrengthCard strength={strength} />
            <NotificationPromptCard />
            <MockTestPromoCard />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 space-y-16 py-16">
          <CategoryStrip />
          <QualificationStrip />
          {updatesGrid}
          <HowItWorks />
          <MockTestPromo />
          <WhyChooseUs />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <SearchHero />
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <QuickStatsBar />
      </div>
      <div className="max-w-7xl mx-auto px-6 space-y-16 py-16">
        <LatestJobsSection initialNotifications={data.notifications} />
        <CategoryStrip />
        <QualificationStrip />
        {updatesGrid}
        <HowItWorks />
        <MockTestPromo />
        <WhyChooseUs />
      </div>
    </div>
  );
}
