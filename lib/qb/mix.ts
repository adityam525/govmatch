export type Level = 'EASY' | 'MEDIUM' | 'HARD';
export type Mix = Record<Level, number>;
export const DEFAULT_MIX: Mix = { EASY: 10, MEDIUM: 45, HARD: 45 };
const KEYS: Level[] = ['EASY', 'MEDIUM', 'HARD'];

// Changing one share re-balances the others so the total stays 100.
// touched lists the shares the user already edited, oldest first.
export function rebalance(mix: Mix, key: Level, raw: number, touched: Level[]): { mix: Mix; touched: Level[] } {
  const v = Math.max(0, Math.min(100, Math.round(Number.isFinite(raw) ? raw : 0)));
  const others = KEYS.filter((k) => k !== key);
  const next: Mix = { ...mix, [key]: v };
  const rest = 100 - v;
  const untouched = others.filter((k) => !touched.includes(k));

  if (untouched.length === 2) {
    const [a, b] = others;
    const total = mix[a] + mix[b];
    next[a] = total > 0 ? Math.round((rest * mix[a]) / total) : Math.round(rest / 2);
    next[b] = rest - next[a];
  } else {
    // One other is free to move, or both were edited and the older edit moves.
    const free = untouched.length === 1 ? untouched[0] : (touched.find((k) => others.includes(k)) as Level);
    const held = others.find((k) => k !== free) as Level;
    if (rest - mix[held] >= 0) { next[free] = rest - mix[held]; next[held] = mix[held]; }
    else { next[free] = 0; next[held] = rest; }
  }
  return { mix: next, touched: [...touched.filter((k) => k !== key), key] };
}
