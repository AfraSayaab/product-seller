import React from 'react';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';
import Accordion from '@/components/Accordion';

const faqItems = [
  {
    question: "Do you accept all types of Asian attire for sale on Dazzle & Bloom?",
    answer: "No, here at Dazzle & Bloom, we accept only certain types of Asian attire, including traditional garments, modern fusion wear, and bridal wear."
  },
  {
    question: "Are there any restrictions on the condition of the Asian attire I can sell on your platform?",
    answer: "Here at Dazzle & Bloom, we encourage sellers to ensure their items are in good condition, free from significant damage or wear, to provide the best experience for buyers."
  },
  {
    question: "How do I communicate with potential buyers interested in my Asian attire?",
    answer: "You can directly communicate with buyers through our platform’s messaging system to answer any questions they may have about your listed items."
  },
  {
    question: "What shipping options are available for sellers and buyers of Asian attire on your platform?",
    answer: "At Dazzle & Bloom, we don’t suggest any specific shipping methods. Our sellers and buyers can arrange methods convenient for both parties. However, we recommend choosing reliable services with tracking options for added peace of mind."
  },
  {
    question: "Can I sell custom-made or bespoke Asian attire on Dazzle & Bloom?",
    answer: "Absolutely! Whether custom-made pieces or unique handcrafted designs, we encourage sellers to showcase their diverse Asian attire on our platform."
  },
  {
    question: "Do you offer authentication services for designer Asian attire listed on Dazzle & Bloom?",
    answer: "While we don’t provide authentication services ourselves, we encourage sellers to include any relevant authenticity details or certifications for designer items they list. As a buyer, you can access all the relevant information about the product from its description, or you can also contact the buyer for any specific detail you may need."
  },
  {
    question: "Are there any size limitations for the Asian attire I can sell or purchase on Dazzle & Bloom?",
    answer: "Here at Dazzle & Bloom, we cater to various sizes to accommodate different body types. We encourage sellers to provide accurate size information in their listings to assist buyers in making informed decisions."
  },
  {
    question: "Can I return or exchange Asian attire purchased through Dazzle & Bloom?",
    answer: "Our platform operates on a peer-to-peer selling model, so returns and exchanges are typically handled between the buyer and seller. We recommend reviewing the seller’s return policy before making a purchase."
  },
  {
    question: "How can I ensure the authenticity and quality of the Asian attire I'm interested in purchasing?",
    answer: "Here at Dazzle & Bloom, we encourage you to carefully review item descriptions, photos, and seller ratings before purchasing. You can also communicate directly with the seller for further assurance."
  },
  {
    question: "What payment methods are accepted for purchasing Asian attire on Dazzle & Bloom?",
    answer: "On our platform, all payments are made through agreed-upon payment methods between the buyer and seller. We suggest using payment methods such as PayPal or bank transfers for a secure payment process."
  },
  {
    question: "How should I determine the price for my Asian attire to ensure it sells?",
    answer: "Consider your motive for reselling, whether it’s decluttering your wardrobe, recouping expenses, supporting circular fashion, or sharing the love of a stunning outfit with another. Based on your intent to sell, setting a reasonable price for your item is crucial. Realistic pricing increases the likelihood of making a sale."
  },
  {
    question: "What are the guidelines for photographing my Asian attire for listing?",
    answer: "While you can use your smartphone for photos/videos, for the best results, consider: Including photos of yourself wearing the outfit for a better understanding of how it looks, Using a rail or mannequin to display the outfit naturally, Hanging the item against a plain background in good natural daylight, Taking pictures of ironed outfits with minimal retouching/filtering to improve sales, Uploading a detailed video against a plain/white background, along with a minimum of 5 images for each product you want to list."
  },
  {
    question: "Does Dazzle & Bloom have specific criteria for items that can be listed?",
    answer: "Yes, we curate a collection of preloved fashion, listing items that are new or as good as new, without defects, with good quality images on plain backgrounds, and have been dry-cleaned."
  },
  {
    question: "How do I list my item on Dazzle & Bloom?",
    answer: "Here at Dazzle & Bloom, we make selling preloved Asian attire and accessories simple for you. To sell your preloved item, all you have to do is provide specific information about your product, including general seller information, outfit details, measurements, photos, and packaging/payment information. Once submitted, our team will review and upload your piece directly to our platform. Just let us know if any edits or changes are needed, and we’ll take care of it promptly."
  },
  {
    question: "Are there any fees associated with selling on Dazzle & Bloom?",
    answer: "No, there are no selling fees on Dazzle & Bloom. You get to keep everything you earn from your sales, making it a profitable platform for sellers."
  },
  {
    question: "How to list my bridal Asian jewellery on the Dazzle & Bloom platform?",
    answer: "Adding your Asian bridal jewellery to our platform is as simple as making a cup of tea. All you need to do is submit detailed information about your product, such as the seller’s name, outfit details, measurements, images, and information about the packaging and payment methods. Once submitted, our team will review and upload your work directly to our platform."
  },
  {
    question: "How can I get in touch with buyers who might be interested?",
    answer: "If buyers have any questions concerning your listed items, you can answer them directly by using the messaging system on our platform."
  },
  {
    question: "Are there any guidelines for photographing my Asian bridal jewellery for listing?",
    answer: "For bridal Asian jewellery, you must upload a thorough video with a white or plain backdrop and at least five photos for each item you wish to list. We will also suggest that you post some pictures of the jewellery on your own body (if possible!)."
  },
  {
    question: "Is the platform free?",
    answer: "The Dazzle and Bloom platform is completely free for any seller who wants to make some quick money by selling their expensive bridal attire and other accessories. This platform is extremely profitable for people who are struggling financially and want to get rid of some old stuff that is taking up space in their wardrobe."
  },
  {
    question: "Are there any delivery or courier services available on this platform?",
    answer: "Unfortunately, at the moment, we do not have any inbuilt delivery or courier services available for our sellers. However, we do have a very quick and updated messaging feature that can help connect sellers with potential buyers and discuss a negotiable courier or delivery service amongst themselves before the sale."
  }
];

const FaqPage: React.FC = () => (
  <div>
    <HeaderLayout />
    <main className="container mx-auto px-6 py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center text-pink-500">Frequently Asked Questions</h1>
      <Accordion items={faqItems} />
    </main>
    <Footer />
  </div>
);

export default FaqPage;
