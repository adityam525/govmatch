// Turns the HTML that Word conversion produces into the plain text the parser reads.
// Bold becomes ** markers, because bold is how many papers mark the right answer.

const ENTITIES: [RegExp, string][] = [
  [/&nbsp;/g, ' '], [/&lt;/g, '<'], [/&gt;/g, '>'], [/&quot;/g, '"'], [/&#39;/g, "'"], [/&amp;/g, '&'],
];

export function htmlToPaperText(html: string): string {
  let t = html
    .replace(/<\s*(strong|b)\b[^>]*>/gi, '**')
    .replace(/<\s*\/\s*(strong|b)\s*>/gi, '**')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*(p|li|h[1-6]|tr)\s*>/gi, '\n')
    .replace(/<\s*\/\s*t[dh]\s*>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  for (const [re, to] of ENTITIES) t = t.replace(re, to);
  return t.replace(/\*\*\s*\*\*/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Marker characters left inside question or option text are removed before showing the draft.
export const stripMarks = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
