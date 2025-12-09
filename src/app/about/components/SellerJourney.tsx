import React from 'react';

const SellerJourney: React.FC = () => (
  <section className="flex justify-center gap-16 py-16">
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/dress-icon.svg" alt="Dress Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">1. Free listing</h3>
      <p>Upload your photos/videos in minutes. Describe the item you are selling, give it a price, and tap upload. Your item is now live!</p>
    </div>
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/truck-icon.svg" alt="Truck Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">2. Sell & Ship</h3>
      <p>Congratulations! On selling your item. Please arrange a convenient shipping method with the Buyer.</p>
    </div>
    <div className="flex flex-col items-center text-center">
      <img src="/path/to/payday-icon.svg" alt="Payday Icon" className="w-16 h-16 mb-4"/>
      <h3 className="font-bold text-xl">3. Payday time!</h3>
      <p>With zero selling fees, you get to keep everything you earn.</p>
    </div>
  </section>
);

export default SellerJourney;
