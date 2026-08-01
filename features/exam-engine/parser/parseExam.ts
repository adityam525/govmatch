import { Exam, ExamQuestion, ExamOption } from "../types/exam";

const OPTION_REGEX = /^([A-D])[\.\)]?\s+(.*)$/i;
const ANSWER_REGEX = /^Answer\s*:\s*([A-D])$/i;

function createOption(letter: string, text: string): ExamOption {
  return {
    id: letter.toUpperCase(),
    text: text.trim(),
  };
}

export function parseExam(input: string, title = "Custom Practice Test"): Exam {
  const lines = input.split(/\r?\n/).map((line) => line.trim());

  const questions: ExamQuestion[] = [];

  let question = "";
  let options: ExamOption[] = [];
  let answer = "";

  function pushQuestion() {
    if (!question || options.length < 2 || !answer) {
      return;
    }

    questions.push({
      id: String(questions.length + 1),

      question,

      options,

      correctOptionId: answer,

      marks: 1,

      negativeMarks: 0,

      difficulty: "medium",
    });

    question = "";
    options = [];
    answer = "";
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      continue;
    }

    if (/^\d+[\.\)]/.test(line)) {
      pushQuestion();

      question = line.replace(/^\d+[\.\)]\s*/, "");

      continue;
    }

    const optionMatch = line.match(OPTION_REGEX);

    if (optionMatch) {
      options.push(createOption(optionMatch[1], optionMatch[2]));

      continue;
    }

    const answerMatch = line.match(ANSWER_REGEX);

    if (answerMatch) {
      answer = answerMatch[1].toUpperCase();

      continue;
    }
  }

  pushQuestion();

  return {
    id: `custom-${Date.now()}`,

    config: {
      title,

      duration: 60,

      shuffleQuestions: false,

      shuffleOptions: false,

      negativeMarking: false,

      allowReview: true,
    },

    questions,
  };
}
