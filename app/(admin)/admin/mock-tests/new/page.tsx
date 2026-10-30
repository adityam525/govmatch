import MockTestBuilder from '@/components/mock/MockTestBuilder';

export default function NewOfficialTestPage() {
  return <MockTestBuilder endpoint="/api/admin/mock-tests" backHref="/admin/mock-tests" />;
}
