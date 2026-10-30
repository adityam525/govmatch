import MockTestBuilder from '@/components/mock/MockTestBuilder';
import MockLinkCard from '@/components/mock/MockLinkCard';

export default async function EditOfficialTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="px-4 pt-6 sm:px-6">
      <MockLinkCard testId={id} />
      <MockTestBuilder testId={id} endpoint="/api/admin/mock-tests" backHref="/admin/mock-tests" />
    </div>
  );
}
