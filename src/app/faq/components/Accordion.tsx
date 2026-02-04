"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface Item {
  question: string;
  answer: string;
}

const Accordion: React.FC<{ items: Item[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className="rounded-2xl border border-pink-300 bg-white p-6 transition-all"
          >
            {/* Question */}
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div className="flex items-start gap-3">
                {/* Left Pink Icon */}
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                  ?
                </span>

                <span className="font-medium text-black">
                  {item.question}
                </span>
              </div>

              {/* Plus / Minus */}
              <span className="text-pink-500">
                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
              </span>
            </button>

            {/* Answer */}
            <div
              className={`grid overflow-hidden transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden text-black leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
