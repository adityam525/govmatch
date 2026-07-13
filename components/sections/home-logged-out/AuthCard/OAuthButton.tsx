import { ReactNode } from "react";
import Button from "@/components/ui/Button";

interface OAuthButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export default function OAuthButton({
  icon,
  label,
  onClick,
}: OAuthButtonProps) {
  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      icon={icon}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
