// Turns the plain text of a question paper into draft questions.
// It never guesses: anything it cannot read with confidence gets a warning.
// Pure functions, no database.

export interface ParsedQuestion {
  number: number;
  text: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  answerSource: "inline" | "marked" | "key" | null;
  warnings: string[];
}

export interface ParseResult {
  questions: ParsedQuestion[];
  keyFound: boolean;
  keyCount: number;
  warnings: string[];
}

interface Draft {
  number: number;
  text: string;
  options: string[];
  marked: number[];
  inline: number | null;
  explanation: string;
}

const LETTERS = "abcde";

const PAGE = /^(?:page\s*\d+(?:\s*of\s*\d+)?|-\s*\d+\s*-)$/i;

const KEY_HEAD =
  /^(?:answer\s*key|answers\s*key|ans\.?\s*key|answers)\b[\s:.\-–]*(.*)$/i;

const QUESTION = /^(?:Q\.?\s*)?(\d{1,3})\s*[.):]\s*(\S.*)$/i;

const ANSWER =
  /^(?:ans(?:wer)?|correct(?:\s*(?:answer|option))?)\s*[:.\-–]?\s*\(?([A-Ea-e1-5])\)?\s*[.)]?$/i;

const EXPLANATION = /^(?:explanation|solution|sol|reason)\s*[:.\-–]\s*(.*)$/i;

const clean = (t: string) =>
  t
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

const optionIndex = (token: string): number => {
  const l = LETTERS.indexOf(token.toLowerCase());
  return l >= 0 ? l : Number(token) - 1;
};

const letter = (i: number) => (LETTERS[i] ? LETTERS[i].toUpperCase() : "?");

function parseOptionLine(
  line: string,
  expected: number,
): { texts: string[]; numeric: boolean } | null {
  const re = /(?:^|\s)(?:\(([A-Ea-e1-5])\)\s*|([A-Ea-e])[.)]\s+)/g;

  const spots: {
    start: number;
    end: number;
    index: number;
    numeric: boolean;
  }[] = [];

  let m: RegExpExecArray | null;

  while ((m = re.exec(line))) {
    const token = m[1] || m[2];
    const index = optionIndex(token);

    // Only accept consecutive option labels.
    if (index !== expected + spots.length) continue;

    spots.push({
      start: m.index,
      end: m.index + m[0].length,
      index,
      numeric: /^\d$/.test(token),
    });
  }

  if (!spots.length || spots[0].start !== 0) return null;

  return {
    numeric: spots[0].numeric,
    texts: spots.map((spot, i) =>
      line.slice(spot.end, spots[i + 1]?.start ?? line.length).trim(),
    ),
  };
}

function readMark(
  text: string,
  bold = false,
): { text: string; marked: boolean } {
  let t = text.trim();
  let marked = bold;

  const wrapped = /^\*\*(.+)\*\*$/.exec(t);

  if (wrapped) {
    t = wrapped[1].trim();
    marked = true;
  }

  const tail = /\s*(?:[✓✔☑]|\(correct\))\s*$/i;

  if (tail.test(t)) {
    t = t.replace(tail, "").trim();
    marked = true;
  }

  return { text: t, marked };
}

function parseKey(text: string, numeric: boolean): Map<number, number> {
  const map = new Map<number, number>();

  // Supports:
  // 1-B
  // 1. b
  // Q1: B
  // 1 B
  // 1-B, 2-A
  // 1 B 2 A
  const re =
    /(?:^|[\s,;|])(?:Q\.?\s*)?(\d{1,3})\s*(?:[-–—.):=]\s*|\s+)\(?([A-Ea-e1-5])\)?(?=$|[\s,;|])/g;

  let m: RegExpExecArray | null;

  while ((m = re.exec(text))) {
    const token = m[2];

    if (numeric && !/^\d$/.test(token)) continue;
    if (!numeric && /^\d$/.test(token)) continue;

    const index = optionIndex(token);

    if (index >= 0 && index < 5) {
      map.set(Number(m[1]), index);
    }
  }

  return map;
}

