import React from 'react';

const BuyerJourney: React.FC = () => (
  <section className="flex justify-center gap-16 py-16">
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/search-icon.svg" alt="Search Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">1. Search for it</h3>
      <p>Visit the amazing Dazzle & Bloom website, join hundreds of thousands of individuals and browse through our unique collection.</p>
    </div>
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/shopping-bag-icon.svg" alt="Shopping Bag Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">2. Purchase it</h3>
      <p>Ask the seller any questions you have about the product being listed. Pay the seller directly via an agreed method.</p>
    </div>
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/wear-icon.svg" alt="Wear Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">3. Wear it</h3>
      <p>Now that you have your item, enjoy your purchase and don't forget to leave a review for the seller!</p>
    </div>
  </section>
);

export default BuyerJourney;
