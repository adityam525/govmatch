"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/features/admin/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LinksFieldArray, { LinkDraft } from "@/components/admin/LinksFieldArray";
import ImportantDatesFieldArray, {
  DateDraft,
} from "@/components/admin/ImportantDatesFieldArray";
import FAQsFieldArray, { FAQDraft } from "@/components/admin/FAQsFieldArray";
import PostsFieldArray, { PostDraft } from "@/components/admin/PostsFieldArray";
import AdmitCardsFieldArray, {
  AdmitCardDraft,
} from "@/components/admin/AdmitCardsFieldArray";
import ResultsFieldArray, {
  ResultDraft,
} from "@/components/admin/ResultsFieldArray";
import AnswerKeysFieldArray, {
  AnswerKeyDraft,
} from "@/components/admin/AnswerKeysFieldArray";
import ExamLevelsFieldArray, {
  ExamLevelDraft,
} from "@/components/admin/ExamLevelsFieldArray";
import ApplicationFeeFieldArray, {
  ApplicationFeeDraft,
} from "@/components/admin/ApplicationFeeFieldArray";
import { validateNotificationDates } from "@/features/jobs/validation";
import { Trash2 } from "lucide-react";

interface OrgOption {
  id: string;
  name: string;
  categoryId: string | null;
  website: string | null;
}
interface StateOption {
  id: string;
  name: string;
}

const SELECTION_STEPS = [
  "Written Exam",
  "Skill Test",
  "Physical Test",
  "Document Verification",
  "Medical Examination",
  "Interview",
];
const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  organizationId: "",
  officialLink: "",
  stateId: "",
  status: "LIVE",
  applicationMode: "ONLINE",
  notificationDate: today,
  applicationStartDate: today,
  applicationEndDate: today,
  examDate: today,
  published: false,
  howToApply: "",
};

async function syncCollection<T extends Record<string, any>>(
  entity: string,
  notificationId: string,
  items: T[],
  isValid: (item: T) => boolean,
) {
  const existing = await fetch(
    `/api/${entity}?notificationId=${notificationId}`,
  ).then((r) => r.json());
  if (Array.isArray(existing)) {
    await Promise.all(existing.map((e: any) => adminApi.remove(entity, e.id)));
  }
  await Promise.all(
    items.filter(isValid).map((item, i) => {
      const { id, ...rest } = item as any;
      return adminApi.create(entity, { ...rest, notificationId, order: i });
    }),
  );
}

interface JobFormProps {
  mode: "create" | "edit";
  jobId?: string;
}

