import { htmlToPaperText, stripMarks } from "../lib/paper-text";
import { parseQuestions } from "../lib/question-parser";

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => {
  results.push([n, ok]);
};

const html =
  "<p>1. Capital?</p><p>(a) Mumbai</p><p><strong>(b) New Delhi</strong></p><p>(c) Pune</p><p>2. Sum &amp; more?</p><p>(a) 1</p><p>(b) <strong>2</strong></p>";
const text = htmlToPaperText(html);
const r = parseQuestions(text);
check("paragraphs become lines", text.split("\n").length === 7);
check(
  "a bold option is the answer",
  r.questions[0].correctIndex === 1 &&
    r.questions[0].options[1] === "New Delhi",
);
check("bold inside an option works", r.questions[1].correctIndex === 1);
check("entities are decoded", r.questions[1].text === "Sum & more?");
check(
  "a bold answer key works",
  parseQuestions(
    htmlToPaperText(
      "<p>1. Q?</p><p>(a) x</p><p>(b) y</p><p><strong>Answer Key</strong></p><p><strong>1-B</strong></p>",
    ),
  ).questions[0].correctIndex === 1,
);
check(
  "line breaks inside a paragraph",
  htmlToPaperText("<p>a<br/>b</p>") === "a\nb",
);
check(
  "stripMarks removes leftover markers",
  stripMarks("the **bold** word") === "the bold word",
);
check("empty html is safe", htmlToPaperText("") === "");

let failed = 0;
for (const [n, ok] of results) {
  if (!ok) failed++;
  console.log((ok ? "PASS" : "FAIL") + "  " + n);
}
console.log(
  "\n" + (results.length - failed) + " of " + results.length + " cases passed.",
);
if (failed > 0) process.exit(1);
