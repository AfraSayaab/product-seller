import React from 'react';
import HowItWorks from './components/HowItWorks';
import SellerJourney from './components/SellerJourney';
import BuyerJourney from './components/BuyerJourney';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';
const AboutUs: React.FC = () => (
    <>
        <HeaderLayout />
        <main className="bg-gray-50">
            <div className="container mx-auto px-4">
                <HowItWorks />
                <SellerJourney />
                <BuyerJourney />
            </div>
        </main>
        <Footer />
    </>
);

export default AboutUs;
