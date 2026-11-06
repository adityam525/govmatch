import { fieldKey } from '../field-keys';

export interface BranchRow { id: string; name: string; slug: string; qualificationId: string }
export interface QualificationRule { qualificationId: string; branchIds: string[] }
export interface NewBranch { qualificationId: string; name: string }
export interface Entries { qualificationIds: string[]; branchIds: string[]; qualificationRules: QualificationRule[]; newBranches: NewBranch[]; errors: string[] }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

// Reads a post's qualifications. Plain names keep the old behaviour (one flat branch list).
// If any entry is an object, every qualification gets its own branch list.
export function readQualificationEntries(
  input: { qualifications?: unknown; qualification?: unknown; branches?: unknown },
  resolveQual: (name: string) => string | undefined,
  rows: BranchRow[],
): Entries {
  const errors: string[] = [];
  const entries = [...list(input.qualifications), ...list(input.qualification)];
  const flat = list(input.branches).map(text).filter(Boolean);
  const byName = new Map<string, BranchRow>();
  for (const r of rows) { byName.set(norm(r.name), r); byName.set(norm(r.slug), r); }

  if (entries.length === 0) errors.push('needs a qualification (name or slug)');
  const perQualification = entries.some(isObject);
  const qualificationIds: string[] = [];
  const branchIds: string[] = [];
  const merged = new Map<string, string[] | 'any'>();
  const newBranches: NewBranch[] = [];

  for (const entry of entries) {
    const qText = text(isObject(entry) ? entry.name : entry);
    if (!qText) { errors.push('has an empty qualification entry'); continue; }
    const qid = resolveQual(qText);
    if (!qid) { errors.push('qualification not found: "' + qText + '"'); continue; }
    if (!qualificationIds.includes(qid)) qualificationIds.push(qid);
    if (!perQualification) continue;

    const wanted = (isObject(entry) ? list(entry.branches) : flat).map(text).filter(Boolean);
    const ids: string[] = [];
    for (const rawName of wanted) {
      const isNew = /^new\s*:/i.test(rawName);
      const t = isNew ? rawName.replace(/^new\s*:\s*/i, '').trim() : rawName;
      if (isNew) {
        if (!t) { errors.push('"NEW:" needs a branch name'); continue; }
        const key = fieldKey(t);
        const same = rows.find((r) => r.qualificationId === qid && (norm(r.name) === norm(t) || (key && fieldKey(r.name) === key)));
        if (same) { if (!ids.includes(same.id)) ids.push(same.id); continue; }
        if (byName.has(norm(t))) { errors.push('branch "' + t + '" already exists under another qualification. Use a more specific name, such as "' + t + ' (' + qText + ')"'); continue; }
        if (!newBranches.some((n) => n.qualificationId === qid && norm(n.name) === norm(t))) newBranches.push({ qualificationId: qid, name: t });
        continue;
      }
      const exact = byName.get(norm(t));
      let hit: BranchRow | undefined = exact && exact.qualificationId === qid ? exact : undefined;
      if (!hit) {
        const key = fieldKey(t);
        if (key) hit = rows.find((r) => r.qualificationId === qid && fieldKey(r.name) === key);
      }
      if (hit) { if (!ids.includes(hit.id)) ids.push(hit.id); }
      else if (exact) errors.push('branch "' + t + '" belongs to a different qualification than "' + qText + '"');
      else errors.push('branch not found for "' + qText + '": "' + t + '"');
    }
    const prev = merged.get(qid);
    if (wanted.length === 0 || prev === 'any') merged.set(qid, 'any');
    else merged.set(qid, [...new Set([...(prev ?? []), ...ids])]);
  }

  if (!perQualification) {
    for (const t of flat) {
      const row = byName.get(norm(t));
      if (!row) errors.push('branch not found: "' + t + '"');
      else if (!branchIds.includes(row.id)) branchIds.push(row.id);
    }
    return { qualificationIds, branchIds, qualificationRules: [], newBranches: [], errors };
  }

  const qualificationRules: QualificationRule[] = [...merged.entries()].map(([qualificationId, v]) => ({ qualificationId, branchIds: v === 'any' ? [] : v }));
  for (const r of qualificationRules) for (const id of r.branchIds) if (!branchIds.includes(id)) branchIds.push(id);
  return { qualificationIds, branchIds, qualificationRules, newBranches, errors };
}
