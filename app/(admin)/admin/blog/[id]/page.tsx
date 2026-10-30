import BlogForm from '@/components/blog/BlogForm';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogForm postId={id} />;
}
