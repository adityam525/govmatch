import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bad, describeDbError, slugify, text } from "@/lib/lookup-api";

// GET /api/branches?qualificationSlugs=btech-be,mtech-me filters by qualification.
export async function GET(request: NextRequest) {
  const qualificationSlugs =
    request.nextUrl.searchParams.get("qualificationSlugs")?.split(",").filter(Boolean) ?? [];

  const branches = await prisma.branch.findMany({
    where: qualificationSlugs.length > 0 ? { qualification: { slug: { in: qualificationSlugs } } } : {},
    orderBy: { name: "asc" },
  });
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 120);
    if (!name) return bad("Enter the branch name (up to 120 characters).");
    if (typeof body.qualificationId !== "string" || !body.qualificationId) return bad("Choose the qualification.");

    const qualification = await prisma.qualification.findUnique({
      where: { id: body.qualificationId },
      select: { id: true, name: true },
    });
    if (!qualification) return bad("That qualification no longer exists.");

    const sibling = await prisma.branch.findFirst({
      where: { qualificationId: qualification.id },
      select: { qualificationGroup: true },
    });
    const slug = slugify(text(body.slug, 120) || name);
    if (!slug) return bad("The slug needs letters or numbers.");

    const created = await prisma.branch.create({
      data: {
        name,
        slug,
        qualificationGroup: text(body.qualificationGroup, 80) || sibling?.qualificationGroup || qualification.name,
        qualificationId: qualification.id,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, "branch");
  }
}
