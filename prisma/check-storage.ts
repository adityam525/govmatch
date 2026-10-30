import 'dotenv/config';

const base = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function main() {
  console.log(`SUPABASE_URL: ${base ? 'set' : 'MISSING'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${key ? 'set' : 'MISSING'}`);
  if (!base || !key) { console.log('\nAdd both to .env (and Vercel), then run this again.'); process.exit(1); }

  const auth = { Authorization: `Bearer ${key}`, apikey: key };
  const bucket = await fetch(`${base}/storage/v1/bucket/logos`, { headers: auth });
  if (!bucket.ok) { console.log(`\nBucket "logos": not found (HTTP ${bucket.status}). Create a PUBLIC bucket named logos.`); process.exit(1); }
  const info: any = await bucket.json();
  console.log(`Bucket "logos": found, ${info.public ? 'public' : 'NOT public (make it public or logos will not show)'}`);

  const path = `organizations/storage-check-${Date.now()}.png`;
  const up = await fetch(`${base}/storage/v1/object/logos/${path}`, { method: 'POST', headers: { ...auth, 'Content-Type': 'image/png' }, body: PNG });
  console.log(`Upload: ${up.ok ? 'ok' : `FAILED (HTTP ${up.status}) ${await up.text()}`}`);
  if (up.ok) {
    const pub = await fetch(`${base}/storage/v1/object/public/logos/${path}`);
    console.log(`Public address: ${pub.ok ? 'ok' : `FAILED (HTTP ${pub.status})`}`);
    const del = await fetch(`${base}/storage/v1/object/logos/${path}`, { method: 'DELETE', headers: auth });
    console.log(`Cleanup: ${del.ok ? 'ok' : 'could not delete the test file, remove it in Supabase'}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
