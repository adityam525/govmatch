import { Search, User } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AboutHeroButtons() {
  return (
    <div className="flex flex-wrap gap-3 mt-8">
      <Button variant="primary" size="lg" icon={<Search size={18} />}>
        Explore Jobs
      </Button>

      <Button variant="secondary" size="lg" icon={<User size={18} />}>
        Create Free Profile
      </Button>
    </div>
  );
}
