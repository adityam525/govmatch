import AvatarStack from "@/components/ui/AvatarStack";

const avatars = [{ alt: "User 1" }, { alt: "User 2" }, { alt: "User 3" }];

export default function SocialProofStrip() {
  return (
    <div className="flex items-center gap-3 mt-4">
      <AvatarStack avatars={avatars} />
      <p className="text-sm text-neutral-600">
        Over <span className="font-semibold text-neutral-900">1.2L+</span>{" "}
        aspirants already using GovMatch
      </p>
    </div>
  );
}
