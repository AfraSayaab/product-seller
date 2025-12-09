import React from 'react';

const ContactDetails: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-pink-500 text-black">Contact Information</h2>
    <p className="text-black">Have questions? Feel free to reach out to us using the details below:</p>
    
    <div className="text-black space-y-4">
      <p><strong>Address:</strong> 123 Dazzle St, Suite 456, Cityville, ABC</p>
      <p><strong>Email:</strong> support@dazzleandbloom.com</p>
      <p><strong>Phone:</strong> +1 (123) 456-7890</p>
    </div>
  </div>
);

export default ContactDetails;
