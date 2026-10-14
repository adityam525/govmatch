import { redirect } from 'next/navigation';

export default function ResultsPage() {
  redirect('/jobs?updates=results');
}
