import React from 'react';

const HowItWorks: React.FC = () => (
  <section className="text-center py-16">
    <h2 className="text-3xl font-bold text-pink-500 mb-6">How Dazzle and Bloom works</h2>
    <p className="text-xl mb-12">Unwanted asian clothes taking up too much closet space? Update your wardrobe by selling your clothes and give them a new home! Buying and selling pre-loved outfits couldn't get more easier with Dazzle and Bloom.</p>
    <div className="flex justify-center gap-5">
      <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-400">Submit Listing</button>
      <button className="bg-white text-pink-500 px-6 py-2 rounded-full hover:bg-gray-200">Shop Outfits</button>
    </div>
  </section>
);

export default HowItWorks;
