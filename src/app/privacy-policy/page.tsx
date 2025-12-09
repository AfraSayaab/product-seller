import React from 'react';
import { HeaderLayout } from '@/components/Header/header';
import Footer from '@/components/Footer';

const PrivacyPolicy: React.FC = () => (
  <div>
    <HeaderLayout />

    <main className="container mx-auto px-6 py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center text-pink-500">Privacy Policy</h1>
      <p className=" text-gray-600">Last Updated: January 18, 2023</p>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Introduction</h2>
        <p className="text-gray-700">
          At Dazzle and Bloom, we are committed to protecting your privacy. This Privacy Policy applies to our website, <strong>[dazzleandbloom.co.uk]</strong>, and our mobile application, and explains how we collect, use, and disclose your personal information. By using our website or mobile application, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Information We Collect</h2>
        <p className="text-gray-700">
          We may collect personal information from you when you:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Use our website or mobile application</li>
          <li>Create an account</li>
          <li>Place an order</li>
          <li>Contact customer service</li>
          <li>Participate in a survey or contest</li>
        </ul>

        <p className="mt-4 text-gray-700">The types of personal information we may collect include:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Contact information (such as name, email address, and phone number)</li>
          <li>Payment information (such as credit card number and billing address)</li>
          <li>Demographic information (such as age and gender)</li>
          <li>Information about your preferences and interests</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Use of Information</h2>
        <p className="text-gray-700">
          We may use your personal information for the following purposes:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>To provide you with products and services</li>
          <li>To process and fulfill your orders</li>
          <li>To communicate with you about your account and orders</li>
          <li>To send promotional emails and other marketing communications</li>
          <li>To improve our website and mobile application</li>
          <li>To conduct surveys and research</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Disclosure of Information</h2>
        <p className="text-gray-700">
          We may disclose your personal information to third parties for the following purposes:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>To fulfill your orders and provide you with products and services</li>
          <li>To process payments</li>
          <li>To conduct surveys and research</li>
          <li>To comply with legal requirements, such as a subpoena or court order</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Security</h2>
        <p className="text-gray-700">
          We take reasonable steps to protect your personal information from unauthorized access, use, or disclosure. However, no security measures are completely foolproof, and we cannot guarantee the security of your personal information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Changes to This Privacy Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website and mobile application. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-500">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:hello@dazzleandbloom.co.uk" className="text-pink-500">hello@dazzleandbloom.co.uk</a>.
        </p>
      </section>
    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
