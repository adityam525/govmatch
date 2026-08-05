import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Without this, Next.js can cache this route's response at build time and
// keep serving a stale list even after Category rows change -- the same
// issue we hit with /api/qualification-categories.
export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const category = await prisma.category.create({ data: body });
  return NextResponse.json(category, { status: 201 });
}
