import Image from "next/image";
import { HeroLanding } from "@/components/Hero";
import SpotlightWardrobeCarousel from "@/components/card/spotlight-wardrobe-carousel";
import SearchMoreOutfit from "@/components/card/search-more-outfit";
export default function Home() {
  return (
    <>
      <HeroLanding />
      <SpotlightWardrobeCarousel/>
      <SearchMoreOutfit/>
    </>
  );
}
