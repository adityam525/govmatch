import ExamRunner from '@/components/mock/ExamRunner';

export default async function ExamRunPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <ExamRunner attemptId={attemptId} />;
}
