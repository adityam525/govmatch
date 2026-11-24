import type { Starter } from './qb-starter-types';
import { STARTERS_A } from './qb-starter-a';
import { STARTERS_B } from './qb-starter-b';
import { STARTERS_C } from './qb-starter-c';
import { STARTERS_D } from './qb-starter-d';
import { STARTERS_E } from './qb-starter-e';
import { BOUNDS } from './qb-bounds';

const ALL: Starter[] = [...STARTERS_A, ...STARTERS_B, ...STARTERS_C, ...STARTERS_D, ...STARTERS_E];
export const STARTERS: Starter[] = ALL.map((s) => {
  const b = BOUNDS[s.slug];
  return b ? ({ ...s, def: { ...s.def, answer: { ...s.def.answer, min: b[0], max: b[1] } } } as Starter) : s;
});
