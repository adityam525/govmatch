import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    return NextResponse.json(
      { message: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Auto-generate a slug from shortName/name if the caller didn't supply
    // one, so admin-created organizations always get a filterable slug.
    const slug = body.slug || slugify(body.shortName || body.name || "");
    const organization = await prisma.organization.create({
      data: { ...body, slug },
    });
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Failed to create organization:", error);
    return NextResponse.json(
      { message: "Failed to create organization" },
      { status: 500 },
    );
  }
}
