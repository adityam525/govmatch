import HotNewsBanner from './HotNewsBanner';
import StickyHotNewsOnScroll from './StickyHotNewsOnScroll';

// Homepage banner: inline above Latest Jobs, with a pinned copy that appears
// under the header once you scroll past it.
export default function HomeHotNews() {
  return <StickyHotNewsOnScroll inline={<HotNewsBanner />} pinned={<HotNewsBanner />} />;
}
