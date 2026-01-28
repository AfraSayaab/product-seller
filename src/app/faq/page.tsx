
import React from "react";
import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import Accordion from "./components/Accordion";


const faqItems = [
  {
    question: "Do you accept all types of Asian attire for sale on Dazzle & Bloom?",
    answer:
      "No, here at Dazzle & Bloom, we accept only certain types of Asian attire, including traditional garments, modern fusion wear, and bridal wear.",
  },
  {
    question:
      "Are there any restrictions on the condition of the Asian attire I can sell on your platform?",
    answer:
      "Here at Dazzle & Bloom, we encourage sellers to ensure their items are in good condition, free from significant damage or wear, to provide the best experience for buyers.",
  },
  {
    question:
      "How do I communicate with potential buyers interested in my Asian attire?",
    answer:
      "You can directly communicate with buyers through our platform’s messaging system to answer any questions they may have about your listed items.",
  },
  {
    question:
      "What shipping options are available for sellers and buyers of Asian attire on your platform?",
    answer:
      "At Dazzle & Bloom, we don’t suggest any specific shipping methods. Our sellers and buyers can arrange methods convenient for both parties. However, we recommend choosing reliable services with tracking options for added peace of mind.",
  },
  {
    question:
      "Can I sell custom-made or bespoke Asian attire on Dazzle & Bloom?",
    answer:
      "Absolutely! Whether custom-made pieces or unique handcrafted designs, we encourage sellers to showcase their diverse Asian attire on our platform.",
  },
  {
    question:
      "Do you offer authentication services for designer Asian attire listed on Dazzle & Bloom?",
    answer:
      "While we don’t provide authentication services ourselves, we encourage sellers to include any relevant authenticity details or certifications for designer items they list.",
  },
  {
    question:
      "Are there any size limitations for the Asian attire I can sell or purchase on Dazzle & Bloom?",
    answer:
      "Here at Dazzle & Bloom, we cater to various sizes to accommodate different body types. We encourage sellers to provide accurate size information in their listings.",
  },
  {
    question:
      "Can I return or exchange Asian attire purchased through Dazzle & Bloom?",
    answer:
      "Our platform operates on a peer-to-peer selling model, so returns and exchanges are typically handled between the buyer and seller.",
  },
  {
    question:
      "How can I ensure the authenticity and quality of the Asian attire I'm interested in purchasing?",
    answer:
      "Here at Dazzle & Bloom, we encourage you to carefully review item descriptions, photos, and seller ratings before purchasing. You can also communicate directly with the seller for further assurance.",
  },
  {
    question:
      "What payment methods are accepted for purchasing Asian attire on Dazzle & Bloom?",
    answer:
      "On our platform, all payments are made through agreed-upon payment methods between the buyer and seller. We suggest using payment methods such as PayPal or bank transfers for a secure payment process.",
  },
  {
    question:
      "How should I determine the price for my Asian attire to ensure it sells?",
    answer:
      "Consider your motive for reselling, whether it’s decluttering your wardrobe, recouping expenses, supporting circular fashion, or sharing the love of a stunning outfit with another. Setting a reasonable and realistic price increases the likelihood of making a sale.",
  },
  {
    question:
      "What are the guidelines for photographing my Asian attire for listing?",
    answer:
      "For best results: include photos of yourself wearing the outfit, use a rail or mannequin, shoot against a plain background in natural daylight, ensure outfits are ironed, avoid heavy filters, upload a detailed video, and provide at least five images per product.",
  },
  {
    question:
      "Does Dazzle & Bloom have specific criteria for items that can be listed?",
    answer:
      "Yes, we curate a collection of preloved fashion that is new or as good as new, without defects, supported by good quality images on plain backgrounds, and dry-cleaned.",
  },
  {
    question: "How do I list my item on Dazzle & Bloom?",
    answer:
      "To sell your preloved item, provide seller information, outfit details, measurements, photos, and packaging/payment information. Once submitted, our team will review and upload your piece to the platform.",
  },
  {
    question: "Are there any fees associated with selling on Dazzle & Bloom?",
    answer:
      "No, there are no selling fees on Dazzle & Bloom. You get to keep everything you earn from your sales.",
  },
  {
    question:
      "How can I get in touch with buyers who might be interested?",
    answer:
      "If buyers have questions regarding your listed items, you can respond directly through the platform’s messaging system.",
  },
  {
    question: "Is the platform free?",
    answer:
      "Yes, the Dazzle & Bloom platform is completely free for sellers who want to sell their preloved Asian attire and accessories.",
  },
  {
    question:
      "Are there any delivery or courier services available on this platform?",
    answer:
      "Currently, we do not offer inbuilt courier services. However, sellers and buyers can arrange delivery methods directly using our messaging feature.",
  },
];

const FaqPage: React.FC = () => (
  <div className="bg-white">
    <HeaderLayout />

    <main className="mx-auto max-w-6xl px-6 py-24 space-y-16">

      {/* Heading Section */}
      <div className="text-center space-y-4">

        {/* Tag */}
        <span className="inline-block rounded-full border border-pink-500 px-4 py-1 text-sm font-medium text-pink-500">
          FAQ’s
        </span>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-pink-500">
          Frequently Asked Questions
        </h1>

        {/* Sub Heading */}
        <p className="mx-auto max-w-xl text-gray-600">
          Find quick answers to common questions about buying and selling on
          Dazzle & Bloom.
        </p>
      </div>

      {/* FAQ Grid */}
      <Accordion items={faqItems} />

    </main>

    <Footer />
  </div>
);

export default FaqPage;
