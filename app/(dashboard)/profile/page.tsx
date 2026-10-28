"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import EducationFields, {
  rowHasContent,
  rowsFromSaved,
  rowsToPayload,
  validateRows,
  type EducationRowState,
} from "@/components/profile/EducationFields";
import PreferencesFields from "@/components/profile/PreferencesFields";
import SpecialCategoriesFields, {
  FEMALE_ONLY_STATUSES,
  type SpecialState,
} from "@/components/profile/SpecialCategoriesFields";
import ExtraProfileFields, {
  type ExtraState,
} from "@/components/profile/ExtraProfileFields";
import { computeCompleteness } from "@/lib/profile-completeness";
import { useAuth } from "@/features/auth/hooks";

type SectionStatus = "required" | "done" | "added" | "optional";

const baseInput =
  "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const fieldClass = (missing: boolean) =>
  `${baseInput} ${missing ? "border-amber-300 bg-amber-50/50" : "border-neutral-200"}`;

const EMPTY_EXTRA: ExtraState = {
  experienceYears: "",
  certifications: [],
  domicileStateCode: "",
  preferredStateCodes: [],
  heightCm: "",
  chestCm: "",
};

const serialize = (parts: unknown, rows: EducationRowState[]) =>
  JSON.stringify({ parts, rows: rows.map(({ key: _key, ...rest }) => rest) });

