import React from 'react';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';
import SearchMoreOutfit from "@/components/card/search-more-outfit";
const listings: React.FC = () => (
  <div>
    <HeaderLayout />

  
    {/* Main Content */}
    <main className="container mx-auto px-6 py-12 space-y-12 font-serif">
        <SearchMoreOutfit/>
    </main>

    <Footer />
  </div>
);

export default listings;
