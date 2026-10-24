"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { adminApi } from "@/features/admin/api";
import PostQualificationCascade, { QualificationBlock } from "./PostQualificationCascade";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { CERTIFICATIONS, GENDER_RESTRICTIONS } from "@/lib/eligibility-options";
import { DISABILITY_TYPES, RULE_CATEGORIES, RULE_STATUSES } from "@/lib/special-categories";

export interface RuleDraft {
  category: string;
  status: string;
  years: string;
  maxAge: string;
  note: string;
}

export interface PostDraft {
  id?: string;
  title: string;
  vacancies: string;
  qualificationBlocks: QualificationBlock[];
  minAge: string;
  maxAge: string;
  payScale: string;
  employmentType: string;
  roleId: string;
  genderRestriction: string;
  minExperienceYears: string;
  requiredCertifications: string[];
  domicileStateCode: string;
  minHeightCm: string;
  minChestCm: string;
  pwdTypes: string[];
  relaxationRules: RuleDraft[];
}

interface RoleOption { id: string; name: string }
interface StateOption { code: string; name: string }

interface PostsFieldArrayProps {
  posts: PostDraft[];
  onChange: (posts: PostDraft[]) => void;
}

const EMPLOYMENT_TYPES = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "CONTRACT", label: "Contract" },
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "DEPUTATION", label: "Deputation" },
];

const PRESETS: { label: string; rule: RuleDraft }[] = [
  { label: "OBC +3", rule: { category: "OBC", status: "NONE", years: "3", maxAge: "", note: "" } },
  { label: "SC +5", rule: { category: "SC", status: "NONE", years: "5", maxAge: "", note: "" } },
  { label: "ST +5", rule: { category: "ST", status: "NONE", years: "5", maxAge: "", note: "" } },
  { label: "PwD +10", rule: { category: "ANY", status: "PWD", years: "10", maxAge: "", note: "" } },
  { label: "Ex-serviceman +3", rule: { category: "ANY", status: "EX_SERVICEMAN", years: "3", maxAge: "", note: "" } },
];

const blankBlock = (): QualificationBlock => ({ qualificationCategorySlug: "", qualificationId: "", branchIds: [] });

export const emptyPost: PostDraft = {
  title: "",
  vacancies: "",
  qualificationBlocks: [blankBlock()],
  minAge: "18",
  maxAge: "21",
  payScale: "",
  employmentType: "PERMANENT",
  roleId: "",
  genderRestriction: "",
  minExperienceYears: "",
  requiredCertifications: [],
  domicileStateCode: "",
  minHeightCm: "",
  minChestCm: "",
  pwdTypes: [],
  relaxationRules: [],
};

const inputCls = "w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";
const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
const chip = (active: boolean) =>
  `rounded-full border px-2.5 py-1 text-xs transition-colors ${
    active ? "border-primary-600 bg-primary-600 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
  }`;

const ruleCount = (post: PostDraft) =>
  post.relaxationRules.length +
  post.requiredCertifications.length +
  [post.genderRestriction, post.domicileStateCode, post.minExperienceYears, post.minHeightCm, post.minChestCm].filter(Boolean).length;

