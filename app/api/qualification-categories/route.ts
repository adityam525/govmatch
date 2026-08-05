import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/qualification-categories
// Returns the high-level qualification filter list (8th Pass, Engineering,
// Medical, ...), ordered by the admin-controlled `order` field.
export async function GET() {
  const categories = await prisma.qualificationCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(categories);
}