export function parseQuestions(raw: string): ParseResult {
  const drafts: Draft[] = [];

  let cur: Draft | null = null;
  let expected: number | null = null;
  let inExplanation = false;

  let keyStarted = false;
  let keyText = "";
  let numeric = false;

  const lines = raw.replace(/\r\n?/g, "\n").split("\n");

  for (const rawLine of lines) {
    let line = clean(rawLine);

    if (!line || PAGE.test(line)) continue;

    // Everything after the answer-key heading belongs to the key.
    if (keyStarted) {
      keyText += " " + line.replace(/\*+/g, "");
      continue;
    }

    // Detect an answer-key heading, including answers on that same line.
    const head = KEY_HEAD.exec(line.replace(/^\*\*(.*)\*\*$/, "$1").trim());

    if (head && (cur || drafts.length > 0)) {
      keyStarted = true;
      keyText = head[1] || "";
      continue;
    }

    // Preserve bold information before removing Markdown wrappers.
    let bold = false;

    if (line.startsWith("**") && line.endsWith("**")) {
      bold = true;
      line = clean(line.slice(2, -2));
    }

    // Detect the beginning of a new question.
    const q = QUESTION.exec(line);

    if (q) {
      const n = Number(q[1]);

      // The first question can start at any number.
      // Subsequent questions must follow the expected sequence.
      if (expected === null || n === expected) {
        cur = {
          number: n,
          text: q[2].trim(),
          options: [],
          marked: [],
          inline: null,
          explanation: "",
        };

        drafts.push(cur);
        expected = n + 1;
        inExplanation = false;

        continue;
      }
    }

    if (!cur) continue;

    // Inline answer.
    const a = ANSWER.exec(line);

    if (a) {
      cur.inline = optionIndex(a[1]);
      inExplanation = false;
      continue;
    }

    // Explanation heading.
    const e = EXPLANATION.exec(line);

    if (e) {
      cur.explanation = e[1].trim();
      inExplanation = true;
      continue;
    }

    // Options cannot be interpreted inside an explanation.
    const opts = inExplanation
      ? null
      : parseOptionLine(line, cur.options.length);

    if (opts) {
      if (opts.numeric) numeric = true;

      for (const t of opts.texts) {
        const result = readMark(t, bold);

        if (result.marked) {
          cur.marked.push(cur.options.length);
        }

        cur.options.push(result.text);
      }

      continue;
    }

    // Continuation lines.
    if (inExplanation) {
      cur.explanation = (cur.explanation + " " + line).trim();
    } else if (cur.options.length > 0) {
      cur.options[cur.options.length - 1] = (
        cur.options[cur.options.length - 1] +
        " " +
        line
      ).trim();
    } else {
      cur.text = (cur.text + " " + line).trim();
    }
  }

  const key = keyStarted
    ? parseKey(keyText, numeric)
    : new Map<number, number>();

  const warnings: string[] = [];

  if (drafts.length === 0) {
    warnings.push(
      "No questions were found. Check that the questions are numbered (1. 2. 3.) and that the file has real text, not scanned images.",
    );
  }

  if (keyStarted && key.size === 0) {
    warnings.push("An answer key was found but could not be read.");
  } else if (keyStarted && key.size < drafts.length) {
    warnings.push(
      `The answer key has ${key.size} answers for ${drafts.length} questions.`,
    );
  }

  const questions = drafts.map<ParsedQuestion>((d) => {
    const w: string[] = [];

    let correct: number | null = null;
    let source: ParsedQuestion["answerSource"] = null;

    // Inline answer has priority.
    if (d.inline !== null) {
      correct = d.inline;
      source = "inline";
    }

    // Detect explicitly marked answers.
    const marked = [...new Set(d.marked)];

    if (marked.length === 1) {
      if (correct === null) {
        correct = marked[0];
        source = "marked";
      } else if (correct !== marked[0]) {
        w.push("The marked option and the answer line disagree.");
      }
    } else if (marked.length > 1) {
      w.push("More than one option looks marked as correct.");
    }

    // Answer key.
    const k = key.get(d.number);

    if (k !== undefined) {
      if (correct === null) {
        correct = k;
        source = "key";
      } else if (correct !== k) {
        w.push(
          `The answer key says ${letter(k)}, but the answer found next to the question is ${letter(correct)}.`,
        );
      }
    }

    // Validate options and answer index.
    if (d.options.length < 2) {
      w.push("Fewer than 2 options were found.");
    }

    if (correct !== null && correct >= d.options.length) {
      w.push("The answer points to an option that was not found.");

      correct = null;
      source = null;
    }

    if (correct === null) {
      w.push("No correct answer was found. Choose it in the review.");
    }

    if (!d.text.trim()) {
      w.push("The question text is empty.");
    }

    return {
      number: d.number,
      text: d.text.trim(),
      options: d.options,
      correctIndex: correct,
      explanation: d.explanation,
      answerSource: source,
      warnings: w,
    };
  });

  return {
    questions,
    keyFound: keyStarted,
    keyCount: key.size,
    warnings,
  };
}
