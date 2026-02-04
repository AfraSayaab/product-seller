import React from "react";

const JourneyTimeline = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-14 py-24">
         <h2 className="text-3xl font-bold text-black mb-10 text-center">
  Steps
</h2>
      {[1, 2, 3].map((num) => (
        <div key={num} className="relative">

          {/* Diamond */}
          <div className="w-14 h-14 rotate-45 bg-white border-4 border-pink-500 flex items-center justify-center rounded-xl z-10">
            <span className="-rotate-45 font-bold text-lg text-pink-500">
              {num}
            </span>
          </div>

          {/* Line */}
          {num !== 3 && (
            <div className="absolute left-1/2 top-full -translate-x-1/2 w-1 h-12 bg-pink-300"></div>
          )}

        </div>
      ))}
    </div>
  );
};

export default JourneyTimeline;
