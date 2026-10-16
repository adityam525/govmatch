import {
  Building2,
  Castle,
  Church,
  Landmark,
  MapPin,
  Mountain,
  TreePalm,
  Trees,
  Waves,
} from "lucide-react";

import { getStates, type StateItem } from "@/data/states";
import BrowseSection from "@/components/ui/browse/BrowseSection";
import { prisma } from "@/lib/prisma";

const iconMap = {
  building: Building2,
  castle: Castle,
  temple: Church,
  heritage: Landmark,
  mountain: Mountain,
  coast: Waves,
  nature: TreePalm,
  trees: Trees,
  location: MapPin,
} as const;

type StateRow = StateItem & {
  logo?: { name: string; shortName?: string | null; logoUrl?: string | null };
};

export default async function StateStrip() {
  const states = await getStates();

  // States keep their decorative icon until a logo file has been linked.
  const logos = new Map<string, string>();
  try {
    const rows = await prisma.state.findMany({ select: { code: true, logoUrl: true } });
    for (const row of rows) if (row.logoUrl) logos.set(row.code, row.logoUrl);
  } catch (error) {
    console.error("StateStrip: could not load logos", error);
  }

  const items: StateRow[] = states.map((s) => {
    const logoUrl = logos.get(s.code);
    return logoUrl ? { ...s, logo: { name: s.title, shortName: s.code, logoUrl } } : s;
  });

  return (
    <BrowseSection
      title="Browse Jobs by State"
      description="Explore Central & State Government jobs across India"
      items={items}
      iconMap={iconMap}
      getHref={(state) => `/jobs?states=${state.code}`}
    />
  );
}
