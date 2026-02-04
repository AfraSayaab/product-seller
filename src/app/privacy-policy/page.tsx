import React from "react";
import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-black">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const PrivacyPolicy: React.FC = () => (
  <div className="bg-white">
    <HeaderLayout />

    {/* Hero */}
    <section className="bg-linear-to-b from-pink-50 via-white to-white py-12">
      <div className="mx-auto max-w-4xl px-6 text-center space-y-4">
        <span className="inline-block rounded-full border border-pink-500 px-4 py-1 text-sm font-medium text-pink-500">
          Legal
        </span>

        <h1 className="text-4xl font-semibold text-black">
          Privacy Policy
        </h1>

        <p className="text-gray-600">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </section>

    {/* Content */}
    <main className="mx-auto max-w-4xl px-6 pb-24 space-y-12">

      <Section title="Introduction">
        <p>
          At Dazzle & Bloom, we are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit{" "}
          <strong>https://www.dazzleandbloom.co.uk</strong>.
          By using our website or services, you agree to the terms outlined
          in this policy.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>We may collect personal information when you:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Browse or use our website</li>
          <li>Create an account</li>
          <li>Place an order</li>
          <li>Contact customer support</li>
          <li>Subscribe to our newsletter</li>
        </ul>

        <p>This information may include:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Name, email address, and phone number</li>
          <li>Billing and payment information</li>
          <li>Shipping address</li>
          <li>Preferences and communication history</li>
          <li>Technical data such as IP address and browser type</li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and maintain our services</li>
          <li>Process transactions and fulfill orders</li>
          <li>Communicate regarding accounts and purchases</li>
          <li>Send marketing communications (with consent)</li>
          <li>Improve platform functionality and security</li>
        </ul>
      </Section>

      <Section title="Disclosure of Information">
        <p>We may share your information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Trusted service providers and partners</li>
          <li>Payment processors and logistics providers</li>
          <li>Legal or regulatory authorities when required by law</li>
        </ul>
      </Section>

      <Section title="Cookies and Tracking Technologies">
        <p>
          We use cookies and similar technologies to enhance your browsing
          experience, analyze website traffic, and personalize content.
          You can control cookies through your browser settings.
        </p>
      </Section>

      <Section title="Data Security">
        <p>
          We implement reasonable technical and organizational measures to
          protect your personal data. However, no method of transmission
          over the internet is completely secure, and we cannot guarantee
          absolute security.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>You may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal data</li>
          <li>Request correction or deletion</li>
          <li>Object to or restrict processing</li>
          <li>Withdraw consent at any time</li>
          <li>Request data portability</li>
        </ul>
      </Section>

      <Section title="Children’s Privacy">
        <p>
          Our services are not intended for children under the age of 13.
          We do not knowingly collect personal information from children.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Updates will
          be posted on this page, and continued use of our services
          constitutes acceptance of those changes.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions regarding this Privacy Policy, please
          contact us at{" "}
          <a
            href="mailto:hello@dazzleandbloom.co.uk"
            className="font-medium text-pink-500 underline"
          >
            hello@dazzleandbloom.co.uk
          </a>
          .
        </p>
      </Section>

    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
