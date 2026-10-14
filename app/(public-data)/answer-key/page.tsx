import { redirect } from 'next/navigation';

export default function AnswerKeyPage() {
  redirect('/jobs?updates=answer-keys');
}
