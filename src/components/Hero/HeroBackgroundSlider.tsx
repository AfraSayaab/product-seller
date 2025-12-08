// components/hero/HeroBackgroundSlider.tsx
import { memo } from "react";
import Image from "next/image";
import type { HeroSlide } from "./heroSlides";

type Props = {
  slides: HeroSlide[];
  activeIndex: number;
};

const HeroBackgroundSliderComponent = ({ slides, activeIndex }: Props) => (
  <div className="absolute inset-0">
    {slides.map((slide, index) => (
      <div
        key={slide.id}
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          index === activeIndex ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src={slide.image}
          alt={slide.headline}
          fill
          priority={index === 0}
          className="object-cover"
        />
      </div>
    ))}
    <div className="absolute inset-0 bg-black/35" />
  </div>
);

export const HeroBackgroundSlider = memo(HeroBackgroundSliderComponent);
