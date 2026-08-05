import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/branches
// GET /api/branches?qualificationSlugs=btech-be,mtech-me
//
// When qualificationSlugs is present, only branches belonging to one of
// those Qualification rows are returned (cascading filter used by the jobs
// filter bar). With no qualificationSlugs, behavior is unchanged from
// before -- every branch is returned.
//
// Uses slugs (not ids) so filter URLs stay human-readable, consistent with
// how `search` already uses free text rather than an id.
export async function GET(request: NextRequest) {
  const qualificationSlugs =
    request.nextUrl.searchParams
      .get("qualificationSlugs")
      ?.split(",")
      .filter(Boolean) ?? [];

  const branches = await prisma.branch.findMany({
    where:
      qualificationSlugs.length > 0
        ? { qualification: { slug: { in: qualificationSlugs } } }
        : {},
    orderBy: { name: "asc" },
  });
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  const body = await request.json();
  const branch = await prisma.branch.create({ data: body });
  return NextResponse.json(branch, { status: 201 });
}
