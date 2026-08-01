import { ImportedQuestion } from '../types/import';

export function parseCSV(
  csv: string,
): ImportedQuestion[] {

  const rows = csv.trim().split('\n');

  const headers = rows[0].split(',');

  return rows
    .slice(1)
    .map((row) => {

      const values = row.split(',');

      return {

        question: values[0],

        optionA: values[1],

        optionB: values[2],

        optionC: values[3],

        optionD: values[4],

        answer: values[5],

        explanation: values[6],

        subject: values[7],

        topic: values[8],

        difficulty: values[9],

        exam: values[10],

      };

    });

}
