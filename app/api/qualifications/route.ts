import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/qualifications
// GET /api/qualifications?categorySlugs=engineering,medical
//
// When categorySlugs is present, only qualifications belonging to at least
// one of those QualificationCategory rows are returned (cascading filter
// used by the jobs filter bar). With no categorySlugs, behavior is
// unchanged from before -- every qualification is returned.
//
// Uses slugs (not ids) so filter URLs stay human-readable, consistent with
// how `search` already uses free text rather than an id.
export async function GET(request: NextRequest) {
  const categorySlugs =
    request.nextUrl.searchParams
      .get("categorySlugs")
      ?.split(",")
      .filter(Boolean) ?? [];

  const qualifications = await prisma.qualification.findMany({
    where:
      categorySlugs.length > 0
        ? { categories: { some: { slug: { in: categorySlugs } } } }
        : {},
    orderBy: { level: "asc" },
  });
  return NextResponse.json(qualifications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const qualification = await prisma.qualification.create({ data: body });
  return NextResponse.json(qualification, { status: 201 });
}
