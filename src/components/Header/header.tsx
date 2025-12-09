// components/hero/HeroLanding.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDES } from "../Hero/heroSlides";
import { HeroBackgroundSlider } from "../Hero/HeroBackgroundSlider";
import { Header } from ".";
import { HeroContent } from "../Hero/HeroContent";
import { SideDrawer } from "../Hero/SideDrawer";
import { Backdrop } from "../Hero/Backdrop";

export const HeaderLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <section className="relative w-full overflow-hidden text-black">

      <Header onOpenMenu={openMenu} />

      {/* <HeroContent slide={activeSlide} /> */}

      <SideDrawer isOpen={isMenuOpen} onClose={closeMenu} />

      <Backdrop isOpen={isMenuOpen} onClick={closeMenu} />
    </section>
  );
};
