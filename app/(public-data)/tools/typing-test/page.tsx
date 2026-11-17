'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { profileSpeed, scoreTyping, type TypingResult } from '@/lib/typing-test';

const PASSAGES = [
  'A good application begins with careful reading. Read the notification twice, note the last date, the fee and the documents you need, and keep scanned copies ready before you open the form. Many candidates lose a chance only because a photo was the wrong size or a certificate was missing. Fill each field slowly, check it again, and save a copy of the submitted form for later use.',
  'Preparing for an exam is a little like building a house. The base is the syllabus, the walls are the topics you finish each week, and the roof is regular revision. If you skip the base, nothing stands for long. Make a simple plan, study at the same hours every day, and test yourself with a short quiz on Sunday so that weak areas show up early.',
  'Government offices run on clear records. A clerk who types quickly and accurately saves time for the whole department, because a letter that is correct the first time does not need to be written again. Practise with full sentences, keep your wrists relaxed, look at the screen instead of the keys, and aim for steady speed before you try to go faster.',
  'The railway timetable is printed twice a year and read by millions of people. Behind each line of numbers there is a team that checks every arrival and departure so that trains do not meet on the same track. Work like this needs patience and attention to detail, which is why recruitment tests often include typing and data entry tasks.',
];
const DURATIONS = [{ value: '60', label: '1 minute' }, { value: '120', label: '2 minutes' }, { value: '180', label: '3 minutes' }, { value: '300', label: '5 minutes' }];

export default function TypingTestPage() {
  const { user, isLoggedIn } = useAuth();
  const [pi, setPi] = useState(0);
  const [length, setLength] = useState('60');
  const [typed, setTyped] = useState('');
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [saved, setSaved] = useState('');
  const startedAt = useRef(0);
  const passage = PASSAGES[pi];

  const finish = (text: string) => {
    const secs = Math.min(Number(length), Math.max(1, (Date.now() - startedAt.current) / 1000));
    setRunning(false); setResult(scoreTyping(passage, text, secs));
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const remaining = Number(length) - Math.floor((Date.now() - startedAt.current) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) { window.clearInterval(id); finish(typedRef.current); }
    }, 250);
    return () => window.clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  const typedRef = useRef('');
  typedRef.current = typed;

  const onChange = (value: string) => {
    if (result) return;
    if (!running) { startedAt.current = Date.now(); setRunning(true); }
    setTyped(value);
    if (value.length >= passage.length) finish(value);
  };
  const reset = (next?: number) => { setTyped(''); setResult(null); setRunning(false); setLeft(Number(length)); setSaved(''); if (next !== undefined) setPi(next); };

  const save = async () => {
    if (!user?.id || !result) return;
    const res = await fetch('/api/users/' + user.id + '/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ typingEnglishWpm: profileSpeed(result.netWpm) }) });
    setSaved(res.ok ? 'Saved to your profile. Job matching now uses ' + profileSpeed(result.netWpm) + ' WPM.' : 'Could not save. Add it from your profile page instead.');
  };

  return (
    <Container width="default" className="py-8">
      <PageHeader title="English typing speed test" subtitle="Type the passage exactly as shown. The clock starts when you press the first key." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div><label className="mb-1 block text-xs font-medium text-neutral-600">Time</label><Select value={length} onChange={(v) => { setLength(v); setLeft(Number(v)); }} disabled={running} options={DURATIONS} /></div>
        <div><label className="mb-1 block text-xs font-medium text-neutral-600">Passage</label><Select value={String(pi)} onChange={(v) => reset(Number(v))} disabled={running} options={PASSAGES.map((_, i) => ({ value: String(i), label: 'Passage ' + (i + 1) }))} /></div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold text-neutral-900">{running || result ? 'Time left: ' + left + ' s' : 'Ready'}</span><span className="text-neutral-600">{typed.length} / {passage.length} characters</span></div>
        <p className="select-none rounded-lg bg-neutral-50 p-4 text-base leading-7 text-neutral-800" aria-label="Passage to type">
          {passage.split('').map((c, i) => <span key={i} className={i < typed.length ? (typed[i] === c ? 'text-green-700' : 'bg-red-100 text-red-700') : ''}>{c}</span>)}
        </p>
        <textarea value={typed} onChange={(e) => onChange(e.target.value)} onPaste={(e) => e.preventDefault()} disabled={!!result} rows={5} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" aria-label="Type here"
          className="mt-3 w-full rounded-lg border border-neutral-200 p-3 text-base outline-none focus:border-primary-500 disabled:bg-neutral-50" placeholder="Start typing here..." />
        <div className="mt-3"><Button type="button" variant="secondary" onClick={() => reset()}>Start again</Button></div>
      </div>

      {result && (
        <section className="mt-6 rounded-2xl border border-green-200 bg-green-50/40 p-5" aria-live="polite">
          <h2 className="section-title text-neutral-900">Your result</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Net speed', result.netWpm + ' WPM'], ['Gross speed', result.grossWpm + ' WPM'], ['Accuracy', result.accuracy + '%'], ['Mistakes', String(result.errors)]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white p-3 text-center"><dt className="text-2xs uppercase text-neutral-500">{k}</dt><dd className="mt-1 text-lg font-bold text-neutral-900">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-neutral-600">An estimate only. Each recruitment test sets its own rules for counting errors, so check your notice.</p>
          {isLoggedIn && <div className="mt-4"><Button type="button" variant="primary" onClick={save}>Save {profileSpeed(result.netWpm)} WPM to my profile</Button>{saved && <p className="mt-2 text-sm text-neutral-700">{saved}</p>}</div>}
          {!isLoggedIn && <p className="mt-3 text-sm text-neutral-600">Log in to save your speed to your profile, so jobs that ask for a typing test can check it.</p>}
        </section>
      )}
    </Container>
  );
}
