import { prisma } from '@/lib/prisma';

export const levelOf = (v: unknown): number | undefined => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : undefined;
};

// Accepts category ids and/or slugs (the post form's quick-add sends a slug) and checks they exist.
export async function resolveEducationTypes(body: Record<string, any>): Promise<{ ids: string[] } | { error: string }> {
  const ids: string[] = Array.isArray(body.categoryIds) ? body.categoryIds.map(String) : [];
  const slugs: string[] = Array.isArray(body.categorySlugs)
    ? body.categorySlugs.map(String)
    : body.categorySlug
      ? [String(body.categorySlug)]
      : [];
  if (ids.length + slugs.length === 0) return { ids: [] };

  const found = await prisma.qualificationCategory.findMany({
    where: { OR: [{ id: { in: ids } }, { slug: { in: slugs } }] },
    select: { id: true, slug: true },
  });
  const missing = ids.some((i) => !found.some((f) => f.id === i)) || slugs.some((s) => !found.some((f) => f.slug === s));
  if (missing) return { error: 'One of the education types no longer exists.' };
  return { ids: [...new Set(found.map((f) => f.id))] };
}
