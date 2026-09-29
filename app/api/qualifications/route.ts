import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/qualifications
// GET /api/qualifications?categorySlugs=engineering,medical
// With categorySlugs, only qualifications belonging to at least one of those
// QualificationCategory rows are returned (cascading filter). Without it,
// every qualification is returned.
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
    include: { categories: true },
  });
  return NextResponse.json(qualifications);
}

// POST /api/qualifications
// Optional `categorySlug` / `categorySlugs` link the new qualification to
// existing QualificationCategory rows, so it shows up in the cascade.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categorySlug, categorySlugs, ...data } = body;
    const slugs: string[] = categorySlugs ?? (categorySlug ? [categorySlug] : []);
    const qualification = await prisma.qualification.create({
      data: {
        ...data,
        level: Number(data.level) || 5,
        categories: slugs.length
          ? { connect: slugs.map((slug) => ({ slug })) }
          : undefined,
      },
      include: { categories: true },
    });
    return NextResponse.json(qualification, { status: 201 });
  } catch (error) {
    console.error("Failed to create qualification:", error);
    return NextResponse.json(
      { message: "Failed to create qualification" },
      { status: 500 },
    );
  }
}
