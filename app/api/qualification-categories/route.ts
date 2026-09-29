import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/qualification-categories
// High-level qualification filter list (8th Pass, Engineering, Medical, ...),
// ordered by the admin-controlled `order` field.
export async function GET() {
  const categories = await prisma.qualificationCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json(categories);
}

// POST /api/qualification-categories  { name }
// Slug is auto-generated; order is appended after the current last category.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    const last = await prisma.qualificationCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const created = await prisma.qualificationCategory.create({
      data: {
        name,
        slug: body.slug || slugify(name),
        order: (last?.order ?? 0) + 1,
      },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create qualification category:", error);
    return NextResponse.json(
      { message: "Failed to create qualification category" },
      { status: 500 },
    );
  }
}
