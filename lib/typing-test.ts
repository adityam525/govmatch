export interface TypingResult { grossWpm: number; netWpm: number; accuracy: number; typed: number; correct: number; errors: number }

// Standard rule: 5 characters make one word. Comparison is by position, so fix mistakes with backspace.
export function scoreTyping(passage: string, typed: string, seconds: number): TypingResult {
  const minutes = Math.max(seconds, 1) / 60;
  let correct = 0;
  for (let i = 0; i < typed.length && i < passage.length; i++) if (typed[i] === passage[i]) correct++;
  const errors = typed.length - correct;
  return {
    grossWpm: Math.round(typed.length / 5 / minutes),
    netWpm: Math.round(correct / 5 / minutes),
    accuracy: typed.length === 0 ? 0 : Math.round((correct / typed.length) * 1000) / 10,
    typed: typed.length, correct, errors,
  };
}

// Profile speeds are whole numbers from 5 to 200.
export const profileSpeed = (netWpm: number) => Math.min(200, Math.max(5, Math.round(netWpm)));
