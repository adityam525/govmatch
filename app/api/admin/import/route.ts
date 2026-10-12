import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { importJobs, MAX_JOBS_PER_IMPORT } from '@/lib/import/job-import';

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be JSON' }, { status: 400 });
  }

  const jobs = body?.jobs;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return NextResponse.json({ message: 'Expected { "jobs": [ ... ] } with at least one job' }, { status: 400 });
  }
  if (jobs.length > MAX_JOBS_PER_IMPORT) {
    return NextResponse.json(
      { message: `Too many jobs in one import (max ${MAX_JOBS_PER_IMPORT})` },
      { status: 400 },
    );
  }

  const dryRun = body.dryRun !== false;

  try {
    const results = await importJobs(jobs, dryRun);
    const summary = { created: 0, valid: 0, duplicate: 0, error: 0 };
    for (const r of results) summary[r.status] += 1;
    return NextResponse.json({ dryRun, summary, results });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ message: 'Import failed' }, { status: 500 });
  }
}
