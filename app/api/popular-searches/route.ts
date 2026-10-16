import { NextResponse } from 'next/server';
import { getPopularOrganizations } from '@/lib/popular-searches';

export async function GET() {
  try {
    const items = await getPopularOrganizations(5);
    return NextResponse.json(
      items.map((item) => ({
        label: item.label,
        slug: item.slug,
        jobs: item.jobs,
        vacancies: item.vacancies,
        href: `/jobs?organizations=${encodeURIComponent(item.slug)}&phase=all`,
      })),
    );
  } catch (error) {
    console.error('Failed to load popular searches:', error);
    return NextResponse.json([]);
  }
}
