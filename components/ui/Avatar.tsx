import Image from "next/image";
import clsx from "clsx";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: 24, md: 32, lg: 40 };

export default function Avatar({
  src,
  alt,
  size = "md",
  className,
}: AvatarProps) {
  const px = sizeMap[size];

  return (
    <div
      className={clsx(
        "relative rounded-full overflow-hidden border-2 border-white bg-neutral-200 shrink-0",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-neutral-600 text-xs font-medium">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
