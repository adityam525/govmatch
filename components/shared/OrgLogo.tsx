'use client';

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
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

// Shows the organization's logo when it has one and the file loads, otherwise
// its initials, so a missing or broken logo never leaves an empty box.
export default function OrgLogo({ name, shortName, logoUrl, size = 40, className = '' }: OrgLogoProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  // A server-rendered image can fail before React attaches onError, so check once on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [logoUrl]);

  const showImage = !!logoUrl && !failed;

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white ${className}`}
    >
      {showImage ? (
        <img
          ref={imgRef}
          src={logoUrl as string}
          alt={`${name} logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          aria-hidden
          title={name}
          className="select-none font-bold text-neutral-500"
          style={{ fontSize: Math.max(10, Math.round(size * 0.3)) }}
        >
          {initialsOf(name, shortName)}
        </span>
      )}
    </div>
  );
}
