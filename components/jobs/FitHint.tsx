'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Check, HelpCircle, Info, TrendingDown, X } from 'lucide-react';

export type FitTone = 'success' | 'info' | 'warning' | 'danger';

export interface FitHintCheck {
  label: string;
  text: string;
  state: 'ok' | 'fail' | 'unknown' | 'lower';
}

const WIDTH = 312;

const TONES: Record<FitTone, { pill: string; heading: string; border: string }> = {
  success: { pill: 'border-green-200 bg-green-100 text-green-800 hover:bg-green-200 focus-visible:ring-green-300', heading: 'text-green-700', border: 'border-green-200' },
  info: { pill: 'border-sky-200 bg-sky-100 text-sky-800 hover:bg-sky-200 focus-visible:ring-sky-300', heading: 'text-sky-700', border: 'border-sky-200' },
  warning: { pill: 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200 focus-visible:ring-amber-300', heading: 'text-amber-700', border: 'border-amber-200' },
  danger: { pill: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-300', heading: 'text-red-700', border: 'border-red-200' },
};

const ORDER = { fail: 0, unknown: 1, lower: 2, ok: 3 } as const;

function StateIcon({ state }: { state: FitHintCheck['state'] }) {
  if (state === 'ok') return <Check size={13} aria-hidden className="mt-0.5 shrink-0 text-green-600" />;
  if (state === 'fail') return <X size={13} aria-hidden className="mt-0.5 shrink-0 text-red-600" />;
  if (state === 'lower') return <TrendingDown size={13} aria-hidden className="mt-0.5 shrink-0 text-amber-600" />;
  return <HelpCircle size={13} aria-hidden className="mt-0.5 shrink-0 text-amber-600" />;
}

// A pill with an explanation popover. Opens on mouse hover, keyboard focus or tap, and is drawn
// in a layer above the page so a scrolling list cannot clip it.
export default function FitHint({
  pill,
  tone,
  title,
  checks,
}: {
  pill: string;
  tone: FitTone;
  title: string;
  checks: FitHintCheck[];
}) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pointerKind = useRef<string>('mouse');
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ left: number; top: number; above: boolean } | null>(null);

  const style = TONES[tone];
  const sorted = [...checks].sort((a, b) => ORDER[a.state] - ORDER[b.state]);
  const PillIcon = tone === 'danger' ? AlertCircle : tone === 'warning' ? HelpCircle : Info;

  const hide = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - WIDTH - 8));
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 230 && rect.top > spaceBelow;
    setPlace({ left, top: above ? rect.top - 8 : rect.bottom + 8, above });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open, hide]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`${pill}. ${sorted.map((c) => c.text).join(' ')}`}
        onPointerDown={(e) => {
          pointerKind.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') show();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') hide();
        }}
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          if (pointerKind.current === 'mouse') show();
          else if (open) hide();
          else show();
        }}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${style.pill}`}
      >
        <PillIcon size={12} aria-hidden />
        {pill}
      </button>

      {open &&
        place &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              left: place.left,
              top: place.top,
              width: WIDTH,
              transform: place.above ? 'translateY(-100%)' : undefined,
            }}
            className={`pointer-events-none z-[60] rounded-xl border bg-white p-3 shadow-lg ${style.border}`}
          >
            <p className={`text-xs font-semibold ${style.heading}`}>{title}</p>
            <ul className="mt-2 space-y-1.5">
              {sorted.map((check) => (
                <li key={check.label + check.text} className="flex gap-1.5 text-xs leading-snug text-neutral-700">
                  <StateIcon state={check.state} />
                  <span>
                    <span className="font-semibold text-neutral-900">{check.label}: </span>
                    {check.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
