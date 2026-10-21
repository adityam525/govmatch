'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';

const WIDTH = 288;

// A red pill with an explanation popover. Opens on mouse hover, keyboard focus or tap.
// The popover is drawn in a layer above the page so a scrolling list cannot clip it.
export default function EligibilityHint({ label, reasons }: { label: string; reasons: string[] }) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pointerKind = useRef<string>('mouse');
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ left: number; top: number; above: boolean } | null>(null);

  const hide = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - WIDTH - 8));
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 190 && rect.top > spaceBelow;
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
        aria-label={`${label}. ${reasons.join(' ')}`}
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
        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        <AlertCircle size={12} aria-hidden />
        {label}
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
            className="pointer-events-none z-[60] rounded-xl border border-red-200 bg-white p-3 shadow-lg"
          >
            <p className="text-xs font-semibold text-red-700">Why: {label}</p>
            <ul className="mt-1.5 space-y-1.5">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-1.5 text-xs leading-snug text-neutral-700">
                  <AlertCircle size={12} aria-hidden className="mt-0.5 shrink-0 text-red-500" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