export default function PostsFieldArray({ posts, onChange }: PostsFieldArrayProps) {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);

  useEffect(() => {
    adminApi.list<RoleOption>("roles").then(setRoles).catch(() => {});
    fetch("/api/states")
      .then((r) => r.json())
      .then((d) => setStates(Array.isArray(d) ? [...d].sort((a, b) => a.name.localeCompare(b.name)) : []))
      .catch(() => {});
  }, []);

  const updatePost = (index: number, key: keyof PostDraft, value: any) => {
    const next = [...posts];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const updateRule = (pi: number, ri: number, patch: Partial<RuleDraft>) =>
    updatePost(pi, "relaxationRules", posts[pi].relaxationRules.map((r, i) => (i === ri ? { ...r, ...patch } : r)));
  const addRule = (pi: number, rule: RuleDraft) => updatePost(pi, "relaxationRules", [...posts[pi].relaxationRules, { ...rule }]);
  const removeRule = (pi: number, ri: number) =>
    updatePost(pi, "relaxationRules", posts[pi].relaxationRules.filter((_, i) => i !== ri));

  const addPost = () => onChange([...posts, { ...emptyPost, qualificationBlocks: [blankBlock()], requiredCertifications: [], pwdTypes: [], relaxationRules: [] }]);
  const removePost = (index: number) => onChange(posts.filter((_, i) => i !== index));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Posts</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addPost}>
          Add Post
        </Button>
      </div>

      {posts.length === 0 && <p className="text-xs text-neutral-400 mb-3">No posts added yet. Click &quot;Add Post&quot; to add one.</p>}

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 relative">
            <button type="button" onClick={() => removePost(index)} className="absolute top-3 right-3 text-neutral-400 hover:text-danger">
              <Trash2 size={14} />
            </button>

            <div className="grid md:grid-cols-2 gap-3 pr-6">
              <div className="md:col-span-2">
                <label className={labelCls}>Post Title</label>
                <input type="text" value={post.title} onChange={(e) => updatePost(index, "title", e.target.value)} placeholder="e.g. Junior Engineer (Civil)" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Vacancies</label>
                <input type="number" value={post.vacancies} onChange={(e) => updatePost(index, "vacancies", e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Employee Role</label>
                <FilterDropdown
                  label="Select role"
                  options={roles.map((r) => ({ id: r.id, label: r.name }))}
                  selected={post.roleId ? [post.roleId] : []}
                  onChange={(ids) => updatePost(index, "roleId", ids[0] ?? "")}
                  multi={false}
                  widthClass="w-full"
                  allowCreate
                  onCreate={async (name) => {
                    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    const res = await fetch("/api/roles", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, slug }),
                    });
                    const created = await res.json();
                    if (!res.ok) return null;
                    setRoles((prev) => [...prev, created]);
                    return { id: created.id, label: created.name };
                  }}
                />
              </div>

              <div>
                <label className={labelCls}>Employment Type</label>
                <select value={post.employmentType} onChange={(e) => updatePost(index, "employmentType", e.target.value)} className={inputCls}>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <PostQualificationCascade blocks={post.qualificationBlocks} onChange={(blocks) => updatePost(index, "qualificationBlocks", blocks)} />

              <div>
                <label className={labelCls}>Pay Scale</label>
                <input type="text" value={post.payScale} onChange={(e) => updatePost(index, "payScale", e.target.value)} placeholder="e.g. Level 6" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Min Age</label>
                  <input type="number" value={post.minAge} onChange={(e) => updatePost(index, "minAge", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Age</label>
                  <input type="number" value={post.maxAge} onChange={(e) => updatePost(index, "maxAge", e.target.value)} className={inputCls} />
                </div>
              </div>

              <details className="md:col-span-2 rounded-lg border border-neutral-200 bg-neutral-50/60" open={ruleCount(post) > 0 ? true : undefined}>
                <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-medium text-neutral-800">
                  Eligibility rules
                  <span className="ml-2 text-xs font-normal text-neutral-500">
                    {ruleCount(post) > 0 ? `${ruleCount(post)} set` : "age relaxation, gender, home state, experience, certificates, physical"}
                  </span>
                </summary>

                <div className="space-y-4 border-t border-neutral-200 bg-white p-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className={labelCls}>Open to</label>
                      <select value={post.genderRestriction} onChange={(e) => updatePost(index, "genderRestriction", e.target.value)} className={inputCls}>
                        {GENDER_RESTRICTIONS.map((g) => (
                          <option key={g.code} value={g.code}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Only for residents of</label>
                      <select value={post.domicileStateCode} onChange={(e) => updatePost(index, "domicileStateCode", e.target.value)} className={inputCls}>
                        <option value="">Any state</option>
                        {states.map((s) => (
                          <option key={s.code} value={s.code}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Minimum experience (years)</label>
                      <input type="number" min={0} max={50} value={post.minExperienceYears} onChange={(e) => updatePost(index, "minExperienceYears", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Minimum height (cm)</label>
                      <input type="number" min={100} max={230} value={post.minHeightCm} onChange={(e) => updatePost(index, "minHeightCm", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Minimum chest (cm)</label>
                      <input type="number" min={50} max={150} value={post.minChestCm} onChange={(e) => updatePost(index, "minChestCm", e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <p className={labelCls}>Certificates required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CERTIFICATIONS.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          aria-pressed={post.requiredCertifications.includes(c.code)}
                          onClick={() => updatePost(index, "requiredCertifications", toggle(post.requiredCertifications, c.code))}
                          className={chip(post.requiredCertifications.includes(c.code))}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <p className="mr-1 text-xs font-medium text-neutral-600">Age relaxation</p>
                      {PRESETS.map((p) => (
                        <button key={p.label} type="button" onClick={() => addRule(index, p.rule)} className="rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600 hover:border-primary-300 hover:text-primary-600">
                          + {p.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => addRule(index, { category: "ANY", status: "NONE", years: "", maxAge: "", note: "" })}
                        className="rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600 hover:border-primary-300 hover:text-primary-600"
                      >
                        + Custom row
                      </button>
                    </div>
                    <p className="mb-2 text-[11px] text-neutral-500">
                      Copy these from the notice. A candidate gets the most generous row they qualify for. Rows are alternatives, not added together, so enter combined values such as OBC + PwD as their own row.
                    </p>

                    <div className="space-y-2">
                      {post.relaxationRules.map((rule, ri) => (
                        <div key={ri} className="grid gap-2 rounded-lg border border-neutral-200 p-2 sm:grid-cols-[1fr_1fr_5.5rem_5.5rem_auto]">
                          <select value={rule.category} onChange={(e) => updateRule(index, ri, { category: e.target.value })} className={inputCls} aria-label="Category">
                            {RULE_CATEGORIES.map((c) => (
                              <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                          </select>
                          <select value={rule.status} onChange={(e) => updateRule(index, ri, { status: e.target.value })} className={inputCls} aria-label="Applies to">
                            {RULE_STATUSES.map((s) => (
                              <option key={s.code} value={s.code}>{s.label}</option>
                            ))}
                          </select>
                          <input type="number" min={0} max={40} placeholder="+ years" value={rule.years} onChange={(e) => updateRule(index, ri, { years: e.target.value })} className={inputCls} aria-label="Extra years" />
                          <input type="number" min={14} max={80} placeholder="or max age" value={rule.maxAge} onChange={(e) => updateRule(index, ri, { maxAge: e.target.value })} className={inputCls} aria-label="Maximum age" />
                          <button type="button" onClick={() => removeRule(index, ri)} aria-label="Remove row" className="justify-self-end rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger">
                            <X size={14} />
                          </button>
                          <input type="text" maxLength={200} placeholder="Note (optional)" value={rule.note} onChange={(e) => updateRule(index, ri, { note: e.target.value })} className={`${inputCls} sm:col-span-5`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {post.relaxationRules.some((r) => r.status === "PWD") && (
                    <div>
                      <p className={labelCls}>Disability groups the PwD relaxation is open to</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DISABILITY_TYPES.map((d) => (
                          <button
                            key={d.code}
                            type="button"
                            aria-pressed={post.pwdTypes.includes(d.code)}
                            onClick={() => updatePost(index, "pwdTypes", toggle(post.pwdTypes, d.code))}
                            className={chip(post.pwdTypes.includes(d.code))}
                          >
                            {d.short}
                          </button>
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-500">Leave all unselected if the notice does not restrict it to particular groups.</p>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
