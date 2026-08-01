import {
  Exam,
  ExamQuestion,
  ExamResult,
  ExamState,
  UserAnswer,
} from '../types/exam';

export class ExamEngine {
  private exam: Exam;

  private state: ExamState;

  constructor(exam: Exam) {
    this.exam = exam;

    this.state = {
      currentQuestion: 0,
      startedAt: Date.now(),
      remainingTime: exam.config.duration * 60,
      submitted: false,

      answers: exam.questions.map<UserAnswer>((q) => ({
        questionId: q.id,
        selectedOptionId: null,
        bookmarked: false,
        visited: false,
        answered: false,
        timeSpent: 0,
      })),
    };
  }

  getExam(): Exam {
    return this.exam;
  }

  getState(): ExamState {
    return this.state;
  }

  getCurrentQuestion(): ExamQuestion {
    return this.exam.questions[this.state.currentQuestion];
  }

  getCurrentAnswer(): UserAnswer {
    return this.state.answers[this.state.currentQuestion];
  }

  nextQuestion() {
    if (
      this.state.currentQuestion <
      this.exam.questions.length - 1
    ) {
      this.state.currentQuestion++;
      this.state.answers[this.state.currentQuestion].visited = true;
    }
  }

  previousQuestion() {
    if (this.state.currentQuestion > 0) {
      this.state.currentQuestion--;
      this.state.answers[this.state.currentQuestion].visited = true;
    }
  }

  goToQuestion(index: number) {
    if (
      index < 0 ||
      index >= this.exam.questions.length
    ) {
      return;
    }

    this.state.currentQuestion = index;
    this.state.answers[index].visited = true;
  }

  answer(optionId: string) {
    const answer =
      this.state.answers[this.state.currentQuestion];

    answer.selectedOptionId = optionId;
    answer.answered = true;
  }

  clearAnswer() {
    const answer =
      this.state.answers[this.state.currentQuestion];

    answer.selectedOptionId = null;
    answer.answered = false;
  }

  toggleBookmark() {
    const answer =
      this.state.answers[this.state.currentQuestion];

    answer.bookmarked = !answer.bookmarked;
  }

  submit() {
    this.state.submitted = true;
  }

  isSubmitted(): boolean {
    return this.state.submitted;
  }

  tick() {
    if (
      this.state.submitted ||
      this.state.remainingTime <= 0
    ) {
      return;
    }

    this.state.remainingTime--;

    if (this.state.remainingTime <= 0) {
      this.submit();
    }
  }

  restore(state: ExamState) {
    this.state = state;
  }

  getResult(): ExamResult {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    let obtainedMarks = 0;
    let maximumMarks = 0;

    this.exam.questions.forEach((question, index) => {
      maximumMarks += question.marks;

      const answer = this.state.answers[index];

      if (!answer.answered || !answer.selectedOptionId) {
        skipped++;
        return;
      }

      if (
        answer.selectedOptionId ===
        question.correctOptionId
      ) {
        correct++;
        obtainedMarks += question.marks;
      } else {
        wrong++;
        obtainedMarks -= question.negativeMarks;
      }
    });

    return {
      totalQuestions: this.exam.questions.length,
      attempted: correct + wrong,
      skipped,
      correct,
      wrong,
      obtainedMarks,
      maximumMarks,
      percentage:
        maximumMarks === 0
          ? 0
          : Math.round(
              (obtainedMarks / maximumMarks) * 100,
            ),
      timeTaken:
        this.exam.config.duration * 60 -
        this.state.remainingTime,
    };
  }
}

export default ExamEngine;
