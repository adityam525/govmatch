// Natural limits of an answer. Wrong options stay inside them, so none is impossible.
export const BOUNDS: Record<string, [number, number]> = {
  'unit-digit-power': [0, 9],
  'calendar-last-weekday': [1, 31],
  'calendar-odd-days': [0, 6],
  'clock-angle': [0, 180],
  'polygon-interior-angle': [0, 179],
  'straight-line-angle-ratio': [0, 179],
  'angle-times-complement': [0, 89],
  'triangle-largest-angle-ratio': [0, 179],
  'probability-red-ball': [0, 100],
};
