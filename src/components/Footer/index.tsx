import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      {/* About Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-pink-500">About Dazzle and Bloom.</h3>
        <p className="text-sm justify">
          Unwanted Asian clothes taking up too much closet space? Update your wardrobe by selling your clothes and give them a new home! Buying and selling pre-loved outfits couldn&apos;t get easier with Dazzle and Bloom. Join us today and dazzle and bloom your wardrobe.
        </p>
      </div>

      {/* Top Categories Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-pink-500">Top Categories.</h3>
        <ul className="text-sm space-y-2">
          <li><a href="/men" className="hover:text-pink-500">Men</a></li>
          <li><a href="/women" className="hover:text-pink-500">Women</a></li>
        </ul>
      </div>

      {/* Links Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-pink-500">Links.</h3>
        <ul className="text-sm space-y-2">
          <li><a href="/my-dashboard" className="hover:text-pink-500">My Dashboard</a></li>
          <li><a href="/submit-listing" className="hover:text-pink-500">Submit Listing</a></li>
          <li><a href="/login" className="hover:text-pink-500">Login</a></li>
          <li><a href="/register" className="hover:text-pink-500">Register</a></li>
        </ul>
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-pink-500">Info.</h3>
        <ul className="text-sm space-y-2">
          <li><a href="/contact" className="hover:text-pink-500">Contact</a></li>
          <li><a href="/about-us" className="hover:text-pink-500">About Us</a></li>
          <li><a href="/privacy-policy" className="hover:text-pink-500">Privacy Policy</a></li>
          <li><a href="/blog" className="hover:text-pink-500">Blog</a></li>
          <li><a href="/faq" className="hover:text-pink-500">FAQ</a></li>
        </ul>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="mt-12 border-t border-gray-700 pt-6 text-center">
      <p className="text-sm">&copy; 2024 DazzleandBloom. All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;
