import 'dotenv/config';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { prisma } from '../lib/prisma';

const kind = process.argv[2];
if (kind !== 'org' && kind !== 'state') {
  console.error('Usage: npx tsx prisma/link-logos.ts <org|state> [--apply]');
  process.exit(1);
}
const apply = process.argv.includes('--apply');

const FOLDER = kind === 'org' ? 'org-logos' : 'state-logos';
const DIR = join(process.cwd(), 'public', FOLDER);
const URL_PREFIX = `/${FOLDER}/`;
const EXTENSIONS = ['.svg', '.png', '.webp', '.jpg', '.jpeg']; // preference order
const WARN_BYTES = 200 * 1024;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface Entity {
  id: string;
  name: string;
  keys: string[];
  logoUrl: string | null;
  jobs: number;
}

async function loadEntities(): Promise<Entity[]> {
  if (kind === 'org') {
    const rows = await prisma.organization.findMany({
      select: { id: true, name: true, shortName: true, slug: true, logoUrl: true, _count: { select: { notifications: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      keys: [r.slug, slugify(r.shortName), slugify(r.name)].filter(Boolean),
      logoUrl: r.logoUrl,
      jobs: r._count.notifications,
    }));
  }
  const rows = await prisma.state.findMany({
    select: { id: true, name: true, code: true, logoUrl: true, _count: { select: { notifications: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    keys: [slugify(r.name), slugify(r.code)].filter(Boolean),
    logoUrl: r.logoUrl,
    jobs: r._count.notifications,
  }));
}

async function save(id: string, logoUrl: string) {
  if (kind === 'org') await prisma.organization.update({ where: { id }, data: { logoUrl } });
  else await prisma.state.update({ where: { id }, data: { logoUrl } });
}

async function main() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

  const byKey = new Map<string, string[]>();
  const allFiles: string[] = [];
  for (const file of readdirSync(DIR)) {
    const { name, ext } = parse(file);
    if (!EXTENSIONS.includes(ext.toLowerCase())) continue;
    allFiles.push(file);
    const key = slugify(name);
    byKey.set(key, [...(byKey.get(key) ?? []), file]);
  }
  const rank = (f: string) => EXTENSIONS.indexOf(parse(f).ext.toLowerCase());

  const entities = await loadEntities();
  const used = new Set<string>();
  const missing: Entity[] = [];
  const broken: Entity[] = [];
  const duplicates: string[] = [];
  let linked = 0;
  let unchanged = 0;
  let keptCustom = 0;

  for (const e of entities) {
    const candidates = [...new Set(e.keys.flatMap((k) => byKey.get(k) ?? []))].sort((a, b) => rank(a) - rank(b));

    if (candidates.length === 0) {
      if (!e.logoUrl) missing.push(e);
      else if (e.logoUrl.startsWith(URL_PREFIX)) {
        const filename = decodeURIComponent(e.logoUrl.slice(URL_PREFIX.length));
        if (!existsSync(join(DIR, filename))) broken.push(e);
      }
      continue;
    }

    const file = candidates[0];
    candidates.forEach((f) => used.add(f));
    if (candidates.length > 1) duplicates.push(`${e.name}: using ${file}, ignoring ${candidates.slice(1).join(', ')}`);

    const url = `${URL_PREFIX}${encodeURIComponent(file)}`;
    if (e.logoUrl === url) { unchanged++; continue; }
    if (e.logoUrl && !e.logoUrl.startsWith(URL_PREFIX)) {
      keptCustom++;
      console.log(`keeping the URL set in admin: ${e.name}`);
      continue;
    }

    console.log(`${apply ? 'linked' : 'would link'}: ${e.name} -> ${url}`);
    if (apply) await save(e.id, url);
    linked++;
  }

  console.log(
    `\n${allFiles.length} logo files | ${apply ? 'linked' : 'to link'}: ${linked} | already linked: ${unchanged} | custom URLs kept: ${keptCustom}`,
  );

  const unmatched = allFiles.filter((f) => !used.has(f));
  if (unmatched.length > 0) {
    console.log(`\n${unmatched.length} files match no ${kind === 'org' ? 'organization' : 'state'} (check the spelling):`);
    for (const f of unmatched) {
      const key = slugify(parse(f).name);
      const hint = entities.find((e) => e.keys.some((k) => k.length >= 3 && (k.includes(key) || key.includes(k))));
      console.log(`  ${f}${hint ? `   maybe: ${hint.keys[0]}.<ext> (${hint.name})` : ''}`);
    }
  }

  if (broken.length > 0) {
    console.log(`\n${broken.length} entries point at a file that no longer exists (they will show initials):`);
    for (const e of broken) console.log(`  ${e.name} -> ${e.logoUrl}`);
  }

  if (duplicates.length > 0) {
    console.log('\nMore than one file for the same entry:');
    for (const d of duplicates) console.log(`  ${d}`);
  }

  const heavy = allFiles
    .map((f) => ({ f, size: statSync(join(DIR, f)).size }))
    .filter((x) => x.size > WARN_BYTES)
    .sort((a, b) => b.size - a.size);
  if (heavy.length > 0) {
    console.log(`\n${heavy.length} files are over 200 KB. Resize to about 256px wide to keep pages fast:`);
    for (const h of heavy) console.log(`  ${h.f}  ${Math.round(h.size / 1024)} KB`);
  }

  missing.sort((a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name));
  const list = missing.map((e) => `${e.keys[0]}.png   (${e.jobs} jobs)  ${e.name}`);
  const listFile = `/tmp/missing-${kind}-logos.txt`;
  writeFileSync(listFile, list.join('\n') + '\n');
  console.log(`\n${missing.length} still have no logo. Full list: ${listFile}   Top 25 by jobs:`);
  for (const line of list.slice(0, 25)) console.log('  ' + line);

  if (!apply && linked > 0) console.log('\nDry run only. Re-run with --apply to save these links.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
