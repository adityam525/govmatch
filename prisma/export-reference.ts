import 'dotenv/config';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';
import { fieldKey } from '../lib/field-keys';
import { EVENT_KINDS } from '../lib/schedule';
import { DIFFICULTIES } from '../lib/mock-difficulty';

function sheet(wb: ExcelJS.Workbook, name: string, headers: string[], rows: (string | number | null)[][], widths?: number[]) {
  const ws = wb.addWorksheet(name);
  ws.addRow(headers).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  headers.forEach((_, i) => { ws.getColumn(i + 1).width = widths?.[i] ?? 28; });
}

async function main() {
  const wb = new ExcelJS.Workbook();

  const sectors = await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { organizations: true } } } });
  sheet(wb, 'Sectors', ['Name', 'Slug', 'Organizations'], sectors.map((s) => [s.name, s.slug, s._count.organizations]));

  const orgs = await prisma.organization.findMany({ orderBy: { name: 'asc' }, include: { category: { select: { name: true } } } });
  sheet(wb, 'Organizations', ['Name', 'Short name', 'Slug', 'Sector', 'Website', 'Logo'], orgs.map((o) => [o.name, o.shortName, o.slug, o.category?.name ?? '', o.website ?? '', o.logoUrl ?? '']), [48, 18, 24, 22, 36, 30]);

  const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
  sheet(wb, 'States', ['Name', 'Code'], states.map((s) => [s.name, s.code]));

  const types = await prisma.qualificationCategory.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { qualifications: true } } } });
  sheet(wb, 'Education types', ['Name', 'Slug', 'Qualifications'], types.map((t) => [t.name, t.slug, t._count.qualifications]));

  const quals = await prisma.qualification.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }], include: { categories: { select: { name: true } }, _count: { select: { branches: true } } } });
  sheet(wb, 'Qualifications', ['Level', 'Name', 'Slug', 'Education types', 'Branches'], quals.map((q) => [q.level, q.name, q.slug, q.categories.map((c) => c.name).join(', '), q._count.branches]));

  const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' }, include: { qualification: { select: { name: true, level: true } } } });
  branches.sort((a, b) => a.qualification.level - b.qualification.level || a.qualification.name.localeCompare(b.qualification.name) || a.name.localeCompare(b.name));
  sheet(wb, 'Branches', ['Qualification', 'Branch', 'Slug', 'Matching field key'], branches.map((b) => [b.qualification.name, b.name, b.slug, fieldKey(b.name) ?? '(none)']));

  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
  sheet(wb, 'Roles', ['Name', 'Slug'], roles.map((r) => [r.name, r.slug]));

  const fixed: [string, string, string][] = [
    ['Applicant category', 'General', ''], ['Applicant category', 'OBC', ''], ['Applicant category', 'SC', ''], ['Applicant category', 'ST', ''], ['Applicant category', 'EWS', ''],
    ['Job type', 'PERMANENT', ''], ['Job type', 'CONTRACT', ''], ['Job type', 'APPRENTICE', ''], ['Job type', 'INTERNSHIP', ''], ['Job type', 'TEMPORARY', ''], ['Job type', 'DEPUTATION', ''],
    ['Application mode', 'ONLINE', ''], ['Application mode', 'OFFLINE', ''], ['Application mode', 'BOTH', ''],
    ['Job status', 'LIVE (automatic)', ''], ['Job status', 'UPCOMING', ''], ['Job status', 'CLOSED', ''], ['Job status', 'CANCELLED', ''],
    ['Selection step', 'Written Exam', ''], ['Selection step', 'Skill Test', ''], ['Selection step', 'Physical Test', ''], ['Selection step', 'Document Verification', ''], ['Selection step', 'Medical Examination', ''], ['Selection step', 'Interview', ''],
    ...EVENT_KINDS.map((k): [string, string, string] => ['Schedule event', k.code, k.label]),
    ...DIFFICULTIES.map((d): [string, string, string] => ['Mock test difficulty', d.code, d.label]),
  ];
  sheet(wb, 'Fixed lists', ['List', 'Value', 'Label'], fixed);

  fs.mkdirSync('exports', { recursive: true });
  const file = 'exports/govmatch-reference-' + new Date().toISOString().slice(0, 10) + '.xlsx';
  await wb.xlsx.writeFile(file);
  console.log('Written: ' + file);
  console.log(`${orgs.length} organizations, ${quals.length} qualifications, ${branches.length} branches, ${states.length} states, ${sectors.length} sectors.`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
