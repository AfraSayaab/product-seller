// components/hero/HeroContent.tsx
import type { HeroSlide } from "./heroSlides";
import { MessageCircle, ArrowRightIcon } from "lucide-react";

type Props = {
  slide: HeroSlide;
};

export const HeroContent = ({ slide }: Props) => {
  return (
    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-40 lg:py-12  py-2 gap-2 lg:gap-12">

      {/* Left Side: Text + Buttons */}
      <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
        <p className="text-pink-500 font-bold text-sm sm:text-base">THE LUXURY PRELOVED MARKETPLACE</p>
        <h1 className="max-w-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic uppercase tracking-wider mx-auto lg:mx-0">
          {slide.headline.split(" ").map((word, i) =>
            i === 1 ? <span key={i} className="text-pink-500">{word} </span> : word + " "
          )}
        </h1>
        <p className="text-lg sm:text-xl max-w-md mx-auto lg:mx-0">{slide.subheadline}</p>

        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2 mt-6">
          <button className="bg-pink-500 text-white px-6 py-3 rounded-4xl font-semibold transition-colors hover:bg-black">
            Explore Collection
          </button>
          <button className="border border-white text-white px-6 py-3 rounded-4xl font-semibold transition-colors hover:bg-pink-500">
            Sell With Us
          </button>
        </div>
      </div>

      {/* Right Side: Chat Card */}
      <div className="flex-1 flex justify-center lg:justify-end w-full">
        <div className="bg-[#2a1e1a] rounded-2xl p-6 w-full max-w-sm flex flex-col justify-between">

          {/* Card Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pink-500 w-10 h-10 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold">BloomBot</p>
              <p className="text-pink-500 text-xs uppercase tracking-widest">AI CONCIERGE</p>
            </div>
          </div>
          {/* Card Body: Quotation */}
          <div className="hidden lg:block p-4 mb-4 relative text-white lg:my-14">
            <p className="text-sm">&quot;Tell me your wedding style vision, and I&apos;ll find your perfect match.&quot;</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="border border-white text-white px-3 py-1 rounded-full text-xs hover:bg-white hover:text-black transition">
                Sangeet outfit?
              </button>
              <button className="border border-white text-white px-3 py-1 rounded-full text-xs hover:bg-white hover:text-black transition">
                Red vs Gold?
              </button>
            </div>
          </div>


          {/* Card Footer: Input */}
          <div className="bg-[#4b3c37] rounded-full p-1 flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 px-4 py-2 rounded-full text-black placeholder-gray-400 focus:outline-none"
            />
            <button className="bg-pink-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black transition">
              <ArrowRightIcon className="text-white w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
