// components/hero/heroSlides.ts

export type HeroSlide = {
  id: string;
  image: string;
  headline: string;
  subheadline: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "juttis",
    image: "/hero-image1.webp",
    headline: "Get That Outfit Sorted!",
    subheadline: "Search our wide range now",
  },
  {
    id: "groom-turban",
    image: "/hero-image2.webp",
    headline: "Dazzle At Every Event",
    subheadline: "Discover outfits for every occasion",
  },
  {
    id: "family-look",
    image: "/hero-image3.webp",
    headline: "Style For The Whole Family",
    subheadline: "From men to kids, we’ve got you covered",
  },
];
