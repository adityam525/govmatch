"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Circle, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import FilterDropdown from "@/components/ui/FilterDropdown";
import LinksFieldArray from "@/components/admin/LinksFieldArray";
import FAQsFieldArray from "@/components/admin/FAQsFieldArray";
import PostsFieldArray from "@/components/admin/PostsFieldArray";
import AdmitCardsFieldArray from "@/components/admin/AdmitCardsFieldArray";
import ResultsFieldArray from "@/components/admin/ResultsFieldArray";
import AnswerKeysFieldArray from "@/components/admin/AnswerKeysFieldArray";
import ExamLevelsFieldArray from "@/components/admin/ExamLevelsFieldArray";
import ApplicationFeeFieldArray from "@/components/admin/ApplicationFeeFieldArray";
import { adminApi } from "@/features/admin/api";
import ScheduleEditor, { standardRows } from "./ScheduleEditor";
import { emptyJob, jobProblem, loadJob, saveJob, type JobBasics, type JobData } from "./jobFormData";

interface OrgOption { id: string; name: string; website: string | null }
interface StateOption { id: string; name: string }
type Status = "required" | "check" | "done" | "optional";

const SELECTION_STEPS = ["Written Exam", "Skill Test", "Physical Test", "Document Verification", "Medical Examination", "Interview"];
const STATUS_OPTIONS = [
  { id: "LIVE", label: "Automatic (follows the dates)" },
  { id: "UPCOMING", label: "Announced, dates awaited" },
  { id: "CLOSED", label: "Closed by hand" },
  { id: "CANCELLED", label: "Cancelled" },
];
const inputClass = "w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500";

