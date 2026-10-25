// Server-only: uploads go through the Supabase service-role key, which must never reach the browser.
import 'server-only';

const BUCKET = 'logos';
const MAX_BYTES = 1_500_000;

// Sniffed from the file's first bytes, so a renamed file cannot slip through as an image.
function detectType(bytes: Uint8Array): { ext: string; mime: string } | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return { ext: 'png', mime: 'image/png' };
  if (starts([0xff, 0xd8, 0xff])) return { ext: 'jpg', mime: 'image/jpeg' };
  if (starts([0x52, 0x49, 0x46, 0x46]) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  const head = new TextDecoder().decode(bytes.slice(0, 600)).toLowerCase();
  if (head.includes('<svg')) return { ext: 'svg', mime: 'image/svg+xml' };
  return null;
}

export type UploadResult = { ok: true; url: string } | { ok: false; status: number; message: string };

export async function uploadLogo(folder: 'organizations' | 'states', slug: string, file: File): Promise<UploadResult> {
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) {
    return { ok: false, status: 500, message: 'Image upload is not set up yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' };
  }
  if (file.size === 0) return { ok: false, status: 400, message: 'That file is empty.' };
  if (file.size > MAX_BYTES) return { ok: false, status: 400, message: 'Image is too large. Keep it under 1.5 MB.' };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);
  if (!type) return { ok: false, status: 400, message: 'Upload a PNG, JPG, WebP or SVG image.' };

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'logo';
  // A fresh name each time, so a changed logo is never served from an old cache.
  const path = `${folder}/${safeSlug}-${Date.now()}.${type.ext}`;

  const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': type.mime, 'x-upsert': 'true' },
    body: bytes,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Logo upload failed:', res.status, detail);
    return { ok: false, status: 502, message: 'The image could not be stored. Check that the "logos" bucket exists and is public.' };
  }
  return { ok: true, url: `${base}/storage/v1/object/public/${BUCKET}/${path}` };
}
