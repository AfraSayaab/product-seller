import React from "react";
import { Search, ShoppingBag, Smile } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Search for it",
    desc: "Browse thousands of unique pre-loved outfits on Dazzle & Bloom.",
   
    icon: <Search className="w-6 h-6 text-black" />,
  },
  {
    number: "02",
    title: "Purchase it",
    desc: "Ask questions and pay the seller directly via an agreed method.",
    
    icon: <ShoppingBag className="w-6 h-6 text-black" />,
  },
  {
    number: "03",
    title: "Wear it",
    desc: "Enjoy your outfit and leave a review for the seller.",

    icon: <Smile className="w-6 h-6 text-black" />,
  },
];

const BuyerJourney: React.FC = () => {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 space-y-14">
      <h2 className="text-3xl font-bold text-black mb-10 text-center">
  Buyer Journey
</h2>

        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-center justify-end">

            {/* Rectangle (LEFT) */}
            <div
              className={`flex-1 -mr-6 h-24 bg-pink-500  border-4 border-pink-500 rounded-2xl flex items-center px-10 shadow-md justify-end text-right`}
            >
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">
                  {step.title}
                </h3>
                <p className="text-white text-sm opacity-90">
                  {step.desc}
                </p>
              </div>
            </div>

            {/* Diamond (RIGHT) */}
            <div
              className={`w-16 h-16 rotate-45 bg-white border-4  border-pink-500 flex items-center justify-center z-10 rounded-xl`}
            >
              <span className="-rotate-45 text-lg font-bold flex items-center gap-1">
                {step.icon}
              </span>
            </div>

            {/* Connector top */}
            <div className="absolute -top-4 right-20 flex items-center gap-2 flex-row-reverse">
              <span className={`w-2 h-2 rounded-full bg-pink-500`}></span>
              <span className={`w-32 h-1 rounded-full bg-pink-500`}></span>
              <span className={`w-2 h-2 rounded-full bg-pink-500`}></span>
            </div>

            {/* Connector bottom */}
            <div className="absolute -bottom-4 right-20 flex items-center gap-2 flex-row-reverse">
              <span className={`w-2 h-2 rounded-full bg-pink-500`}></span>
              <span className={`w-32 h-1 rounded-full bg-pink-500`}></span>
              <span className={`w-2 h-2 rounded-full bg-pink-500`}></span>
            </div>

          </div>
        ))}
        <div className="text-center mt-16">
  <button className="border-2 border-pink-500 text-pink-500 px-10 py-3 rounded-full font-semibold transition hover:bg-black hover:border-black hover:text-white">
    Shop Outfits
  </button>
</div>

      </div>
    </section>
  );
};

export default BuyerJourney;
