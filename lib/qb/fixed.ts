// A fixed-text question: no variables, one correct option. Stored in QbTemplate.definition as { fixed: {...} }.
// ordered: true keeps the options in the order given (labels such as "x > y"), so they are never shuffled.
export interface FixedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: string;
  ordered?: boolean;
}
export interface FixedDef { fixed: FixedQuestion }

export const isFixed = (def: unknown): def is FixedDef =>
  !!def && typeof def === 'object' && 'fixed' in (def as object) &&
  typeof (def as FixedDef).fixed === 'object' && (def as FixedDef).fixed !== null;

// Returns a list of problems. Empty means the question can be published.
export function validateFixed(q: Partial<FixedQuestion> | null | undefined): string[] {
  const out: string[] = [];
  if (!q || typeof q !== 'object') return ['Not a question.'];
  const text = typeof q.text === 'string' ? q.text.trim() : '';
  if (text.length < 10 || text.length > 800) out.push('Question text must be 10 to 800 characters.');
  const opts = Array.isArray(q.options) ? q.options.map((o) => (typeof o === 'string' ? o.trim() : '')) : [];
  if (opts.length !== 4 && opts.length !== 5) out.push('There must be 4 or 5 options.');
  if (opts.some((o) => o.length === 0 || o.length > 300)) out.push('Every option must be 1 to 300 characters.');
  if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) out.push('Options must all be different.');
  const ci = q.correctIndex;
  if (typeof ci !== 'number' || !Number.isInteger(ci) || ci < 0 || ci > opts.length - 1) out.push('correctIndex must point at one of the options.');
  const exp = typeof q.explanation === 'string' ? q.explanation.trim() : '';
  if (exp.length < 10 || exp.length > 1200) out.push('Explanation must be 10 to 1200 characters.');
  if (opts.some((o) => /^(all|none) of the (above|these)$/i.test(o))) {
    out.push('Avoid "all of the above" and "none of the above": they break when options are shuffled.');
  }
  return out;
}

// Shuffles options (Fisher-Yates) and keeps track of the correct one. Ordered questions are left alone.
export function shuffleFixed(q: FixedQuestion, rand: () => number = Math.random): FixedQuestion {
  if (q.ordered) return q;
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { ...q, options: idx.map((i) => q.options[i]), correctIndex: idx.indexOf(q.correctIndex) };
}
