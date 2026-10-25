import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { uploadLogo } from '@/lib/storage';

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const folder = String(form?.get('folder') ?? '');
  const slug = String(form?.get('slug') ?? 'logo');

  if (!(file instanceof File)) return NextResponse.json({ message: 'Choose an image to upload.' }, { status: 400 });
  if (folder !== 'organizations' && folder !== 'states') return NextResponse.json({ message: 'Invalid upload target.' }, { status: 400 });

  const result = await uploadLogo(folder, slug, file);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ url: result.url });
}
