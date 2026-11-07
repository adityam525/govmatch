'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { DIFFICULTIES } from '@/lib/mock-difficulty';

interface Var { name: string; kind: string; min: string; max: string; step: string; decimals: string; choices: string }
interface Pair { name: string; expr: string }
interface Topic { id: string; name: string }
interface Chapter { id: string; name: string; topics: Topic[] }
interface Subject { id: string; name: string; chapters: Chapter[] }
interface Sample { text: string; options: string[]; correctIndex: number; explanation: string }
interface Report { ok: boolean; errors: string[]; warnings: string[]; draws: number; accepted: number; averageTries: number; answerMin: number | null; answerMax: number | null; samples: Sample[] }

const blankVar = (): Var => ({ name: '', kind: 'int', min: '', max: '', step: '', decimals: '', choices: '' });
const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1 block text-xs font-medium text-neutral-600';
const card = 'rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm';
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export default function TemplateEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [seconds, setSeconds] = useState('60');
  const [text, setText] = useState('');
  const [vars, setVars] = useState<Var[]>([blankVar()]);
  const [derived, setDerived] = useState<Pair[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [answerExpr, setAnswerExpr] = useState('');
  const [decimals, setDecimals] = useState('0');
  const [unit, setUnit] = useState('');
  const [allowNegative, setAllowNegative] = useState(false);
  const [distractors, setDistractors] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [published, setPublished] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [fresh, setFresh] = useState<Sample[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/qb-taxonomy').then((r) => r.json()).then((d) => setSubjects(Array.isArray(d) ? d : [])).catch(() => setError('Could not load the topics.'));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch('/api/admin/qb-templates/' + id)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((t) => {
        const def = t.definition ?? {};
        setTitle(t.title); setSlug(t.slug); setDifficulty(t.difficulty); setSeconds(String(t.expectedSeconds));
        setSubjectId(t.topic.chapter.subjectId); setChapterId(t.topic.chapterId); setTopicId(t.topic.id); setPublished(!!t.published);
        setText(str(def.text));
        setVars((def.variables ?? []).map((v: any) => ({ name: str(v.name), kind: str(v.kind) || 'int', min: str(v.min), max: str(v.max), step: str(v.step), decimals: str(v.decimals), choices: Array.isArray(v.choices) ? v.choices.join(', ') : '' })));
        setDerived((def.derived ?? []).map((d: any) => ({ name: str(d.name), expr: str(d.expr) })));
        setConstraints(def.constraints ?? []);
        setAnswerExpr(str(def.answer?.expr)); setDecimals(str(def.answer?.decimals ?? 0)); setUnit(str(def.answer?.unit)); setAllowNegative(!!def.answer?.allowNegative);
        setDistractors(def.distractors ?? []); setExplanation(str(def.explanation));
      })
      .catch((e) => setError(e.message || 'Could not load this template.'))
      .finally(() => setLoading(false));
  }, [id]);

  const chapters = subjects.find((s) => s.id === subjectId)?.chapters ?? [];
  const topics = chapters.find((c) => c.id === chapterId)?.topics ?? [];

  const definition = () => ({
    text,
    variables: vars.map((v) => (v.kind === 'choice' ? { name: v.name, kind: v.kind, choices: v.choices } : { name: v.name, kind: v.kind, min: v.min, max: v.max, step: v.step, decimals: v.decimals })),
    derived, constraints, distractors, explanation,
    answer: { expr: answerExpr, decimals, unit, allowNegative },
  });

  const check = async () => {
    setBusy('check'); setError(''); setReport(null); setFresh([]);
    try {
      const res = await fetch('/api/admin/qb-templates/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ definition: definition(), seed: String(Date.now()) }) });
      const d = await res.json();
      if (!res.ok) { setError(d.message ?? 'Could not check the template.'); return; }
      setReport(d.report); setFresh(d.fresh ?? []);
    } catch { setError('Network error.'); } finally { setBusy(null); }
  };

  const save = async (publish: boolean) => {
    setBusy(publish ? 'publish' : 'save'); setError('');
    try {
      const res = await fetch(id ? '/api/admin/qb-templates/' + id : '/api/admin/qb-templates', {
        method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, topicId, difficulty, expectedSeconds: seconds, definition: definition(), published: publish }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? 'Could not save.'); if (d.report) setReport(d.report); return; }
      router.push('/admin/question-bank');
    } catch { setError('Network error. Nothing was saved.'); } finally { setBusy(null); }
  };

  const remove = async () => {
    if (!id || !confirm('Delete this template?')) return;
    const res = await fetch('/api/admin/qb-templates/' + id, { method: 'DELETE' });
    if (res.ok) router.push('/admin/question-bank'); else setError('Could not delete.');
  };

  const setVar = (i: number, p: Partial<Var>) => setVars((v) => v.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const list = (items: string[], set: (v: string[]) => void, placeholder: string, add: string) => (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v} onChange={(e) => set(items.map((x, k) => (k === i ? e.target.value : x)))} placeholder={placeholder} className={input + ' font-mono'} />
          <button type="button" aria-label="Remove" onClick={() => set(items.filter((_, k) => k !== i))} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" onClick={() => set([...items, ''])} className="text-xs text-primary-600 hover:underline">+ {add}</button>
    </div>
  );

  if (loading) return <div className="p-6 text-sm text-neutral-600">Loading...</div>;

  const sampleCard = (q: Sample, k: number) => (
    <div key={k} className="rounded-lg border border-neutral-200 p-3 text-sm">
      <p className="whitespace-pre-wrap font-medium text-neutral-900">{q.text}</p>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {q.options.map((o, i) => <li key={i} className={'rounded px-2 py-1 ' + (i === q.correctIndex ? 'bg-green-100 font-medium text-green-900' : 'bg-neutral-50 text-neutral-700')}>{String.fromCharCode(65 + i)}. {o}</li>)}
      </ul>
      {q.explanation && <p className="mt-2 text-xs text-neutral-600"><b>Explanation:</b> {q.explanation}</p>}
    </div>
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl space-y-6 px-4 pt-6 sm:px-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">{id ? 'Edit template' : 'New template'}</h1>
        {id && <button type="button" onClick={remove} className="flex items-center gap-1.5 text-xs text-danger hover:underline"><Trash2 size={14} /> Delete</button>}
      </header>

      <section className={card}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label className={label}>Title *</label><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} className={input} placeholder="e.g. Train crossing a pole" /></div>
          <div><label className={label}>Subject *</label><Select value={subjectId} onChange={(v) => { setSubjectId(v); setChapterId(''); setTopicId(''); }} options={[{ value: '', label: 'Select...' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} /></div>
          <div><label className={label}>Chapter *</label><Select value={chapterId} disabled={!subjectId} onChange={(v) => { setChapterId(v); setTopicId(''); }} options={[{ value: '', label: 'Select...' }, ...chapters.map((c) => ({ value: c.id, label: c.name }))]} /></div>
          <div><label className={label}>Topic *</label><Select value={topicId} disabled={!chapterId} onChange={setTopicId} options={[{ value: '', label: 'Select...' }, ...topics.map((t) => ({ value: t.id, label: t.name }))]} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Difficulty</label><Select value={difficulty} onChange={setDifficulty} options={DIFFICULTIES.map((d) => ({ value: d.code, label: d.label }))} /></div>
            <div><label className={label}>Expected time (seconds)</label><input type="number" min={10} max={600} value={seconds} onChange={(e) => setSeconds(e.target.value)} className={input} /></div>
          </div>
          <div className="md:col-span-2"><label className={label}>Address (optional)</label><input value={slug} onChange={(e) => setSlug(e.target.value)} className={input} placeholder="train-crossing-pole" /></div>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-neutral-900">Question</h2>
        <p className="mb-2 mt-1 text-xs text-neutral-500">Write the question with <code>{'{name}'}</code> where a variable goes. Use <code>{'{name:2}'}</code> for two decimals.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={input} />
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-neutral-900">Variables</h2>
        <p className="mb-3 mt-1 text-xs text-neutral-500">Numbers the system draws each time. A step of 10 with min 60 and max 300 draws 60, 70, 80 and so on.</p>
        <div className="space-y-2">
          {vars.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-neutral-200 p-2 sm:grid-cols-[6rem_9rem_1fr_auto]">
              <input value={v.name} onChange={(e) => setVar(i, { name: e.target.value })} placeholder="name" className={input + ' font-mono'} aria-label="Variable name" />
              <Select value={v.kind} onChange={(k) => setVar(i, { kind: k })} options={[{ value: 'int', label: 'Whole number' }, { value: 'decimal', label: 'Decimal' }, { value: 'choice', label: 'List of values' }]} />
              {v.kind === 'choice'
                ? <input value={v.choices} onChange={(e) => setVar(i, { choices: e.target.value })} placeholder="5, 10, 15, 20" className={input} aria-label="Values" />
                : <div className="grid grid-cols-4 gap-2">
                    <input type="number" value={v.min} onChange={(e) => setVar(i, { min: e.target.value })} placeholder="min" className={input} aria-label="Minimum" />
                    <input type="number" value={v.max} onChange={(e) => setVar(i, { max: e.target.value })} placeholder="max" className={input} aria-label="Maximum" />
                    <input type="number" value={v.step} onChange={(e) => setVar(i, { step: e.target.value })} placeholder="step" className={input} aria-label="Step" />
                    <input type="number" value={v.decimals} disabled={v.kind !== 'decimal'} onChange={(e) => setVar(i, { decimals: e.target.value })} placeholder="dp" className={input + ' disabled:bg-neutral-100'} aria-label="Decimal places" />
                  </div>}
              <button type="button" aria-label="Remove variable" onClick={() => setVars(vars.filter((_, k) => k !== i))} className="justify-self-end rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-3" icon={<Plus size={14} />} onClick={() => setVars([...vars, blankVar()])}>Add variable</Button>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-neutral-900">Calculated values and rules</h2>
        <p className="mb-3 mt-1 text-xs text-neutral-500">Calculated values are worked out from the variables, in order, such as <code>ms = L / t</code>. A draw that breaks a rule is thrown away and drawn again. Operators: + - * / % ^ and functions sqrt, abs, round, floor, ceil, min, max, gcd, lcm, pow, mod.</p>
        <div className="space-y-2">
          {derived.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input value={d.name} onChange={(e) => setDerived(derived.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder="name" className={input + ' w-32 font-mono'} />
              <input value={d.expr} onChange={(e) => setDerived(derived.map((x, k) => (k === i ? { ...x, expr: e.target.value } : x)))} placeholder="formula, e.g. L / t" className={input + ' font-mono'} />
              <button type="button" aria-label="Remove" onClick={() => setDerived(derived.filter((_, k) => k !== i))} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setDerived([...derived, { name: '', expr: '' }])} className="text-xs text-primary-600 hover:underline">+ Add calculated value</button>
        </div>
        <p className={label + ' mt-4'}>Rules (each must be true)</p>
        {list(constraints, setConstraints, 'e.g. (L * 18) % (t * 5) == 0', 'Add rule')}
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-neutral-900">Answer</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_7rem_8rem]">
          <div><label className={label}>Answer formula *</label><input value={answerExpr} onChange={(e) => setAnswerExpr(e.target.value)} className={input + ' font-mono'} placeholder="L / t * 18 / 5" /></div>
          <div><label className={label}>Decimals</label><input type="number" min={0} max={4} value={decimals} onChange={(e) => setDecimals(e.target.value)} className={input} /></div>
          <div><label className={label}>Unit (optional)</label><input value={unit} onChange={(e) => setUnit(e.target.value)} className={input} placeholder="km/h" /></div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-neutral-700"><input type="checkbox" checked={allowNegative} onChange={(e) => setAllowNegative(e.target.checked)} className="accent-primary-600" /> The answer may be negative</label>
        <p className={label + ' mt-4'}>Wrong-answer formulas (common mistakes, up to 8)</p>
        {list(distractors, setDistractors, 'e.g. L / t', 'Add wrong-answer formula')}
        <p className="mt-2 text-[11px] text-neutral-500">If fewer than three are usable, nearby numbers fill the gap.</p>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-neutral-900">Explanation</h2>
        <p className="mb-2 mt-1 text-xs text-neutral-500">Shown after the test. Use the same placeholders, and <code>{'{answer}'}</code> for the final answer.</p>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} className={input} />
      </section>

      {report && (
        <section className={card} aria-live="polite">
          <h2 className="text-sm font-bold text-neutral-900">Check result</h2>
          <p className={'mt-2 text-sm font-medium ' + (report.ok ? 'text-success' : 'text-danger')}>
            {report.ok ? 'Passed.' : 'Not ready.'}{report.draws > 0 && ' ' + report.accepted + ' of ' + report.draws + ' draws worked'}{report.averageTries > 0 && ', about ' + report.averageTries + ' tries each'}{report.answerMin !== null && ', answers from ' + report.answerMin + ' to ' + report.answerMax}.
          </p>
          {report.errors.map((e) => <p key={e} className="mt-1 text-xs text-danger">&bull; {e}</p>)}
          {report.warnings.map((w) => <p key={w} className="mt-1 text-xs text-amber-700">&bull; {w}</p>)}
          {(report.samples.length > 0 || fresh.length > 0) && <div className="mt-3 space-y-2">{(fresh.length ? fresh : report.samples.slice(0, 3)).map(sampleCard)}</div>}
        </section>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" disabled={!!busy} onClick={() => router.push('/admin/question-bank')}>Cancel</Button>
          <Button type="button" variant="secondary" disabled={!!busy} onClick={check}>{busy === 'check' ? 'Checking...' : 'Check template'}</Button>
          <Button type="button" variant="secondary" disabled={!!busy} onClick={() => save(published)}>{busy === 'save' ? 'Saving...' : published ? 'Save changes' : 'Save draft'}</Button>
          {published
            ? <Button type="button" variant="secondary" disabled={!!busy} onClick={() => save(false)}>Unpublish</Button>
            : <Button type="button" variant="primary" disabled={!!busy} onClick={() => save(true)}>{busy === 'publish' ? 'Publishing...' : 'Publish'}</Button>}
        </div>
      </div>
      <div className="h-6" />
    </form>
  );
}
