'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const PRESETS = [
  { value: 'custom', label: 'Custom size', w: '', h: '', min: '', max: '' },
  { value: 'photo', label: 'Photo, 200 x 230 px, 20 to 50 KB', w: '200', h: '230', min: '20', max: '50' },
  { value: 'sign', label: 'Signature, 140 x 60 px, 10 to 20 KB', w: '140', h: '60', min: '10', max: '20' },
];

const toBlob = (c: HTMLCanvasElement, q: number) => new Promise<Blob | null>((res) => c.toBlob(res, 'image/jpeg', q));

// Adds JPEG comment segments (ignored by decoders) so the file reaches a minimum size.
async function padTo(blob: Blob, target: number): Promise<Blob> {
  if (blob.size >= target) return blob;
  const src = new Uint8Array(await blob.arrayBuffer());
  let at = 2;
  if (src[2] === 0xff && src[3] === 0xe0) at = 4 + ((src[4] << 8) | src[5]);
  const parts: Uint8Array[] = [src.slice(0, at)];
  let need = target - src.length;
  while (need > 0) {
    const data = Math.min(65533, Math.max(1, need - 4));
    const seg = new Uint8Array(4 + data);
    seg[0] = 0xff; seg[1] = 0xfe; seg[2] = ((data + 2) >> 8) & 0xff; seg[3] = (data + 2) & 0xff;
    parts.push(seg);
    need -= seg.length;
  }
  parts.push(src.slice(at));
  return new Blob(parts as BlobPart[], { type: 'image/jpeg' });
}

export default function PhotoResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState('photo');
  const [w, setW] = useState('200');
  const [h, setH] = useState('230');
  const [minKb, setMinKb] = useState('20');
  const [maxKb, setMaxKb] = useState('50');
  const [mode, setMode] = useState('cover');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; bytes: number; width: number; height: number } | null>(null);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const pick = (value: string) => {
    setPreset(value);
    const p = PRESETS.find((x) => x.value === value);
    if (p && value !== 'custom') { setW(p.w); setH(p.h); setMinKb(p.min); setMaxKb(p.max); }
  };

  const run = async () => {
    setError(''); setResult(null);
    const W = Math.round(Number(w)), H = Math.round(Number(h)), min = Number(minKb) || 0, max = Number(maxKb);
    if (!file) { setError('Choose an image first.'); return; }
    if (!(W >= 20 && W <= 4000 && H >= 20 && H <= 4000)) { setError('Width and height must be between 20 and 4000 pixels.'); return; }
    if (!(max > 0) || min > max) { setError('Enter a maximum size in KB, and a minimum that is not above it.'); return; }
    if (!file.type.startsWith('image/')) { setError('That file is not an image.'); return; }
    setBusy(true);
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setError('Your browser cannot process images.'); return; }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      const scale = mode === 'cover' ? Math.max(W / bmp.width, H / bmp.height) : Math.min(W / bmp.width, H / bmp.height);
      const dw = bmp.width * scale, dh = bmp.height * scale;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bmp, (W - dw) / 2, (H - dh) / 2, dw, dh);

      const limit = Math.floor(max * 1024 * 0.99);
      let best = await toBlob(canvas, 1);
      if (best && best.size > limit) {
        const lowest = await toBlob(canvas, 0.05);
        if (!lowest || lowest.size > limit) { setError('Even at the lowest quality this size is too big for ' + max + ' KB. Use smaller pixel dimensions or a larger limit.'); return; }
        let lo = 0.05, hi = 1; best = lowest;
        for (let i = 0; i < 9; i++) {
          const mid = (lo + hi) / 2;
          const b = await toBlob(canvas, mid);
          if (b && b.size <= limit) { best = b; lo = mid; } else hi = mid;
        }
      }
      if (!best) { setError('Could not create the image.'); return; }
      const finalBlob = min > 0 ? await padTo(best, Math.ceil(min * 1024 * 1.02)) : best;
      if (finalBlob.size > max * 1024 || finalBlob.size < min * 1024) { setError('Could not reach the size range. Adjust the limits and try again.'); return; }
      setResult({ url: URL.createObjectURL(finalBlob), bytes: finalBlob.size, width: W, height: H });
    } catch { setError('Could not read that image. Try a JPG or PNG.'); } finally { setBusy(false); }
  };

  const field = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
  const label = 'mb-1 block text-xs font-medium text-neutral-600';
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Photo and signature resizer</h1>
        <p className="mt-1 text-sm text-neutral-600">Get your image to the exact pixels and file size an application form asks for. It runs in your browser, so your photo is never uploaded.</p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">The presets are only common examples. Use the width, height and size limits written in your own notice.</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div><label className={label}>Your image (JPG, PNG or WebP)</label><input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} className="block text-sm" /></div>
        <div><label className={label}>Size</label><Select value={preset} onChange={pick} options={PRESETS.map((p) => ({ value: p.value, label: p.label }))} /></div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div><label className={label}>Width (px)</label><input type="number" value={w} onChange={(e) => { setW(e.target.value); setPreset('custom'); }} className={field} /></div>
          <div><label className={label}>Height (px)</label><input type="number" value={h} onChange={(e) => { setH(e.target.value); setPreset('custom'); }} className={field} /></div>
          <div><label className={label}>Minimum size (KB)</label><input type="number" value={minKb} onChange={(e) => { setMinKb(e.target.value); setPreset('custom'); }} className={field} /></div>
          <div><label className={label}>Maximum size (KB)</label><input type="number" value={maxKb} onChange={(e) => { setMaxKb(e.target.value); setPreset('custom'); }} className={field} /></div>
        </div>
        <div><label className={label}>If the shape differs</label><Select value={mode} onChange={setMode} options={[{ value: 'cover', label: 'Crop to fill the frame' }, { value: 'contain', label: 'Keep the whole image, add white borders' }]} /></div>
        <Button type="button" variant="primary" disabled={busy || !file} onClick={run}>{busy ? 'Working...' : 'Resize'}</Button>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </section>

      {result && (
        <section className="rounded-2xl border border-green-200 bg-green-50/40 p-5" aria-live="polite">
          <p className="text-sm font-semibold text-green-800">Ready: {result.width} x {result.height} px, {(result.bytes / 1024).toFixed(1)} KB (checked against your limits)</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Resized preview" width={result.width} height={result.height} className="mt-3 max-w-full rounded border border-neutral-200 bg-white" style={{ imageRendering: 'auto' }} />
          <a href={result.url} download={'resized-' + result.width + 'x' + result.height + '.jpg'} className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Download</a>
          <p className="mt-2 text-2xs text-neutral-500">Some forms count a KB as 1000 bytes, others as 1024. Keep a little room inside your limits if the form is strict.</p>
        </section>
      )}
    </div>
  );
}
