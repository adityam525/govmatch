"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface Row {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
  readMinutes: number;
}

type Filter = "all" | "draft" | "published";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

export default function AdminBlogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not load posts.");
      }

      setRows(data);
      setError("");
    } catch {
      setError("Could not load the posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, request: () => Promise<Response>) => {
    setBusy(id);
    setError("");

    try {
      const res = await request();
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "That did not work.");
        return;
      }

      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const counts = {
    all: rows.length,
    draft: rows.filter((r) => !r.published).length,
    published: rows.filter((r) => r.published).length,
  };

  const shown = rows.filter((r) =>
    filter === "all" ? true : filter === "draft" ? !r.published : r.published,
  );

  const scheduled = (r: Row) =>
    r.published && r.publishedAt && new Date(r.publishedAt) > new Date();

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">Blog</h1>

        <Link href="/admin/blog/new">
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>
            New post
          </Button>
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "draft", "published"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize ${
              filter === f
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {f}{" "}
            <span className={filter === f ? "opacity-80" : "text-neutral-400"}>
              ({counts[f]})
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-600">
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Updated</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-400">
                  Loading...
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-400">
                  No posts here yet.
                </td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-50 hover:bg-neutral-50"
                >
                  <td className="max-w-md px-4 py-3">
                    <Link
                      href={`/admin/blog/${r.id}`}
                      className="block truncate font-medium text-neutral-900 hover:text-primary-700"
                    >
                      {r.title}
                    </Link>

                    <p className="truncate text-xs text-neutral-500">
                      /blog/{r.slug}
                      {r.tags.length ? ` · ${r.tags.join(", ")}` : ""} ·{" "}
                      {r.readMinutes} min
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        scheduled(r)
                          ? "bg-sky-50 text-sky-700"
                          : r.published
                            ? "bg-green-50 text-success"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {scheduled(r)
                        ? "Scheduled"
                        : r.published
                          ? "Published"
                          : "Draft"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-neutral-600">
                    {fmt(r.updatedAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() =>
                          act(r.id, () =>
                            fetch(`/api/admin/blog/${r.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                published: !r.published,
                              }),
                            }),
                          )
                        }
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {busy === r.id
                          ? "..."
                          : r.published
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      {r.published && (
                        <a
                          href={`/blog/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="View live"
                          className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}

                      <Link
                        href={`/admin/blog/${r.id}`}
                        aria-label={`Edit ${r.title}`}
                        className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        <Pencil size={14} />
                      </Link>

                      <button
                        type="button"
                        disabled={busy !== null}
                        aria-label={`Delete ${r.title}`}
                        onClick={() => {
                          if (confirm(`Delete "${r.title}" permanently?`)) {
                            void act(r.id, () =>
                              fetch(`/api/admin/blog/${r.id}`, {
                                method: "DELETE",
                              }),
                            );
                          }
                        }}
                        className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
