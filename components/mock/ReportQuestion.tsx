"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";

const REASONS = [
  { value: "NO_CORRECT_OPTION", label: "None of the options is correct" },
  { value: "WRONG_ANSWER", label: "The marked answer is wrong" },
  { value: "ANOTHER_ALSO_CORRECT", label: "Another option is also correct" },
  { value: "TYPO", label: "Spelling or wording mistake" },
  { value: "UNCLEAR", label: "The question is unclear" },
  { value: "OTHER", label: "Something else" },
];

// A small "Report a problem" form for one question. Needs the question's id, text and options.
export default function ReportQuestion({ questionId, text, options, correctIndex }: { questionId: string; text: string; options: string[]; correctIndex?: number }) {
  const { user, isLoggedIn } = useAuth();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!isLoggedIn || !user?.id) return null;

  const send = async () => {
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/users/" + user.id + "/question-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, reason, comment, text, options, ...(typeof correctIndex === "number" ? { correctIndex } : {}) }) });
      const d = await res.json().catch(() => ({}));
      setMsg(d.message ?? (res.ok ? "Thank you." : "Could not send."));
      if (res.ok) { setReason(""); setComment(""); }
    } catch { setMsg("Network error. Please try again."); } finally { setBusy(false); }
  };
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer select-none text-neutral-600 hover:text-neutral-900">Report a problem with this question</summary>
      <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-md border border-neutral-200 px-2 py-1.5" aria-label="What is wrong">
          <option value="">What is wrong?</option>
          {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={500} placeholder="Details (optional)" className="w-full rounded-md border border-neutral-200 px-2 py-1.5" />
        <button type="button" disabled={!reason || busy} onClick={send} className="rounded-md bg-primary-600 px-3 py-1.5 font-semibold text-white disabled:opacity-50">{busy ? "Sending..." : "Send report"}</button>
        {msg && <p role="status" className="text-neutral-700">{msg}</p>}
      </div>
    </details>
  );
}
