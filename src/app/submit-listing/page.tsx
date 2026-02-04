import React from "react";
import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import SubmitListingHero from "./components/SubmitListingHero";
import PricingPlans from "./components/PricingPlans";

export default function SubmitListingPage() {
  return (
    <div className="bg-white">
      <HeaderLayout />
      <SubmitListingHero />
      <PricingPlans />
      <Footer />
    </div>
  );
}
