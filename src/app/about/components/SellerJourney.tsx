import React from "react";
import { Upload, Truck, Wallet } from "lucide-react";

const steps = [
  {
    title: "Free Listing",
    desc: "Upload your photos/videos in minutes. Describe the item you are selling, give it a price and tap upload – your item is now live.",
    icon: <Upload className="w-6 h-6 text-black" />,
  },
  {
    title: "Sell & Ship",
    desc: "Congratulations! On selling your item. Please arrange a convenient shipping method with the buyer.",
    icon: <Truck className="w-6 h-6 text-black" />,
  },
  {
    title: "Payday Time!",
    desc: "With zero selling fees you get to keep everything you earn.",
    icon: <Wallet className="w-6 h-6 text-black" />,
  },
];

const SellerJourney: React.FC = () => {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 space-y-14">
      <h2 className="text-3xl font-bold text-black mb-10 text-center">
  Seller Journey
</h2>

        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-center">

            {/* Diamond */}
            <div className="w-16 h-16 rotate-45 bg-white border-4 border-pink-500 flex items-center justify-center z-10 rounded-xl">
              <span className="-rotate-45">
                {step.icon}
              </span>
            </div>

            {/* Rectangle */}
            <div className="flex-1 -ml-6 h-24 bg-pink-500 rounded-2xl flex items-center px-10 shadow-md">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">
                  {step.title}
                </h3>
                <p className="text-white text-sm opacity-90">
                  {step.desc}
                </p>
              </div>
            </div>

            {/* Connector lines */}
            <div className="absolute -top-4 left-20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span className="w-32 h-1 rounded-full bg-pink-400"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            </div>

            <div className="absolute -bottom-4 left-20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span className="w-32 h-1 rounded-full bg-pink-400"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            </div>

          </div>
        ))}
          <div className="text-center mt-16">
  <button className="border-2 border-pink-500 text-pink-500 px-10 py-3 rounded-full font-semibold transition hover:bg-black hover:border-black hover:text-white">
    Submit Listing
  </button>
</div>
      </div>
    </section>
  );
};

export default SellerJourney;
