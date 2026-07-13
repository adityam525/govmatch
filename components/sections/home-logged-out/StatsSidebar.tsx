import { Users, UserCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/shared/StatCard";
import { colors } from "@/styles/tokens";

const stats = [
  {
    icon: <Users size={18} />,
    iconBg: colors.primary[600],
    value: "1.2L+",
    label: "Registered Users",
  },
  {
    icon: <UserCheck size={18} />,
    iconBg: colors.accent.purple,
    value: "25K+",
    label: "Daily Job Alerts Sent",
  },
  {
    icon: <RefreshCcw size={18} />,
    iconBg: colors.accent.green,
    value: "700+",
    label: "Daily Job Updates",
  },
  {
    icon: <ShieldCheck size={18} />,
    iconBg: colors.accent.green,
    value: "98%",
    label: "User Satisfaction",
  },
];

export default function StatsSidebar() {
  return (
    <Card padding="lg">
      <h3 className="text-lg font-bold text-neutral-900 mb-1">
        GovMatch in Numbers
      </h3>
      <div className="divide-y divide-neutral-100">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <Button variant="primary" size="md" fullWidth className="mt-4">
        Join Thousands of Aspirants
      </Button>
    </Card>
  );
}
