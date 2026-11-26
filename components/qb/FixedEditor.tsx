"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { validateFixed } from "@/lib/qb/fixed";

const input = "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";

// Edits a fixed-text question: text, four or five options, the right one, and the explanation.
export default function FixedEditor({ row, id }: { row: any; id: string }) {
  const router = useRouter();
  const f = row.definition.fixed;
  const ordered = f.ordered === true;
  const count = Array.isArray(f.options) && f.options.length === 5 ? 5 : 4;
  const [title, setTitle] = useState<string>(row.title);
  const [difficulty, setDifficulty] = useState<string>(row.difficulty);
  const [text, setText] = useState<string>(f.text ?? "");
  const [options, setOptions] = useState<string[]>(Array.from({ length: count }, (_, i) => f.options?.[i] ?? ""));
  const [correct, setCorrect] = useState<number>(Number.isInteger(f.correctIndex) ? f.correctIndex : 0);
  const [explanation, setExplanation] = useState<string>(f.explanation ?? "");
  const [source, setSource] = useState<string>(f.source ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fixed = () => ({
    text, options, correctIndex: correct, explanation,
    ...(source.trim() ? { source } : {}),
    ...(ordered ? { ordered: true } : {}),
  });
  const problems = validateFixed(fixed());

  const save = async (publish: boolean) => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/qb-templates/" + id, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug: row.slug, topicId: row.topic.id, organizationId: row.organizationId ?? "", examId: row.examId ?? "",
          difficulty, expectedSeconds: row.expectedSeconds, definition: { fixed: fixed() }, published: publish,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? "Could not save."); return; }
      router.push("/admin/question-bank");
    } catch { setError("Network error. Nothing was saved."); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-bold text-neutral-900">Edit fixed question</h1>
      <p className="text-sm text-neutral-600">
        Topic: {row.topic?.name ?? "-"}. {ordered ? "The options always appear in this order." : "The options appear in the order shown."}
      </p>
      <div><label className="mb-1 block text-xs font-medium text-neutral-600">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={input} /></div>
      <div><label className="mb-1 block text-xs font-medium text-neutral-600">Difficulty</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={input}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
      <div><label className="mb-1 block text-xs font-medium text-neutral-600">Question</label><textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={input} /></div>
      <fieldset className="space-y-2"><legend className="mb-1 text-xs font-medium text-neutral-600">Options (select the correct one)</legend>
        {options.map((o, i) => (
          <label key={i} className="flex items-center gap-2">
            <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} className="accent-primary-600" aria-label={"Option " + (i + 1) + " is correct"} />
            <input value={o} onChange={(e) => setOptions(options.map((x, k) => (k === i ? e.target.value : x)))} className={input} placeholder={"Option " + (i + 1)} />
          </label>
        ))}
      </fieldset>
      <div><label className="mb-1 block text-xs font-medium text-neutral-600">Explanation</label><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={4} className={input} /></div>
      <div><label className="mb-1 block text-xs font-medium text-neutral-600">Source note (never shown to learners)</label><input value={source} onChange={(e) => setSource(e.target.value)} className={input} /></div>
      {problems.length > 0 && <ul className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={busy} onClick={() => save(false)}>Save as draft</Button>
        <Button type="button" variant="primary" disabled={busy || problems.length > 0} onClick={() => save(true)}>Save and publish</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => router.push("/admin/question-bank")}>Cancel</Button>
      </div>
    </div>
  );
}
