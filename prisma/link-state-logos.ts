import 'dotenv/config';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { prisma } from '../lib/prisma';

const DIR = join(process.cwd(), 'public', 'state-logos');
const EXTENSIONS = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
const apply = process.argv.includes('--apply');

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

  const files = new Map<string, string>();
  for (const file of readdirSync(DIR)) {
    const { name, ext } = parse(file);
    if (EXTENSIONS.includes(ext.toLowerCase())) files.set(slugify(name), file);
  }

  const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
  let linked = 0;
  const missing: string[] = [];

  for (const state of states) {
    const file = [slugify(state.name), slugify(state.code)].map((k) => files.get(k)).find(Boolean);
    if (!file) {
      if (!(state as any).logoUrl) missing.push(`${slugify(state.name)}.png   ${state.name}`);
      continue;
    }
    const url = `/state-logos/${encodeURIComponent(file)}`;
    if ((state as any).logoUrl === url) continue;
    console.log(`${apply ? 'linked' : 'would link'}: ${state.name} -> ${url}`);
    if (apply) await prisma.state.update({ where: { id: state.id }, data: { logoUrl: url } as any });
    linked++;
  }

  console.log(`\n${files.size} files | ${apply ? 'linked' : 'to link'}: ${linked} | states still without a logo: ${missing.length}`);
  for (const m of missing) console.log('  ' + m);
  if (!apply && linked > 0) console.log('\nRe-run with --apply to save.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
