import Avatar from "./Avatar";

interface AvatarStackProps {
  avatars: { src?: string; alt: string }[];
  max?: number;
}

export default function AvatarStack({ avatars, max = 3 }: AvatarStackProps) {
  const visible = avatars.slice(0, max);

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((avatar, i) => (
        <Avatar key={i} src={avatar.src} alt={avatar.alt} size="sm" />
      ))}
    </div>
  );
}
