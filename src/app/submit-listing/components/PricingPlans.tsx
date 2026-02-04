import React from "react";
import PlanCard from "./PlanCard";

const PricingPlans = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <PlanCard
          id="2"
          title="Free"
          price="Free"
          packageUrl="https://dazzleandbloom.co.uk/submit-listing/?package=2"
          features={[
            { label: "Sticky", available: false },
            { label: "Featured", available: false },
            { label: "1 category", available: true },
            { label: "Up to 8 images", available: true },
            { label: "No videos", available: true },
          ]}
        />

        <PlanCard
          id="3"
          title="Featured"
          price="£2.99"
          duration="/ 7 days"
          packageUrl="https://dazzleandbloom.co.uk/submit-listing/?package=3"
          popular
          features={[
            { label: "Sticky", available: true },
            { label: "Featured", available: true },
            { label: "Up to 2 categories", available: true },
            { label: "Up to 8 images", available: true },
            { label: "1 video", available: true },
          ]}
        />

        <PlanCard
          id="4"
          title="Spotlight 🚀"
          price="£5.99"
          duration="/ 7 days"
          packageUrl="https://dazzleandbloom.co.uk/submit-listing/?package=4"
          features={[
            { label: "Sticky", available: true },
            { label: "Featured", available: true },
            { label: "Up to 2 categories", available: true },
            { label: "Up to 8 images", available: true },
            { label: "1 video", available: true },
          ]}
        />

      </div>
    </section>
  );
};

export default PricingPlans;
