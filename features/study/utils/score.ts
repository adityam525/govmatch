export function calculateScore(
  correct: number,
  wrong: number,
  marks = 2,
  negative = 0.5,
) {
  return (correct * marks) - (wrong * negative);
}

export function calculateAccuracy(
  correct: number,
  attempted: number,
) {
  if (attempted === 0) {
    return 0;
  }

  return Number(
    ((correct / attempted) * 100).toFixed(2),
  );
}
