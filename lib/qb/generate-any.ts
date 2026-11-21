import { generate } from './template';
import { isFixed } from './fixed';

// Same call as generate(), but fixed-text questions are returned as they are.
// ASSUMPTION: the template definition is generate()'s first argument.
export function generateAny(...args: Parameters<typeof generate>): ReturnType<typeof generate> {
  const def = args[0] as unknown;
  if (isFixed(def)) {
    const f = def.fixed;
    return { ok: true, q: { values: {}, text: f.text.trim(), options: f.options.map((o) => o.trim()), correctIndex: f.correctIndex, explanation: f.explanation.trim(), answer: 0, tries: 1 } } as unknown as ReturnType<typeof generate>;
  }
  return generate(...args);
}
