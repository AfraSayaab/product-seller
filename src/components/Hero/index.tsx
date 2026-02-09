// components/hero/HeroLanding.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDES } from "./heroSlides";
import { HeroBackgroundSlider } from "./HeroBackgroundSlider";
import { Header } from "../Header";
import { HeroContent } from "./HeroContent";
import { SideDrawer } from "./SideDrawer";
import { Backdrop } from "./Backdrop";

export const HeroLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance slider every 1s
  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const activeSlide = HERO_SLIDES[activeIndex];

  return (
    <section className="relative h-screen w-full overflow-hidden text-white">

      <HeroBackgroundSlider slides={HERO_SLIDES} activeIndex={activeIndex} />

      <Header onOpenMenu={openMenu} />

      <HeroContent slide={activeSlide} />

      <SideDrawer isOpen={isMenuOpen} onClose={closeMenu} />

      <Backdrop isOpen={isMenuOpen} onClick={closeMenu} />
    </section>
  );
};
