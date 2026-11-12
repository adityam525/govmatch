import fs from 'fs';
import path from 'path';
import { colors } from '../design/tokens';

let failed = 0;
const fail = (m: string) => { failed++; console.log('FAIL  ' + m); };
const css = fs.readFileSync('app/globals.css', 'utf8').toLowerCase();

for (const [group, v] of Object.entries(colors)) {
  const entries = typeof v === 'string' ? [[group, v]] : Object.entries(v).map(([k, c]) => [group + '-' + k, c]);
  for (const [name, hex] of entries) {
    const m = css.match(new RegExp('--color-' + name + ':\\s*(#[0-9a-f]{3,8})'));
    if (m && m[1] !== String(hex).toLowerCase()) fail('--color-' + name + ' is ' + m[1] + ' in globals.css but ' + hex + ' in tokens');
  }
}

// Drift guard: hard-coded hex colours and pixel font sizes outside the allowed list.
const BASELINE = { hex: 3, px: 0 };
const SKIP = ['(admin)', '/admin', 'pwa-icon', 'HowItWorks'];
let hex = 0, px = 0;
const walk = (d: string) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) walk(p);
  else if (p.endsWith('.tsx') && !SKIP.some((s) => p.includes(s))) {
    const s = fs.readFileSync(p, 'utf8');
    hex += (s.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length; px += (s.match(/text-\[\d+px\]/g) ?? []).length;
  } } };
walk('app'); walk('components');
// low-contrast text colours must not return (they fail accessibility checks)
let low = 0;
const walk2 = (d: string) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) walk2(p);
  else if (p.endsWith('.tsx')) low += (fs.readFileSync(p, 'utf8').match(/\btext-(neutral-400|success|accent-orange|accent-green)\b/g) ?? []).length;
} };
walk2('app'); walk2('components');
console.log('low-contrast text classes: ' + low + ' (limit 0)');
if (low > 0) fail('low-contrast text classes found');
console.log('hard-coded hex colours: ' + hex + ' (limit ' + BASELINE.hex + '), pixel font sizes: ' + px + ' (limit ' + BASELINE.px + ')');
if (hex > BASELINE.hex) fail('more hard-coded colours than the limit');
if (px > BASELINE.px) fail('more pixel font sizes than the limit');
if (!failed) console.log('PASS  design checks');
process.exit(failed ? 1 : 0);
