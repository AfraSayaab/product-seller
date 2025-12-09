
"use client";
import React, { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

const Accordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left px-6 py-4 bg-gray-200 text-gray-800 font-semibold focus:outline-none"
          >
            {item.question}
          </button>
          {activeIndex === index && (
            <div className="px-6 py-4 bg-gray-100 text-gray-700">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
