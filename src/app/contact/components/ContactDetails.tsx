import React from "react";

const ContactDetails: React.FC = () => {
  return (
    <div className="space-y-10 max-w-md">
      
      {/* Heading */}
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-gray-900 pt-10">
          Get in touch
        </h2>

        <p className="text-gray-500 leading-relaxed">
          We’re here to help, answer questions, or just chat about anything
          Dazzle & Bloom.
        </p>
      </div>

      {/* Soft divider */}
      <div className="h-px w-full bg-linear-to-r from-pink-400 via-gray-300 to-transparent" />

      {/* Details */}
      <div className="space-y-7">
        
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Address
          </p>
          <p className="text-gray-800 leading-relaxed">
            123 Dazzle St, Suite 456<br />
            Cityville, ABC
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Email
          </p>
          <a
            href="mailto:support@dazzleandbloom.com"
            className="text-gray-800 transition hover:text-pink-400"
          >
            support@dazzleandbloom.com
          </a>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Phone
          </p>
          <a
            href="tel:+11234567890"
            className="text-gray-800 transition hover:text-pink-400"
          >
            +1 (123) 456-7890
          </a>
        </div>

      </div>
    </div>
  );
};

export default ContactDetails;