export default function JobForm({ mode, jobId }: JobFormProps) {
  const router = useRouter();

  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(mode === "edit");
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [importantDates, setImportantDates] = useState<DateDraft[]>([]);
  const [faqs, setFaqs] = useState<FAQDraft[]>([]);
  const [posts, setPosts] = useState<PostDraft[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCardDraft[]>([]);
  const [results, setResults] = useState<ResultDraft[]>([]);
  const [answerKeys, setAnswerKeys] = useState<AnswerKeyDraft[]>([]);
  const [examLevels, setExamLevels] = useState<ExamLevelDraft[]>([]);
  const [applicationFees, setApplicationFees] = useState<ApplicationFeeDraft[]>(
    [],
  );
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [officialLinkTouched, setOfficialLinkTouched] = useState(
    mode === "edit",
  );

  useEffect(() => {
    adminApi
      .list<OrgOption>("organizations")
      .then(setOrganizations)
      .catch(() => {});
    fetch("/api/states")
      .then((r) => r.json())
      .then(setStates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !jobId) return;

    adminApi
      .getById<any>("notifications", jobId)
      .then((data) => {
        setForm({
          title: data.title ?? "",
          organizationId: data.organizationId ?? "",
          officialLink: data.officialLink ?? "",
          stateId: (data.states ?? [])[0]?.id ?? "",
          status: data.status ?? "LIVE",
          applicationMode: data.applicationMode ?? "ONLINE",
          notificationDate: data.notificationDate
            ? data.notificationDate.slice(0, 10)
            : today,
          applicationStartDate: data.applicationStartDate
            ? data.applicationStartDate.slice(0, 10)
            : today,
          applicationEndDate: data.applicationEndDate
            ? data.applicationEndDate.slice(0, 10)
            : today,
          examDate: data.examDate ? data.examDate.slice(0, 10) : today,
          published: data.published ?? false,
          howToApply: data.howToApply ?? "",
        });
        setSelectedSteps(data.selectionProcess ?? []);
      })
      .catch(() => {});

    fetch(`/api/notification-links?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setLinks(
          Array.isArray(e)
            ? e.map((l: any) => ({
                label: l.label,
                url: l.url,
                linkType: l.linkType,
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/important-dates?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setImportantDates(
          Array.isArray(e)
            ? e.map((d: any) => ({
                id: d.id,
                label: d.label,
                date: d.date.slice(0, 10),
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/notification-faqs?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setFaqs(
          Array.isArray(e)
            ? e.map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/exam-levels?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setExamLevels(
          Array.isArray(e)
            ? e.map((l: any) => ({ id: l.id, name: l.name }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/application-fees?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setApplicationFees(
          Array.isArray(e)
            ? e.map((f: any) => ({
                id: f.id,
                categoryLabel: f.categoryLabel,
                amount: f.amount,
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/posts?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setPosts(
          Array.isArray(e)
            ? e.map((p: any) => ({
                id: p.id,
                title: p.title,
                vacancies: String(p.vacancies ?? ""),
                qualificationCategorySlug: "",
                qualificationId: p.qualificationId ?? "",
                branchIds: (p.branches ?? []).map((b: any) => b.id),
                minAge: p.minAge != null ? String(p.minAge) : "18",
                maxAge: p.maxAge != null ? String(p.maxAge) : "",
                payScale: p.payScale ?? "",
                employmentType: p.employmentType ?? "PERMANENT",
                roleId: (p.roles ?? [])[0]?.id ?? "",
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/admit-cards?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setAdmitCards(
          Array.isArray(e)
            ? e.map((a: any) => ({
                id: a.id,
                title: a.title,
                releaseDate: a.releaseDate ? a.releaseDate.slice(0, 10) : "",
                examDate: a.examDate ? a.examDate.slice(0, 10) : "",
                downloadLink: a.downloadLink ?? "",
                examLevelId: a.examLevelId ?? "",
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/results?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setResults(
          Array.isArray(e)
            ? e.map((r2: any) => ({
                id: r2.id,
                title: r2.title,
                resultType: r2.resultType ?? "FINAL",
                releaseDate: r2.releaseDate ? r2.releaseDate.slice(0, 10) : "",
                resultLink: r2.resultLink ?? "",
                examLevelId: r2.examLevelId ?? "",
              }))
            : [],
        ),
      )
      .catch(() => {});

    fetch(`/api/answer-keys?notificationId=${jobId}`)
      .then((r) => r.json())
      .then((e) =>
        setAnswerKeys(
          Array.isArray(e)
            ? e.map((k: any) => ({
                id: k.id,
                title: k.title,
                keyType: k.keyType ?? "PROVISIONAL",
                releaseDate: k.releaseDate ? k.releaseDate.slice(0, 10) : "",
                objectionEndDate: k.objectionEndDate
                  ? k.objectionEndDate.slice(0, 10)
                  : "",
                downloadLink: k.downloadLink ?? "",
                examLevelId: k.examLevelId ?? "",
              }))
            : [],
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [mode, jobId]);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    setFormError("");
  };

  const handleOrganizationChange = (orgId: string) => {
    updateField("organizationId", orgId);
    if (!officialLinkTouched) {
      const org = organizations.find((o) => o.id === orgId);
      if (org?.website) {
        setForm((prev: any) => ({ ...prev, officialLink: org.website }));
      }
    }
  };

  const toggleStep = (step: string) => {
    setSelectedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step],
    );
  };

  const saveNestedCollections = async (notificationId: string) => {
    await syncCollection(
      "notification-links",
      notificationId,
      links,
      (l) => !!l.url,
    );
    await syncCollection(
      "important-dates",
      notificationId,
      importantDates,
      (d) => !!d.label && !!d.date,
    );
    await syncCollection(
      "notification-faqs",
      notificationId,
      faqs,
      (f) => !!f.question && !!f.answer,
    );
    await syncCollection(
      "admit-cards",
      notificationId,
      admitCards,
      (a) => !!a.title && !!a.downloadLink,
    );
    await syncCollection(
      "results",
      notificationId,
      results,
      (r) => !!r.title && !!r.resultLink,
    );
    await syncCollection(
      "answer-keys",
      notificationId,
      answerKeys,
      (k) => !!k.title && !!k.downloadLink,
    );
    await syncCollection(
      "application-fees",
      notificationId,
      applicationFees,
      (f) => !!f.categoryLabel && !!f.amount,
    );

    const existingLevels = await fetch(
      `/api/exam-levels?notificationId=${notificationId}`,
    ).then((r) => r.json());
    if (Array.isArray(existingLevels)) {
      await Promise.all(
        existingLevels.map((l: any) => adminApi.remove("exam-levels", l.id)),
      );
    }
    await Promise.all(
      examLevels
        .filter((l) => l.name)
        .map((l, i) =>
          adminApi.create("exam-levels", {
            name: l.name,
            notificationId,
            order: i,
          }),
        ),
    );

    const existingPosts = await fetch(
      `/api/posts?notificationId=${notificationId}`,
    ).then((r) => r.json());
    if (Array.isArray(existingPosts)) {
      await Promise.all(
        existingPosts.map((p: any) => adminApi.remove("posts", p.id)),
      );
    }
    await Promise.all(
      posts
        .filter((p) => p.title && p.qualificationId)
        .map((p) =>
          adminApi.create("posts", {
            title: p.title,
            notificationId,
            vacancies: Number(p.vacancies) || 0,
            qualificationId: p.qualificationId,
            minAge: p.minAge ? Number(p.minAge) : 18,
            maxAge: p.maxAge ? Number(p.maxAge) : null,
            payScale: p.payScale || null,
            employmentType: p.employmentType,
            branchIds: p.branchIds,
            roleIds: p.roleId ? [p.roleId] : [],
          }),
        ),
    );
  };

  const doSave = async (publishOverride?: boolean): Promise<boolean> => {
    const dateError = validateNotificationDates(form);
    if (dateError) {
      setFormError(dateError);
      return false;
    }
    if (
      !form.organizationId ||
      !form.title ||
      !form.officialLink ||
      !form.applicationEndDate
    ) {
      setFormError(
        "Please fill in all required fields (Title, Organization, Official Link, Application End Date).",
      );
      return false;
    }

    try {
      const payload = {
        ...form,
        published:
          publishOverride !== undefined ? publishOverride : form.published,
        selectionProcess: selectedSteps,
        stateIds: form.stateId ? [form.stateId] : [],
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
      delete payload.stateId;

      let notificationId = jobId;
      if (mode === "create") {
        const created = await adminApi.create<any>("notifications", payload);
        notificationId = created.id;
      } else {
        await adminApi.update("notifications", jobId!, payload);
      }

      await saveNestedCollections(notificationId!);
      return true;
    } catch (err) {
      console.error(err);
      setFormError("Failed to save. Check console for details.");
      return false;
    }
  };

  const handleSave = async () => {
    setSubmitting("save");
    if (await doSave(mode === "edit" ? undefined : false))
      router.push("/admin/notifications");
    setSubmitting(null);
  };

  const handlePublish = async () => {
    setSubmitting("publish");
    if (await doSave(true)) router.push("/admin/notifications");
    setSubmitting(null);
  };

  const handleUnpublish = async () => {
    setSubmitting("unpublish");
    if (await doSave(false)) router.push("/admin/notifications");
    setSubmitting(null);
  };

  const handleDelete = async () => {
    if (!jobId) return;
    if (!confirm("Permanently delete this job? This cannot be undone.")) return;
    setSubmitting("delete");
    try {
      await adminApi.remove("notifications", jobId);
      router.push("/admin/notifications");
    } catch (err) {
      console.error(err);
      setFormError("Failed to delete.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleCancel = () => {
    router.push("/admin/notifications");
  };

  if (loadingExisting) return <div className="p-6">Loading...</div>;

  const inputClass =
    "w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500";

  return (
    <div className="p-6 max-w-3xl">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">
            {mode === "create" ? "Add New Job" : "Edit Job"}
          </h2>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={!!submitting}
              className="flex items-center gap-1.5 text-xs text-danger hover:underline"
            >
              <Trash2 size={14} /> Delete Job
            </button>
          )}
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 text-xs text-danger">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid md:grid-cols-2 gap-5"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              placeholder="e.g. SSC CGL 2026"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Organization *
            </label>
            <select
              required
              value={form.organizationId}
              onChange={(e) => handleOrganizationChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Select...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Official Link *
            </label>
            <input
              required
              value={form.officialLink}
              onChange={(e) => {
                updateField("officialLink", e.target.value);
                setOfficialLinkTouched(true);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              State
            </label>
            <select
              value={form.stateId}
              onChange={(e) => updateField("stateId", e.target.value)}
              className={inputClass}
            >
              <option value="">All India</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Status *
            </label>
            <select
              required
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className={inputClass}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="LIVE">Live</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Application Mode
            </label>
            <select
              value={form.applicationMode}
              onChange={(e) => updateField("applicationMode", e.target.value)}
              className={inputClass}
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          <ExamLevelsFieldArray levels={examLevels} onChange={setExamLevels} />

          <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              Important Dates
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Notification Date
                </label>
                <input
                  type="date"
                  value={form.notificationDate}
                  onChange={(e) =>
                    updateField("notificationDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Application Start Date
                </label>
                <input
                  type="date"
                  value={form.applicationStartDate}
                  onChange={(e) =>
                    updateField("applicationStartDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Application End Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.applicationEndDate}
                  onChange={(e) =>
                    updateField("applicationEndDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => updateField("examDate", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <ImportantDatesFieldArray
            dates={importantDates}
            onChange={setImportantDates}
          />

          <ApplicationFeeFieldArray
            fees={applicationFees}
            onChange={setApplicationFees}
          />

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Selection Process
            </label>
            <div className="flex flex-wrap gap-2">
              {SELECTION_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => toggleStep(step)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    selectedSteps.includes(step)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-neutral-600 border-neutral-200"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              How to Apply (notes)
            </label>
            <textarea
              value={form.howToApply}
              onChange={(e) => updateField("howToApply", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <PostsFieldArray posts={posts} onChange={setPosts} />
          <AdmitCardsFieldArray
            items={admitCards}
            onChange={setAdmitCards}
            examLevels={examLevels}
          />
          <ResultsFieldArray
            items={results}
            onChange={setResults}
            examLevels={examLevels}
          />
          <AnswerKeysFieldArray
            items={answerKeys}
            onChange={setAnswerKeys}
            examLevels={examLevels}
          />
          <FAQsFieldArray faqs={faqs} onChange={setFaqs} />
          <LinksFieldArray links={links} onChange={setLinks} />

          <div className="md:col-span-2 border-t border-neutral-100 pt-4 mt-2">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSave}
                disabled={!!submitting}
              >
                {submitting === "save" ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
                disabled={!!submitting}
              >
                {submitting === "publish" ? "Publishing..." : "Publish"}
              </Button>
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUnpublish}
                  disabled={!!submitting}
                >
                  {submitting === "unpublish" ? "Unpublishing..." : "Unpublish"}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={!!submitting}
              >
                Cancel
              </Button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              Current status:{" "}
              <span className="font-medium">
                {form.published
                  ? "Published (visible to users)"
                  : "Draft (hidden from users)"}
              </span>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
