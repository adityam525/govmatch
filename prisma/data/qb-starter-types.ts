import type { TemplateDef, VarDef } from '../../lib/qb/template';

export interface Starter {
  slug: string; title: string; chapter: string; topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; seconds: number;
  def: TemplateDef;
  /** Recomputes the answer from the drawn variables by a different route than the template formula. */
  verify: (v: Record<string, number>) => number;
}
export const int = (name: string, min: number, max: number, step = 1): VarDef => ({ name, kind: 'int', min, max, step });
export const pick = (name: string, choices: number[]): VarDef => ({ name, kind: 'choice', choices });