const initialData = (mode: "create" | "edit"): JobData => ({ ...emptyJob(), schedule: mode === "create" ? standardRows() : [] });
const serialize = (data: JobData) => JSON.stringify(data, (key, value) => (key === "key" ? undefined : value));

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-600">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionIndex({ items }: { items: { id: string; label: string; status: Status }[] }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const icon = (s: Status) =>
    s === "done" ? <CheckCircle2 size={14} className="shrink-0 text-green-600" />
    : s === "optional" ? <Circle size={14} className="shrink-0 text-neutral-300" />
    : <AlertCircle size={14} className="shrink-0 text-amber-500" />;

  return (
    <>
      <nav aria-label="Job sections" className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Sections</p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => go(item.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-neutral-700 hover:bg-white">
                {icon(item.status)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {(item.status === "required" || item.status === "check") && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    {item.status === "required" ? "Needed" : "Check"}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => go(item.id)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700">
            {icon(item.status)}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

interface JobFormProps {
  mode: "create" | "edit";
  jobId?: string;
}

export default function JobForm({ mode, jobId }: JobFormProps) {
  const router = useRouter();
  const [data, setData] = useState<JobData>(() => initialData(mode));
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [linkTouched, setLinkTouched] = useState(mode === "edit");
  const [stateTouched, setStateTouched] = useState(mode === "edit");
  const snapshot = useRef(serialize(initialData(mode)));
  const created = useRef<string | null>(null);

  useEffect(() => {
    adminApi.list<OrgOption>("organizations").then(setOrganizations).catch(() => {});
    fetch("/api/states").then((r) => r.json()).then((d) => setStates(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !jobId) return;
    let cancelled = false;
    loadJob(jobId)
      .then((loaded) => {
        if (cancelled) return;
        setData(loaded);
        snapshot.current = serialize(loaded);
      })
      .catch(() => !cancelled && setLoadError("This job could not be loaded completely, so it is not shown. Reloading the page usually fixes it. Nothing was changed."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [mode, jobId]);

  const dirty = !loading && serialize(data) !== snapshot.current;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = (p: Partial<JobData>) => { setData((d) => ({ ...d, ...p })); setError(""); };
  const setBasics = (p: Partial<JobBasics>) => { setData((d) => ({ ...d, basics: { ...d.basics, ...p } })); setError(""); };
  const b = data.basics;

  const chooseOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    const next: Partial<JobBasics> = { organizationId: orgId };
    if (!linkTouched && org?.website) next.officialLink = org.website;
    if (!stateTouched && org) {
      const match = states.find((s) => org.name.toLowerCase().includes(s.name.toLowerCase()));
      if (match) next.stateId = match.id;
    }
    setBasics(next);
  };

  const run = async (action: "save" | "publish" | "unpublish") => {
    const problem = jobProblem(data);
    if (problem) { setError(problem); return; }
    setBusy(action);
    setError("");
    try {
      await saveJob({ jobId, data, published: action === "publish" ? true : action === "unpublish" ? false : b.published, created });
      snapshot.current = serialize(data);
      router.push("/admin/notifications");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not save. Please try again.");
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!jobId || !confirm("Permanently delete this job? This cannot be undone.")) return;
    setBusy("delete");
    try {
      await adminApi.remove("notifications", jobId);
      snapshot.current = serialize(data);
      router.push("/admin/notifications");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not delete.");
      setBusy(null);
    }
  };

  const cancel = () => {
    if (dirty && !confirm("Leave without saving your changes?")) return;
    snapshot.current = serialize(data);
    router.push("/admin/notifications");
  };

  if (loading) return <div className="p-6 text-sm text-neutral-600">Loading...</div>;
  if (loadError) return <div className="m-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-danger">{loadError}</div>;

  const hasClose = data.schedule.some((r) => r.kind === "APPLICATION_CLOSE" && r.day);
  const sections: { id: string; label: string; status: Status }[] = [
    { id: "basics", label: "Basics", status: b.title.trim() && b.organizationId && b.officialLink.trim() ? "done" : "required" },
    { id: "dates", label: "Dates and times", status: hasClose ? "done" : "check" },
    { id: "posts", label: "Posts and eligibility", status: data.posts.some((p) => p.title) || b.directEligibility.trim() ? "done" : "check" },
    { id: "fees", label: "Fees and process", status: data.fees.length || data.steps.length || b.howToApply.trim() ? "done" : "optional" },
    { id: "stages", label: "Exam stages", status: data.examLevels.length || data.admitCards.length || data.results.length || data.answerKeys.length ? "done" : "optional" },
    { id: "links", label: "Links and FAQs", status: data.links.length || data.faqs.length ? "done" : "optional" },
  ];

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-neutral-900">{mode === "create" ? "Add job" : "Edit job"}</h1>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-neutral-500">
            <span className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${b.published ? "bg-green-50 text-success" : "bg-amber-50 text-amber-700"}`}>
              {b.published ? "Published" : "Draft"}
            </span>
            {b.title && <span className="truncate">{b.title}</span>}
          </p>
        </div>
        {mode === "edit" && (
          <button type="button" onClick={remove} disabled={!!busy} className="flex items-center gap-1.5 text-xs text-danger hover:underline disabled:opacity-50">
            <Trash2 size={14} /> Delete job
          </button>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <SectionIndex items={sections} />

        <div className="min-w-0 space-y-6">
          <Section id="basics" title="Basics">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Title *</label>
                <input value={b.title} onChange={(e) => setBasics({ title: e.target.value })} className={inputClass} placeholder="e.g. SSC CGL 2026" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Organization *</label>
                <FilterDropdown
                  label="Select organization"
                  options={organizations.map((o) => ({ id: o.id, label: o.name }))}
                  selected={b.organizationId ? [b.organizationId] : []}
                  onChange={(ids) => chooseOrganization(ids[0] ?? "")}
                  multi={false}
                  widthClass="w-full"
                  allowCreate
                  onCreate={async (name) => {
                    const res = await fetch("/api/organizations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, shortName: name.slice(0, 20) }),
                    });
                    const made = await res.json();
                    if (!res.ok) return null;
                    setOrganizations((prev) => [...prev, made]);
                    return { id: made.id, label: made.name };
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Official link *</label>
                <input
                  value={b.officialLink}
                  onChange={(e) => { setBasics({ officialLink: e.target.value }); setLinkTouched(true); }}
                  className={inputClass}
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">State</label>
                <FilterDropdown
                  label="All India"
                  options={states.map((s) => ({ id: s.id, label: s.name }))}
                  selected={b.stateId ? [b.stateId] : []}
                  onChange={(ids) => { setBasics({ stateId: ids[0] ?? "" }); setStateTouched(true); }}
                  multi={false}
                  allowClear
                  widthClass="w-full"
                  allowCreate
                  onCreate={async (name) => {
                    const code = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
                    if (code.length < 2) return null;
                    const res = await fetch("/api/states", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, code }),
                    });
                    const made = await res.json();
                    if (!res.ok) return null;
                    setStates((prev) => [...prev, made]);
                    return { id: made.id, label: made.name };
                  }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Application mode</label>
                <FilterDropdown
                  label="Select mode"
                  options={[{ id: "ONLINE", label: "Online" }, { id: "OFFLINE", label: "Offline" }, { id: "BOTH", label: "Both" }]}
                  selected={[b.applicationMode]}
                  onChange={(ids) => setBasics({ applicationMode: ids[0] ?? "ONLINE" })}
                  multi={false}
                  searchable={false}
                  widthClass="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Status</label>
                <FilterDropdown
                  label="Select status"
                  options={STATUS_OPTIONS}
                  selected={[b.status]}
                  onChange={(ids) => setBasics({ status: ids[0] ?? "LIVE" })}
                  multi={false}
                  searchable={false}
                  widthClass="w-full"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Automatic is right for almost every job: it is Upcoming before applications open, Live after, and Closed once a final result is added. Use the others only to override.
                </p>
              </div>
            </div>
          </Section>

          <Section id="dates" title="Dates and times" hint="Every date for this job in one place, each with an optional time. Postponements keep a history that users can see.">
            <ScheduleEditor rows={data.schedule} onChange={(schedule) => patch({ schedule })} />
          </Section>

          <Section id="posts" title="Posts and eligibility">
            <div className="grid gap-5 md:grid-cols-2">
              <PostsFieldArray posts={data.posts} onChange={(posts) => patch({ posts })} />
              <div className="md:col-span-2 border-t border-neutral-100 pt-4">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  General eligibility (only for jobs with no specific posts, such as a qualifying exam like PET or CET)
                </label>
                <textarea
                  value={b.directEligibility}
                  onChange={(e) => setBasics({ directEligibility: e.target.value })}
                  rows={2}
                  placeholder="e.g. Class 10th pass or equivalent from a recognised board"
                  className={inputClass}
                />
              </div>
            </div>
          </Section>

          <Section id="fees" title="Fees and process">
            <div className="grid gap-5 md:grid-cols-2">
              <ApplicationFeeFieldArray fees={data.fees} onChange={(fees) => patch({ fees })} />

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Selection process</label>
                <div className="flex flex-wrap gap-2">
                  {SELECTION_STEPS.map((step) => {
                    const on = data.steps.includes(step);
                    return (
                      <button
                        key={step}
                        type="button"
                        aria-pressed={on}
                        onClick={() => patch({ steps: on ? data.steps.filter((s) => s !== step) : [...data.steps, step] })}
                        className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary-600 bg-primary-600 text-white" : "border-neutral-200 bg-white text-neutral-600"}`}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">How to apply (notes)</label>
                <textarea value={b.howToApply} onChange={(e) => setBasics({ howToApply: e.target.value })} rows={3} className={inputClass} />
              </div>
            </div>
          </Section>

          <Section id="stages" title="Exam stages" hint="Add stages such as Prelims and Mains, then attach admit cards, results and answer keys to them.">
            <div className="grid gap-5 md:grid-cols-2">
              <ExamLevelsFieldArray levels={data.examLevels} onChange={(examLevels) => patch({ examLevels })} />
              <AdmitCardsFieldArray items={data.admitCards} onChange={(admitCards) => patch({ admitCards })} examLevels={data.examLevels} />
              <ResultsFieldArray items={data.results} onChange={(results) => patch({ results })} examLevels={data.examLevels} />
              <AnswerKeysFieldArray items={data.answerKeys} onChange={(answerKeys) => patch({ answerKeys })} examLevels={data.examLevels} />
            </div>
          </Section>

          <Section id="links" title="Links and FAQs">
            <div className="grid gap-5 md:grid-cols-2">
              <LinksFieldArray links={data.links} onChange={(links) => patch({ links })} />
              <FAQsFieldArray faqs={data.faqs} onChange={(faqs) => patch({ faqs })} />
            </div>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={cancel} disabled={!!busy}>Cancel</Button>
          <Button type="button" variant="secondary" onClick={() => run("save")} disabled={!!busy}>
            {busy === "save" ? "Saving..." : b.published ? "Save changes" : "Save draft"}
          </Button>
          {b.published ? (
            <Button type="button" variant="secondary" onClick={() => run("unpublish")} disabled={!!busy}>
              {busy === "unpublish" ? "Unpublishing..." : "Unpublish"}
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={() => run("publish")} disabled={!!busy}>
              {busy === "publish" ? "Publishing..." : "Publish"}
            </Button>
          )}
          {dirty && !error && <span className="text-xs text-amber-700">Unsaved changes</span>}
        </div>
      </div>
      <div className="h-6" />
    </form>
  );
}
