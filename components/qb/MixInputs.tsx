"use client";

import { useState } from "react";
import { DEFAULT_MIX, rebalance, type Level, type Mix } from "@/lib/qb/mix";

const ROWS: { key: Level; label: string; bar: string }[] = [
  { key: "EASY", label: "Easy %", bar: "bg-green-500" },
  { key: "MEDIUM", label: "Medium %", bar: "bg-amber-500" },
  { key: "HARD", label: "Hard %", bar: "bg-red-500" },
];
const field = "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";

// Three shares that always add up to 100. See lib/qb/mix.ts for the rules.
export default function MixInputs({ value, onChange, disabled = false }: { value: Mix; onChange: (m: Mix) => void; disabled?: boolean }) {
  const [touched, setTouched] = useState<Level[]>([]);
  const set = (key: Level, raw: string) => {
    const r = rebalance(value, key, raw === "" ? 0 : Number(raw), touched);
    setTouched(r.touched);
    onChange(r.mix);
  };
  const reset = () => { setTouched([]); onChange({ ...DEFAULT_MIX }); };
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {ROWS.map((r) => (
          <div key={r.key}>
            <label className="mb-1 block text-xs font-medium text-neutral-600">{r.label}</label>
            <input type="number" min={0} max={100} step={1} inputMode="numeric" value={value[r.key]} disabled={disabled} onChange={(e) => set(r.key, e.target.value)} className={field + (disabled ? ' bg-neutral-50' : '')} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-neutral-100" role="img" aria-label={"Easy " + value.EASY + "%, Medium " + value.MEDIUM + "%, Hard " + value.HARD + "%"}>
        {ROWS.map((r) => <div key={r.key} className={r.bar} style={{ width: value[r.key] + "%" }} />)}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-600">
        <span>Always totals 100%. Changing one adjusts the others.</span>
        <button type="button" onClick={reset} disabled={disabled} className="font-medium text-primary-600 hover:underline disabled:opacity-50">Reset to recommended</button>
      </div>
    </div>
  );
}
