import { validateTemplate, type TemplateDef } from './template';
import { isFixed, validateFixed } from './fixed';

// Same report shape as validateTemplate, so the admin screens need no changes.
export function validateAny(def: TemplateDef): ReturnType<typeof validateTemplate> {
  if (isFixed(def)) {
    const f = (def as unknown as { fixed: { text: string; options: string[]; correctIndex: number; explanation: string } }).fixed;
    const errors = validateFixed(f);
    return { ok: errors.length === 0, errors, warnings: [], draws: 1, accepted: 1, averageTries: 1, answerMin: null, answerMax: null, samples: [{ text: f.text, options: f.options, correctIndex: f.correctIndex, explanation: f.explanation }] } as unknown as ReturnType<typeof validateTemplate>;
  }
  return validateTemplate(def);
}
