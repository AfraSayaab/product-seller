import React from 'react';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';
import ContactForm from './components/ContactForm';
import ContactDetails from './components/ContactDetails';
import Map from './components/Map';

const ContactPage: React.FC = () => (
  <div>
    <HeaderLayout />

    <main className="container mx-auto px-6 py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center text-pink-500">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <ContactForm />
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          <ContactDetails />
          <Map />
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default ContactPage;
