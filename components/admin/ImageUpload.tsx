'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import OrgLogo from '@/components/shared/OrgLogo';

// Uploads to /api/admin/upload and hands back the stored URL. A URL typed or pasted by hand
// still works. Keep `slug` stable so the stored file names stay readable.
export default function ImageUpload({
  value,
  onChange,
  folder,
  slug,
  name,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: 'organizations' | 'states';
  slug: string;
  name: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      form.append('slug', slug || name || 'logo');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? 'Upload failed.');
        return;
      }
      onChange(data.url);
    } catch {
      setError('Network error. The image was not uploaded.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <OrgLogo name={name || 'Logo'} logoUrl={value || null} size={64} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            <ImagePlus size={15} />
            {busy ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-red-50 hover:text-danger"
            >
              <X size={14} /> Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className="mt-2 w-full rounded-md border border-neutral-200 px-3 py-2 text-xs text-neutral-600 outline-none focus:border-primary-500"
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <p className="mt-1.5 text-[11px] text-neutral-500">PNG, JPG, WebP or SVG, up to 1.5 MB. Square or near-square works best.</p>
    </div>
  );
}
