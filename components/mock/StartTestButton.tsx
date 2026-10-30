'use client';

import { Play } from 'lucide-react';

export default function StartTestButton({ testId }: { testId: string }) {
  const start = () => {
    const url = `/exam/${testId}`;
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    const win = window.open(url, `mockexam-${testId}`, `popup=yes,left=0,top=0,width=${w},height=${h}`);
    if (!win) window.location.assign(url);
    else win.focus();
  };
  return (
    <button type="button" onClick={start} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
      <Play size={14} /> Start test
    </button>
  );
}
