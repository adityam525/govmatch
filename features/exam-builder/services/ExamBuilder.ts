import { ExamDraft } from '../types/exam-builder';

export default class ExamBuilder {

  private draft: ExamDraft;

  constructor() {

    this.draft = {

      title: '',

      slug: '',

      description: '',

      exam: '',

      duration: 60,

      totalMarks: 0,

      published: false,

      questions: [],

    };

  }

  getDraft() {

    return this.draft;

  }

  addQuestion(id: string) {

    this.draft.questions.push({

      id,

      marks: 2,

      negativeMarks: 0.5,

      section: 'General',

    });

  }

  removeQuestion(id: string) {

    this.draft.questions =

      this.draft.questions.filter(

        (q) => q.id !== id,

      );

  }

}
