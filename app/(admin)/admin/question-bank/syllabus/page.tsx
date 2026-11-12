'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface Topic { id: string; name: string }
interface Chapter { id: string; name: string; topics: Topic[] }
interface Subject { id: string; name: string; chapters: Chapter[] }
interface Exam { id: string; name: string; stage: string | null; organizationId: string | null }

const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const examLabel = (e: Exam) => e.name + (e.stage ? ' - ' + e.stage : '');

export default function SyllabusPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examId, setExamId] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStage, setNewStage] = useState('');

  const loadExams = () => fetch('/api/admin/qb-exams').then((r) => r.json()).then((d) => setExams(Array.isArray(d) ? d : [])).catch(() => setMsg('Could not load exams.'));
  useEffect(() => {
    loadExams();
    fetch('/api/admin/qb-taxonomy').then((r) => r.json()).then((d) => setSubjects(Array.isArray(d) ? d : [])).catch(() => setMsg('Could not load topics.'));
  }, []);

  useEffect(() => {
    if (!examId) { setPicked(new Set()); return; }
    fetch('/api/admin/qb-exams/' + examId).then((r) => r.json()).then((d) => setPicked(new Set(d.topicIds ?? []))).catch(() => setMsg('Could not load this syllabus.'));
  }, [examId]);

  const total = useMemo(() => subjects.reduce((n, s) => n + s.chapters.reduce((m, c) => m + c.topics.length, 0), 0), [subjects]);

  const toggleTopic = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleChapter = (c: Chapter) => setPicked((p) => {
    const n = new Set(p);
    const all = c.topics.every((t) => n.has(t.id));
    c.topics.forEach((t) => (all ? n.delete(t.id) : n.add(t.id)));
    return n;
  });

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/qb-exams/' + examId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicIds: [...picked] }) });
      const d = await res.json().catch(() => ({}));
      setMsg(res.ok ? 'Saved ' + d.saved + ' topics.' : d.message ?? 'Could not save.');
    } finally { setBusy(false); }
  };

  const createExam = async () => {
    setMsg('');
    const res = await fetch('/api/admin/qb-exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, stage: newStage }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(d.message ?? 'Could not create.'); return; }
    setNewName(''); setNewStage('');
    await loadExams(); setExamId(d.id);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Exam syllabus</h1>
        <p className="mt-1 text-sm text-neutral-600">Choose the topics each exam and stage covers. Learners filter the question bank by these.</p>
        <p className="mt-1 text-xs text-amber-700">The starting mapping was drafted from the general shape of each exam. Check it against the latest official notice.</p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <label className="mb-1 block text-xs font-medium text-neutral-600">Exam</label>
        <Select value={examId} onChange={setExamId} options={[{ value: '', label: 'Select an exam...' }, ...exams.map((e) => ({ value: e.id, label: examLabel(e) }))]} />
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New exam name, e.g. RRB NTPC" className={input} />
          <input value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="Stage (optional), e.g. CBT 1" className={input} />
          <Button type="button" variant="secondary" disabled={!newName.trim()} onClick={createExam}>Add exam</Button>
        </div>
      </section>

      {examId && (
        <section className="space-y-4">
          <p className="text-sm text-neutral-600">{picked.size} of {total} topics selected.</p>
          {subjects.map((s) => (
            <div key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-bold text-neutral-900">{s.name}</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {s.chapters.map((c) => {
                  const count = c.topics.filter((t) => picked.has(t.id)).length;
                  return (
                    <div key={c.id}>
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                        <input type="checkbox" checked={count === c.topics.length} ref={(el) => { if (el) el.indeterminate = count > 0 && count < c.topics.length; }} onChange={() => toggleChapter(c)} className="accent-primary-600" />
                        {c.name} <span className="text-xs font-normal text-neutral-500">{count}/{c.topics.length}</span>
                      </label>
                      <ul className="ml-6 mt-1 space-y-0.5">
                        {c.topics.map((t) => (
                          <li key={t.id}><label className="flex items-center gap-2 text-xs text-neutral-600"><input type="checkbox" checked={picked.has(t.id)} onChange={() => toggleTopic(t.id)} className="accent-primary-600" />{t.name}</label></li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Button type="button" variant="primary" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save syllabus'}</Button>
            {msg && <p className="text-sm text-neutral-700">{msg}</p>}
          </div>
        </section>
      )}
      {!examId && msg && <p className="text-sm text-neutral-700">{msg}</p>}
    </div>
  );
}
