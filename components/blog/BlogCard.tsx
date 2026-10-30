import Link from "next/link";
import type { BlogCardData } from "@/lib/blog";

export const blogDate = (d: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";

export default function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="aspect-[16/9] w-full bg-gradient-to-br from-primary-100 via-primary-50 to-white"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        {post.tags[0] && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">
            {post.tags[0]}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-neutral-900 group-hover:text-primary-700">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
          {post.excerpt}
        </p>
        <p className="mt-auto pt-4 text-xs text-neutral-500">
          {blogDate(post.publishedAt)} · {post.readMinutes} min read
        </p>
      </div>
    </article>
  );
}
