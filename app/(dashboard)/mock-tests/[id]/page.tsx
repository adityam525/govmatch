import MockTestBuilder from "@/components/mock/MockTestBuilder";

export default async function EditMockTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MockTestBuilder testId={id} />;
}
