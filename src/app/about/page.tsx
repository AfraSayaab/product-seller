import React from 'react';
import HowItWorks from './components/HowItWorks';
import SellerJourney from './components/SellerJourney';
import BuyerJourney from './components/BuyerJourney';
import JourneyTimeline from "./components/JourneyTimeline";

import { HeaderLayout } from '@/components/Header/header';
import Footer from "@/components/Footer";

export default function AboutUs() {
  return (
    <>
      <HeaderLayout />
      <main className='font-serif'>
        <HowItWorks />

        <section className="py-1">
          <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 md:grid-cols-[1fr_auto_1fr] items-start">
  <BuyerJourney />
  <JourneyTimeline />
  <SellerJourney />
</div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
