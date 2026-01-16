import React from "react";
import { Mail, Globe, Phone } from "lucide-react";
import Image from "next/image";

interface SellerDetailInfoProps {
  name?: string;
  memberSince?: string;
  mobile?: string;
  email?: string;
  website?: string;
  profileImage?: string;
}

const SellerDetailInfo: React.FC<SellerDetailInfoProps> = ({
  name = "Shanice",
  memberSince = "Jun 17, 2024",
  mobile = "+44 123 456 789",
  email = "shanice@example.com",
  website = "www.dazzleandbloom.co.uk",
}) => {
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-black rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* LEFT: Profile Image */}
<div className="flex justify-center md:justify-start">
  <div className="relative w-48 h-48 rounded-full border-4 border-pink-500 overflow-hidden shadow-md">
    <Image
  src="/profile.jpg" // adjust path to match actual file
  alt="Shanice"
  width={192}
  height={192}
/>

  </div>
</div>


        {/* RIGHT: Seller Info */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-4 text-white font-serif">
          <h2 className="text-3xl font-bold text-pink-500">{name}</h2>
          <p className="text-gray-400">Member since {memberSince}</p>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-200">
              <Phone className="h-5 w-5 text-pink-500" />
              <span>{mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Mail className="h-5 w-5 text-pink-500" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Globe className="h-5 w-5 text-pink-500" />
              <span>{website}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailInfo;
