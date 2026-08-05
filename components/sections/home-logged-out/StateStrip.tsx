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

import { getStates } from "@/data/states";
import BrowseSection from "@/components/ui/browse/BrowseSection";

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

export default async function StateStrip() {
  const states = await getStates();

  return (
    <BrowseSection
      title="Browse Jobs by State"
      description="Explore Central & State Government jobs across India"
      items={states}
      iconMap={iconMap}
      getHref={(state) => `/jobs?states=${state.id}`}
      viewAllHref="/jobs"
      viewAllLabel="View All States"
      columns="md:grid-cols-4"
    />
  );
}
