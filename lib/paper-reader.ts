import mammoth from 'mammoth';
import { htmlToPaperText } from '@/lib/paper-text';

export const MAX_PAPER_BYTES = 5 * 1024 * 1024;

export type PaperRead = { text: string; kind: 'docx' | 'pdf' } | { error: string };

export async function readPaper(buffer: Buffer): Promise<PaperRead> {
  if (buffer.length === 0) return { error: 'The file is empty.' };
  if (buffer.length > MAX_PAPER_BYTES) return { error: 'The file is larger than 5 MB.' };
  const head = buffer.subarray(0, 8);

  if (head.subarray(0, 4).toString('latin1') === '%PDF') {
    try {
      // @ts-ignore the library ships no types for this path
      const mod = await import('pdf-parse/lib/pdf-parse.js');
      const parse = (mod.default ?? mod) as (b: Buffer) => Promise<{ text: string; numpages: number }>;
      const out = await parse(buffer);
      const text = (out.text ?? '').trim();
      if (text.length < 20 * Math.max(1, out.numpages)) {
        return { error: 'This PDF has almost no readable text, so it looks like a scan or photos. Scanned papers cannot be read yet. Use a Word file or a PDF with real text.' };
      }
      return { text, kind: 'pdf' };
    } catch {
      return { error: 'This PDF could not be read. It may be damaged or protected.' };
    }
  }

  if (head[0] === 0x50 && head[1] === 0x4b) {
    try {
      const out = await mammoth.convertToHtml({ buffer });
      const text = htmlToPaperText(out.value);
      if (!text) return { error: 'No text was found in this Word file.' };
      return { text, kind: 'docx' };
    } catch {
      return { error: 'This file could not be read as a Word document (.docx).' };
    }
  }

  if (head[0] === 0xd0 && head[1] === 0xcf) return { error: 'Old Word files (.doc) are not supported. Open it in Word and save it as .docx.' };
  return { error: 'Only Word files (.docx) and PDFs with real text are supported. Images and scans cannot be read yet.' };
}
