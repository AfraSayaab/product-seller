import React from 'react';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';
import SpotlightWardrobeCarousel from '@/components/card/spotlight-wardrobe-carousel';

const spotlight: React.FC = () => (
  <div>
    <HeaderLayout />

    {/* Hero Section */}
    <section
      className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-image1.webp')" }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6 text-white font-serif">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Spotlight Your Wardrobe
        </h1>

        <p className="text-lg md:text-xl leading-relaxed opacity-90">
          Unwanted Asian clothes taking up too much closet space?
          Update your wardrobe by selling your clothes and give them a new home.
          Buying and selling pre-loved outfits couldn’t get easier with
          <span className="font-semibold"> Dazzle & Bloom</span>.
          Join us today and dazzle & bloom your wardrobe.
        </p>
      </div>
    </section>

    {/* Main Content */}
    <main className="container mx-auto px-6 py-12 space-y-12 font-serif">
      <SpotlightWardrobeCarousel />
    </main>

    <Footer />
  </div>
);

export default spotlight;
