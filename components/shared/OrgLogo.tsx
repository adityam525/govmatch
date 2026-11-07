'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface OrgLogoProps {
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

function initialsOf(name: string, shortName?: string | null): string {
  if (shortName) return shortName.slice(0, 4).toUpperCase();
  return name.split(/\s+/).filter(Boolean).slice(0, 3).map((word) => word[0]).join('').toUpperCase();
}

// Shows the logo when there is one and it loads, otherwise initials, so a broken logo never leaves an empty box.
export default function OrgLogo({ name, shortName, logoUrl, size = 40, className = '' }: OrgLogoProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { setFailed(false); }, [logoUrl]);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [logoUrl]);

  const showImage = !!logoUrl && !failed;
  const local = !!logoUrl && logoUrl.startsWith('/');
  const box = size - 8; // the logo sits inside 4px of padding

  return (
    <div style={{ width: size, height: size }} className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white ${className}`}>
      {showImage && local ? (
        <Image ref={imgRef} src={logoUrl as string} alt={`${name} logo`} width={box} height={box} sizes={`${box}px`} onError={() => setFailed(true)} className="object-contain" />
      ) : showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={logoUrl as string} alt={`${name} logo`} width={box} height={box} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="object-contain" style={{ width: box, height: box }} />
      ) : (
        <span aria-hidden title={name} className="select-none font-bold text-neutral-500" style={{ fontSize: Math.max(10, Math.round(size * 0.3)) }}>
          {initialsOf(name, shortName)}
        </span>
      )}
    </div>
  );
}
