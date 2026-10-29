import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bad, describeDbError, slugify, text } from "@/lib/lookup-api";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if ("name" in body) {
      const name = text(body.name, 120);
      if (!name) return bad("Enter the branch name (up to 120 characters).");
      data.name = name;
    }
    if ("slug" in body) {
      const slug = slugify(String(body.slug ?? ""));
      if (!slug) return bad("The slug needs letters or numbers.");
      data.slug = slug;
    }
    const updated = await prisma.branch.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return describeDbError(error, "branch");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const [posts, rules, profiles, educations] = await Promise.all([
      prisma.post.count({ where: { branches: { some: { id } } } }),
      prisma.postQualificationRule.count({ where: { branchIds: { has: id } } }),
      prisma.userProfile.count({ where: { branchId: id } }),
      prisma.userEducation.count({ where: { branchId: id } }),
    ]);
    const used = [
      posts && `${posts} job post${posts === 1 ? "" : "s"}`,
      rules && `${rules} post qualification rule${rules === 1 ? "" : "s"}`,
      profiles && `${profiles} user profile${profiles === 1 ? "" : "s"}`,
      educations && `${educations} user education entr${educations === 1 ? "y" : "ies"}`,
    ].filter(Boolean);
    if (used.length > 0) {
      return NextResponse.json({ message: `This branch is still used by ${used.join(", ")}, so it cannot be deleted.` }, { status: 409 });
    }
    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, "branch");
  }
}
