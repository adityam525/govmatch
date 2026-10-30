import MockTestBuilder from '@/components/mock/MockTestBuilder';

export default async function EditOfficialTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MockTestBuilder testId={id} endpoint="/api/admin/mock-tests" backHref="/admin/mock-tests" />;
}
