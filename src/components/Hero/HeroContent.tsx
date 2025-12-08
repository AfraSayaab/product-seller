// components/hero/HeroContent.tsx
import type { HeroSlide } from "./heroSlides";

type Props = {
  slide: HeroSlide;
};

export const HeroContent = ({ slide }: Props) => (
  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
    <h1 className="max-w-4xl text-3xl font-bold uppercase tracking-[0.15em] sm:text-4xl md:text-5xl lg:text-6xl">
      {slide.headline}
    </h1>
    <p className="mt-6 text-lg font-light sm:text-xl">
      {slide.subheadline}
    </p>
  </div>
);