const inRange = (value: string, min: number, max: number) =>
  value === "" ||
  (Number.isInteger(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max);

function RequiredTag() {
  return (
    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
      Required
    </span>
  );
}

function SectionIndex({
  items,
}: {
  items: { id: string; label: string; status: SectionStatus }[];
}) {
  const go = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  const icon = (status: SectionStatus) =>
    status === "required" ? (
      <AlertCircle size={14} className="shrink-0 text-amber-500" />
    ) : status === "optional" ? (
      <Circle size={14} className="shrink-0 text-neutral-300" />
    ) : (
      <CheckCircle2 size={14} className="shrink-0 text-green-600" />
    );

  return (
    <>
      <nav
        aria-label="Profile sections"
        className="hidden lg:sticky lg:top-[calc(var(--shell-top,4rem)_+_1.5rem)] lg:block lg:self-start
             rounded-xl border border-gray-200
             bg-gray-50 p-3 shadow-sm"
      >
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          Sections
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-neutral-700 hover:bg-white"
              >
                {icon(item.status)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.status === "required" && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    Needed
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700"
          >
            {icon(item.status)}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [personal, setPersonal] = useState({
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    category: "",
  });
  const [special, setSpecial] = useState<SpecialState>({
    disabilityTypes: [],
    disabilityPercent: "",
    specialStatuses: [],
  });
  const [prefs, setPrefs] = useState<{ roleIds: string[]; types: string[] }>({
    roleIds: [],
    types: [],
  });
  const [extra, setExtra] = useState<ExtraState>(EMPTY_EXTRA);
  const [rows, setRows] = useState<EducationRowState[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const snapshot = useRef("");

  useEffect(() => {
    if (!user?.id) return;
    const id = user.id;
    let cancelled = false;

    Promise.all([
      fetch(`/api/users/${id}/profile`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(`/api/users/${id}/education`)
        .then((r) => r.json())
        .catch(() => []),
      fetch(`/api/users/${id}/preferences`)
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([profile, education, preferences]) => {
      if (cancelled) return;
      const p = profile && !profile.message ? profile : {};
      const nextPersonal = {
        phoneNumber: p.phoneNumber ?? "",
        dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
        gender: p.gender ?? "",
        category: p.category ?? "",
      };
      const nextSpecial: SpecialState = {
        disabilityTypes: p.disabilityTypes ?? [],
        disabilityPercent:
          p.disabilityPercent != null ? String(p.disabilityPercent) : "",
        specialStatuses: p.specialStatuses ?? [],
      };
      const nextPrefs = {
        roleIds: preferences?.preferredRoleIds ?? [],
        types: preferences?.preferredEmploymentTypes ?? [],
      };
      const nextExtra: ExtraState = {
        experienceYears:
          p.experienceYears != null ? String(p.experienceYears) : "",
        certifications: p.certifications ?? [],
        domicileStateCode: p.domicileStateCode ?? "",
        preferredStateCodes: p.preferredStateCodes ?? [],
        heightCm: p.heightCm != null ? String(p.heightCm) : "",
        chestCm: p.chestCm != null ? String(p.chestCm) : "",
      };
      const nextRows = rowsFromSaved(Array.isArray(education) ? education : []);

      setPersonal(nextPersonal);
      setSpecial(nextSpecial);
      setPrefs(nextPrefs);
      setExtra(nextExtra);
      setRows(nextRows);
      snapshot.current = serialize(
        { nextPersonal, nextSpecial, nextPrefs, nextExtra },
        nextRows,
      );
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const dirty =
    loaded &&
    serialize(
      {
        nextPersonal: personal,
        nextSpecial: special,
        nextPrefs: prefs,
        nextExtra: extra,
      },
      rows,
    ) !== snapshot.current;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const completeness = computeCompleteness({
    dateOfBirth: personal.dateOfBirth || null,
    educationCount: rows.filter((r) => r.qualificationId).length,
    category: personal.category || null,
    gender: personal.gender || null,
    phoneNumber: personal.phoneNumber || null,
    preferenceCount: prefs.roleIds.length + prefs.types.length,
  });
  const needs = (key: string) =>
    completeness.items.some((i) => i.key === key && !i.done && i.required);

  const updatePersonal = (key: string, value: string) => {
    setPersonal((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const sections: { id: string; label: string; status: SectionStatus }[] = [
    {
      id: "personal",
      label: "Personal details",
      status: needs("dob") || needs("category") ? "required" : "done",
    },
    {
      id: "education",
      label: "Education",
      status: needs("education") ? "required" : "done",
    },
    {
      id: "work",
      label: "Work and skills",
      status:
        extra.experienceYears || extra.certifications.length
          ? "added"
          : "optional",
    },
    {
      id: "location",
      label: "Location",
      status:
        extra.domicileStateCode || extra.preferredStateCodes.length
          ? "added"
          : "optional",
    },
    {
      id: "physical",
      label: "Physical details",
      status: extra.heightCm || extra.chestCm ? "added" : "optional",
    },
    {
      id: "special",
      label: "Special categories",
      status:
        special.disabilityTypes.length || special.specialStatuses.length
          ? "added"
          : "optional",
    },
    {
      id: "preferences",
      label: "Job preferences",
      status: prefs.roleIds.length || prefs.types.length ? "added" : "optional",
    },
  ];

  const save = async () => {
    if (!user?.id) return;
    setMessage(null);

    const filled = rows.filter(rowHasContent);
    const today = new Date().toISOString().slice(0, 10);
    const digits = personal.phoneNumber.replace(/\D/g, "");
    const problem =
      (personal.dateOfBirth &&
      (personal.dateOfBirth > today || personal.dateOfBirth < "1930-01-01")
        ? "Enter a valid date of birth."
        : null) ??
      (personal.phoneNumber && (digits.length < 10 || digits.length > 13)
        ? "Enter a valid mobile number."
        : null) ??
      (special.disabilityTypes.length > 0 &&
      !inRange(special.disabilityPercent, 0, 100)
        ? "Disability percentage must be a whole number from 0 to 100."
        : null) ??
      (!inRange(extra.experienceYears, 0, 50)
        ? "Experience must be a whole number of years from 0 to 50."
        : null) ??
      (!inRange(extra.heightCm, 100, 230)
        ? "Height must be between 100 and 230 cm."
        : null) ??
      (!inRange(extra.chestCm, 50, 150)
        ? "Chest must be between 50 and 150 cm."
        : null) ??
      validateRows(filled);
    if (problem) {
      setMessage({ kind: "error", text: problem });
      return;
    }

    const id = user.id;
    const fail = (section: string, text: string, saved: string[]) =>
      setMessage({
        kind: "error",
        text: `${section}: ${text}${saved.length ? ` (${saved.join(" and ")} saved.)` : " Nothing was saved."}`,
      });

    setSaving(true);
    const saved: string[] = [];
    try {
      // Education goes first: it has the strictest checks, so a problem stops everything before anything is saved.
      const educationRes = await fetch(`/api/users/${id}/education`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rowsToPayload(filled) }),
      });
      const educationData = await educationRes.json().catch(() => ({}));
      if (!educationRes.ok)
        return fail(
          "Education",
          educationData.message ?? "could not be saved.",
          saved,
        );
      saved.push("education");

      const statuses = special.specialStatuses.filter(
        (s) =>
          !FEMALE_ONLY_STATUSES.includes(s) || personal.gender === "Female",
      );
      const profileRes = await fetch(`/api/users/${id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personal,
          disabilityTypes: special.disabilityTypes,
          disabilityPercent:
            special.disabilityTypes.length > 0 ? special.disabilityPercent : "",
          specialStatuses: statuses,
          experienceYears: extra.experienceYears,
          certifications: extra.certifications,
          domicileStateCode: extra.domicileStateCode,
          preferredStateCodes: extra.preferredStateCodes,
          heightCm: extra.heightCm,
          chestCm: extra.chestCm,
        }),
      });
      const profileData = await profileRes.json().catch(() => ({}));
      if (!profileRes.ok)
        return fail(
          "Your details",
          profileData.message ?? "could not be saved.",
          saved,
        );
      saved.push("your details");

      const prefsRes = await fetch(`/api/users/${id}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRoleIds: prefs.roleIds,
          preferredEmploymentTypes: prefs.types,
        }),
      });
      if (!prefsRes.ok)
        return fail("Preferences", "could not be saved.", saved);

      const nextRows = rowsFromSaved(
        Array.isArray(educationData) ? educationData : [],
      );
      const nextSpecial = { ...special, specialStatuses: statuses };
      setRows(nextRows);
      setSpecial(nextSpecial);
      snapshot.current = serialize(
        {
          nextPersonal: personal,
          nextSpecial,
          nextPrefs: prefs,
          nextExtra: extra,
        },
        nextRows,
      );
      setMessage({ kind: "ok", text: "Profile saved." });
    } catch {
      fail("Network error", "please try again.", saved);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600 sm:px-6">
        Loading...
      </div>
    );
  }
  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Card padding="lg">
          <p className="text-sm text-neutral-600">
            Please log in to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const blocked = completeness.requiredMissing.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:pt-8"
    >
      <section
        className={`rounded-2xl border p-4 sm:p-5 ${blocked ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-neutral-900">My Profile</h1>
            <p className="mt-1 text-sm text-neutral-700">
              {blocked
                ? `Still needed for job matching: ${completeness.requiredMissing.join(", ")}.`
                : completeness.missing.length > 0
                  ? `Matching is on. Optional: ${completeness.missing.join(", ")}.`
                  : "Your profile is complete. Matches use everything you have added."}
            </p>
          </div>
          <span className="shrink-0 text-2xl font-bold text-neutral-900">
            {completeness.percent}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
          <div
            className={`h-full rounded-full transition-all ${blocked ? "bg-amber-500" : "bg-green-600"}`}
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
      </section>

      <div className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-8">
        <div className="min-w-0">
          <section
            id="personal"
            className="mt-6 scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:mt-0"
          >
            <h2 className="text-base font-bold text-neutral-900">
              Personal details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Date of birth{needs("dob") && <RequiredTag />}
                </span>
                <input
                  type="date"
                  max={today}
                  value={personal.dateOfBirth}
                  onChange={(e) =>
                    updatePersonal("dateOfBirth", e.target.value)
                  }
                  className={fieldClass(needs("dob"))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Category{needs("category") && <RequiredTag />}
                </span>
                <select
                  value={personal.category}
                  onChange={(e) => updatePersonal("category", e.target.value)}
                  className={fieldClass(needs("category"))}
                >
                  <option value="">Select...</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Gender
                </span>
                <select
                  value={personal.gender}
                  onChange={(e) => updatePersonal("gender", e.target.value)}
                  className={fieldClass(false)}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Mobile number
                </span>
                <input
                  type="tel"
                  value={personal.phoneNumber}
                  onChange={(e) =>
                    updatePersonal("phoneNumber", e.target.value)
                  }
                  placeholder="e.g. 9876543210"
                  className={fieldClass(false)}
                />
              </label>
            </div>
          </section>

          <div id="education" className="scroll-mt-4">
            {loaded ? (
              <EducationFields
                rows={rows}
                highlight={needs("education")}
                onChange={(next) => {
                  setRows(next);
                  setMessage(null);
                }}
              />
            ) : (
              <p className="mt-6 text-sm text-neutral-400">
                Loading your education...
              </p>
            )}
          </div>

          <ExtraProfileFields
            value={extra}
            onChange={(next) => {
              setExtra(next);
              setMessage(null);
            }}
          />

          <div id="special" className="scroll-mt-4">
            <SpecialCategoriesFields
              value={special}
              gender={personal.gender}
              onChange={(next) => {
                setSpecial(next);
                setMessage(null);
              }}
            />
          </div>

          <div id="preferences" className="scroll-mt-4">
            <PreferencesFields
              roleIds={prefs.roleIds}
              types={prefs.types}
              onChange={(next) => {
                setPrefs(next);
                setMessage(null);
              }}
            />
          </div>
        </div>

        <SectionIndex items={sections} />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving || !loaded}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
          {message ? (
            <span
              className={`text-xs ${message.kind === "ok" ? "text-success" : "text-danger"}`}
            >
              {message.text}
            </span>
          ) : dirty ? (
            <span className="text-xs text-amber-700">
              You have unsaved changes
            </span>
          ) : null}
        </div>
      </div>

      <Card padding="lg" className="mb-8 mt-6 border-red-100">
        <p className="text-sm font-bold text-danger">Danger Zone</p>
        <p className="mt-1 text-xs text-neutral-600">
          Deleting your account is permanent and cannot be undone. All your
          saved jobs, applications, and profile data will be removed.
        </p>
        <DeleteAccountButton />
      </Card>
    </form>
  );
}
