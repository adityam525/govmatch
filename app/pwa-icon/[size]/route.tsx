import { ImageResponse } from 'next/og';

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === '512' ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#2563eb', color: '#ffffff', fontSize: px * 0.42, fontWeight: 700, letterSpacing: -2,
        }}
      >
        GM
      </div>
    ),
    { width: px, height: px },
  );
}
