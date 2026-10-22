import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const CSV = join(process.cwd(), 'prisma', 'org-logos.csv');
const OUT = join(process.cwd(), 'public', 'org-logos');
const MAX_BYTES = 1_500_000;
const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};
const force = process.argv.includes('--force');

// Minimal CSV line parser (handles quoted fields and doubled quotes).
function parseLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') quoted = false;
      else current += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(current); current = ''; }
    else current += ch;
  }
  cells.push(current);
  return cells;
}

async function main() {
  if (!existsSync(CSV)) {
    console.error('prisma/org-logos.csv not found. Run: npx tsx prisma/export-logo-template.ts');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const [header, ...rows] = readFileSync(CSV, 'utf8').split(/\r?\n/).filter(Boolean).map(parseLine);
  const col = (name: string) => header.indexOf(name);
  const slugCol = col('slug');
  const urlCol = col('logo_url');
  if (slugCol < 0 || urlCol < 0) {
    console.error('The CSV needs slug and logo_url columns.');
    process.exit(1);
  }

  let saved = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    const slug = (row[slugCol] ?? '').trim();
    const url = (row[urlCol] ?? '').trim();
    if (!url) continue;

    if (!/^[a-z0-9-]+$/.test(slug)) { console.log(`skip (unsafe slug): ${slug}`); skipped++; continue; }
    if (!/^https?:\/\//i.test(url)) { console.log(`skip (not an http/https URL): ${slug}`); skipped++; continue; }

    const existing = readdirSync(OUT).filter((f) => parse(f).name === slug);
    if (existing.length > 0 && !force) { console.log(`skip (already have a file; use --force to replace): ${slug}`); skipped++; continue; }

    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'GovMatchLogoFetcher/1.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      const ext = TYPES[type];
      if (!ext) throw new Error(`unsupported content type "${type || 'unknown'}"`);

      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length > MAX_BYTES) throw new Error(`file too large (${Math.round(bytes.length / 1024)} KB)`);
      if (ext === 'svg' && !bytes.toString('utf8').includes('<svg')) throw new Error('not a valid SVG');

      for (const old of existing) unlinkSync(join(OUT, old));
      writeFileSync(join(OUT, `${slug}.${ext}`), bytes);
      console.log(`saved: ${slug}.${ext} (${Math.round(bytes.length / 1024)} KB)`);
      saved++;
    } catch (error) {
      console.log(`FAILED ${slug}: ${(error as Error).message}`);
      failed++;
    }
  }

  console.log(`\nsaved ${saved} | skipped ${skipped} | failed ${failed}`);
  if (saved > 0) console.log('Next: npx tsx prisma/link-org-logos.ts   (then add --apply)');
}

main();
