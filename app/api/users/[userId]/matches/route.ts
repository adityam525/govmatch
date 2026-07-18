import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeMatch } from '@/features/matching/engine';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { preferredRoles: true },
    });

    if (!profile) {
      return NextResponse.json({ message: 'No profile found for this user' }, { status: 404 });
    }

    const userQualification = profile.qualificationId
      ? await prisma.qualification.findUnique({ where: { id: profile.qualificationId } })
      : null;

    const notifications = await prisma.notification.findMany({
      where: { status: 'LIVE' },
      include: {
        organization: true,
        posts: { include: { qualification: true, branches: true, roles: true } },
      },
    });

    const matches = notifications.flatMap((notification) =>
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
          breakdown: result.breakdown,
        };
      })
    );

    // Eligible + highest match first
    matches.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.matchScore - a.matchScore;
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Failed to compute matches:', error);
    return NextResponse.json({ message: 'Failed to compute matches' }, { status: 500 });
  }
}
