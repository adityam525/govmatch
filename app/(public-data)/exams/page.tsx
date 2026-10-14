import { redirect } from 'next/navigation';

export default function ExamsPage() {
  redirect('/jobs?updates=exams');
}
