'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import RichTextEditor from './RichTextEditor';

interface FormState {
  title: string; slug: string; excerpt: string; content: string;
  coverImageUrl: string; coverImageAlt: string; authorName: string; tags: string;
  metaTitle: string; metaDescription: string; publishedAt: string; published: boolean;
}

const EMPTY: FormState = {
  title: '', slug: '', excerpt: '', content: '', coverImageUrl: '', coverImageAlt: '',
  authorName: 'GovMatch Team', tags: '', metaTitle: '', metaDescription: '', publishedAt: '', published: false,
};

const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1.5 block text-xs font-medium text-neutral-600';
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/^https?:\/\//, '') || 'govmatch.in';

// Shows how many characters are used, turning amber near the limit and red over it.
function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return <span className={`text-[11px] ${n > max ? 'text-danger' : n > max * 0.9 ? 'text-amber-600' : 'text-neutral-400'}`}>{n}/{max}</span>;
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function BlogForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!!postId);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(!!postId);
  const snapshot = useRef(JSON.stringify(EMPTY));

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/blog/${postId}`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((p) => {
        const next: FormState = {
          title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', content: p.content ?? '',
          coverImageUrl: p.coverImageUrl ?? '', coverImageAlt: p.coverImageAlt ?? '', authorName: p.authorName ?? '',
          tags: (p.tags ?? []).join(', '), metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
          publishedAt: toLocalInput(p.publishedAt), published: !!p.published,
        };
        setForm(next);
        snapshot.current = JSON.stringify(next);
      })
      .catch(() => setLoadError('This post could not be loaded. Reload the page to try again. Nothing was changed.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const dirty = !loading && JSON.stringify(form) !== snapshot.current;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (patch: Partial<FormState>) => { setForm((f) => ({ ...f, ...patch })); setError(''); };

  const save = async (published: boolean) => {
    setBusy(published ? 'publish' : 'save'); setError('');
    try {
      const body = {
        ...form,
        published,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      };
      const res = await fetch(postId ? `/api/admin/blog/${postId}` : '/api/admin/blog', {
        method: postId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not save the post.'); return; }
      snapshot.current = JSON.stringify(form);
      router.push('/admin/blog');
    } catch {
      setError('Network error. Nothing was saved.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!postId || !confirm('Delete this post permanently?')) return;
    setBusy('delete');
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' });
      if (!res.ok) { setError('Could not delete the post.'); return; }
      snapshot.current = JSON.stringify(form);
      router.push('/admin/blog');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-6 text-sm text-neutral-600">Loading...</div>;
  if (loadError) return <div className="m-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-danger">{loadError}</div>;

  const previewTitle = form.metaTitle || form.title || 'Your article title';
  const previewDesc = form.metaDescription || form.excerpt || 'Your article summary will appear here.';
  const previewSlug = form.slug || slugify(form.title) || 'your-article';

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">{postId ? 'Edit post' : 'New post'}</h1>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${form.published ? 'bg-green-50 text-success' : 'bg-amber-50 text-amber-700'}`}>
            {form.published ? 'Published' : 'Draft'}
          </span>
        </div>
        {postId && (
          <button type="button" onClick={remove} disabled={!!busy} className="flex items-center gap-1.5 text-xs text-danger hover:underline disabled:opacity-50">
            <Trash2 size={14} /> Delete post
          </button>
        )}
      </header>

      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <label className={label}>Title *</label>
          <input
            value={form.title}
            maxLength={160}
            onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
            className={`${input} text-base font-semibold`}
            placeholder="A clear, specific headline"
          />
          <div className="mt-4">
            <label className={label}>Content *</label>
            <RichTextEditor value={form.content} onChange={(content) => set({ content })} />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-neutral-900">Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between"><label className={label}>Summary</label><Counter value={form.excerpt} max={300} /></div>
              <textarea value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={2} className={input} placeholder="One or two sentences shown on cards. Leave empty to use the start of the article." />
            </div>
            <div>
              <label className={label}>Address (slug)</label>
              <input value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} className={input} placeholder="how-to-prepare-for-ssc" />
              {postId && form.published && <p className="mt-1 text-[11px] text-amber-700">Changing the address of a published post breaks links to it.</p>}
            </div>
            <div>
              <label className={label}>Author</label>
              <input value={form.authorName} maxLength={80} onChange={(e) => set({ authorName: e.target.value })} className={input} />
            </div>
            <div>
              <label className={label}>Tags (comma separated, up to 8)</label>
              <input value={form.tags} onChange={(e) => set({ tags: e.target.value })} className={input} placeholder="Exam tips, SSC" />
            </div>
            <div>
              <label className={label}>Publish date and time</label>
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} className={input} />
              <p className="mt-1 text-[11px] text-neutral-500">Optional. A future date schedules the post. Empty means now.</p>
            </div>
            <div className="md:col-span-2">
              <label className={label}>Cover image address</label>
              <input value={form.coverImageUrl} onChange={(e) => set({ coverImageUrl: e.target.value })} className={input} placeholder="https://" />
            </div>
            {form.coverImageUrl && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between"><label className={label}>Cover image description (alt text)</label><Counter value={form.coverImageAlt} max={160} /></div>
                <input value={form.coverImageAlt} onChange={(e) => set({ coverImageAlt: e.target.value })} className={input} placeholder="What the picture shows" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImageUrl} alt="" className="mt-3 aspect-[16/9] w-full max-w-sm rounded-lg object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900">Search appearance (SEO)</h2>
          <p className="mb-4 mt-1 text-xs text-neutral-500">Optional. Empty fields fall back to the title and summary.</p>
          <div className="mb-5 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="truncate text-xs text-neutral-500">{SITE} › blog › {previewSlug}</p>
            <p className="mt-0.5 truncate text-base text-blue-700">{previewTitle.slice(0, 60)}{previewTitle.length > 60 ? '...' : ''}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{previewDesc.slice(0, 160)}{previewDesc.length > 160 ? '...' : ''}</p>
          </div>
          <div className="grid gap-4">
            <div>
              <div className="flex items-center justify-between"><label className={label}>SEO title</label><Counter value={form.metaTitle} max={70} /></div>
              <input value={form.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} className={input} placeholder={form.title || 'Defaults to the title'} />
            </div>
            <div>
              <div className="flex items-centestify-between"><label className={label}>SEO description</label><Counter value={form.metaDescription} max={170} /></div>
              <textarea value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} rows={2} className={input} placeholder="Defaults to the summary" />
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" disabled={!!busy} onClick={() => { if (!dirty || confirm('Leave without saving your changes?')) { snapshot.current = JSON.stringify(form); router.push('/admin/blog'); } }}>Cancel</Button>
          <Button type="button" variant="secondary" disabled={!!busy} onClick={() => save(form.published)}>
            {busy === 'save' ? 'Saving...' : form.published ? 'Save changes' : 'Save draft'}
          </Button>
          {form.published ? (
            <Button type="button" variant="secondary" disabled={!!busy} onClick={() => save(false)}>Unpublish</Button>
          ) : (
            <Button type="button" variant="primary" disabled={!!busy} onClick={() => save(true)}>
              {busy === 'publish' ? 'Publishing...' : 'Publish'}
            </Button>
          )}
          {dirty && !error && <span className="text-xs text-amber-700">Unsaved changes</span>}
        </div>
      </div>
      <div className="h-6" />
    </form>
  );
}
